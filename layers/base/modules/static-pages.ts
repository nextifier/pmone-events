import { readFileSync } from "node:fs";
import { join } from "node:path";
import { defineNuxtModule, useLogger, useNitro } from "@nuxt/kit";
import { joinURL } from "ufo";

/**
 * static-pages — prerenders every static route of this app, in every locale, so
 * the HTML is served straight from Cloudflare Workers Static Assets and the
 * Worker is never invoked. Cloudflare bills only Worker invocations, so those
 * pages become free: no request charge, no CPU time.
 *
 * WHAT IS PRERENDERED
 *
 * Every route with no dynamic segment, minus DENY below, times every configured
 * locale. Routes with a `[param]` cannot be prerendered and stay SSR by nature.
 *
 * WHAT IS NOT, AND WHY
 *
 * DENY holds the listing pages whose contents change between deploys often
 * enough that a build-time snapshot would be wrong: brands, guests, speakers,
 * rundown, news, partners, hotels. They stay SSR, keeping their markup
 * crawlable. The same data embedded on a prerendered page (the home teasers,
 * the /tickets tabs) is fetched client-side instead — see GuestList.vue,
 * Credits.vue, Hotels.vue, BrandPreview.vue, Rundown.vue.
 *
 * WHY `pages:resolved`
 *
 * It fires after every `pages:extend` handler, so apps that prune their route
 * table (iicc) have already done so and a pruned route can never end up in the
 * queue — prerendering one would hard-fail the build. It also runs after
 * `@nuxtjs/i18n` has localized the routes, though this module does not rely on
 * that: it strips any locale prefix it finds and re-expands, so the result is
 * the same either way.
 *
 * PER-APP ESCAPE HATCHES (`staticPages` in the app's nuxt.config.ts)
 *
 *     staticPages: {
 *       allow: ["/brands"],       // re-enable a DENY path this app owns
 *       deny: ["/book-space"],    // skip a page that cannot render at build time
 *       extra: ["/promo"],        // seed a route that is not a file-based page
 *     }
 *
 * Auto-registered — Nuxt scans each layer's `modules/` directory.
 */
/**
 * Paths that stay on the Worker.
 *
 * Two different reasons, and they are worth keeping apart.
 *
 * The listing pages change often enough that a build-time snapshot would be
 * wrong within the day, and they carry the content search engines index.
 *
 * `/brands` is NOT among them, and never should have been. useBrandsListing.js
 * fetches with `server: false`, so the Worker's SSR output for that route is an
 * empty shell — the markup a crawler sees is identical either way, and
 * server/api/sitemap-urls.ts already documents that the sitemap is the only
 * discovery path for brand URLs. Prerendering it produces the same bytes as a
 * static asset at zero Worker cost. Removed from DENY on 9 Aug 2026.
 *
 * The transactional pages are NOT listed here any more. They are read straight
 * off `robots.disallow` in nuxt.config.ts instead — see disallowPrefixes() below — so
 * the two lists cannot drift apart. They used to be spelled out twice, and the
 * copy that mattered was silently one entry short: /winner sat in
 * `robots.disallow` but not here, so it was prerendered, served by Cloudflare
 * Static Assets without invoking the Worker, and shipped with no
 * `X-Robots-Tag` header at all for a month. Nothing reported it.
 */
const DENY = [
  "/guests",
  "/speakers",
  "/rundown",
  "/news",
  "/partners",
  "/hotels",
];

export interface ModuleOptions {
  allow?: string[];
  deny?: string[];
  extra?: string[];
}

export default defineNuxtModule<ModuleOptions>({
  meta: { name: "static-pages", configKey: "staticPages" },
  defaults: { allow: [], deny: [], extra: [] },

  async setup(options, nuxt) {
    // `nuxt prepare` runs for all 16 apps during CI's install step, and none of
    // this applies there: it seeds prerender routes nothing will read, and its
    // API check would let one blip fail the install for every app at once.
    if (nuxt.options.dev || (nuxt.options as Record<string, any>)._prepare) {
      return;
    }

    const logger = useLogger("static-pages");

    // The prerenderer calls the PM One proxies at BUILD time, and apps/*/.env is
    // gitignored — only the deployed Worker has the key. Without it here every
    // page would bake an empty/error state and the build would still report
    // success, so fail loudly instead.
    const apiKey =
      (nuxt.options.runtimeConfig as Record<string, any>)?.apiKey ||
      process.env.NUXT_PM_ONE_API_KEY;

    if (!apiKey) {
      throw new Error(
        "[static-pages] NUXT_PM_ONE_API_KEY is not set. Prerendering fetches PM One at build time; " +
          "without it every page would be baked empty. Set it as a Build variable in " +
          "Workers & Pages -> project -> Settings -> Build -> Variables and secrets.",
      );
    }

    // Reachability check, once, before any work is done.
    //
    // `useFetch` is built to degrade: when a request fails it leaves `data` at
    // its default and parks the problem in `error`, so the page renders an empty
    // shell. At build time that shell is written to disk and served until the
    // next deploy, and nothing reports a problem — Nitro saw the page render
    // fine. On 8 Aug 2026 megabuild built while api.pmone.id was under load and
    // shipped a home page with no date, venue, edition, status or announcement:
    // 154 KB where the other 15 sites were 350 KB+, on a green build.
    //
    // This has to run HERE, in Node. The same check inside an app plugin is dead
    // code: `import.meta.prerender` is a Nitro build flag and is `undefined` in
    // the Nuxt app bundle, so the guard tree-shakes away silently.
    //
    // It must probe the SAME origin the prerenderer will use, resolved the same
    // way Nitro resolves it. This check used to hardcode api.pmone.id, and on
    // 8 Aug 2026 that made it worse than useless: megabuild's Cloudflare project
    // carried a build variable NUXT_PUBLIC_API_URL=https://api.megabuild.co.id,
    // a hostname with no origin behind it. The check passed against the wrong
    // host, then every prerender request spent 20 s waiting for a 522 — four
    // failed builds before anyone could see which URL was being called.
    const apiUrl = resolveApiUrl(nuxt);
    const activeEventTitle = await assertApiReachable(
      nuxt.options.rootDir,
      apiUrl,
      apiKey,
      logger,
    );

    nuxt.options.nitro.prerender = {
      ...nuxt.options.nitro.prerender,
      // Explicit list only. Crawling would follow links into /news/<slug> and
      // /brands/<slug> and bake thousands of detail pages.
      crawlLinks: false,
      // Write /contact.html rather than /contact/index.html. Cloudflare's
      // default `html_handling: "auto-trailing-slash"` serves the flat file at
      // /contact directly, while the subfolder form makes /contact — the URL
      // every <NuxtLink> emits — a 307 to /contact/ first.
      autoSubfolderIndex: false,
      // Nitro's own failOnError also fails the build on cosmetic /_og/s/*.png
      // render errors. The prerender:done check below is narrower: it fails only
      // on an HTML route this module seeded, and names the escape hatch.
      failOnError: false,
      concurrency: 4,
      routes: [...(nuxt.options.nitro.prerender?.routes ?? [])],
    };

    const i18n = (nuxt.options as Record<string, any>).i18n ?? {};
    const defaultLocale: string = i18n.defaultLocale || "en";
    const prefixes: string[] = (i18n.locales ?? [])
      .map((l: unknown) => (typeof l === "string" ? l : (l as { code?: string })?.code))
      .filter((code: unknown): code is string => Boolean(code) && code !== defaultLocale);

    const stripLocale = (path: string) => {
      const match = /^\/([^/]+)(\/.*)?$/.exec(path);
      return match && prefixes.includes(match[1]!) ? match[2] || "/" : path;
    };

    const expand = (path: string) => [
      path,
      ...prefixes.map((code) => (path === "/" ? `/${code}` : `/${code}${path}`)),
    ];

    let seeded: string[] = [];

    nuxt.hook("pages:resolved", (pages) => {
      // Read inside the hook, not in setup(): module setup order between a
      // layer's own modules/ and the ones listed in `modules` is not defined, so
      // @nuxtjs/robots may not have merged its config yet at setup time. By
      // pages:resolved every module has run.
      //
      // A path in `robots.disallow` must never be prerendered. Prerendered HTML
      // is served by Cloudflare Static Assets with `run_worker_first: false`,
      // which means the Worker — and with it nuxt-robots' `X-Robots-Tag`
      // middleware — never runs, so the page goes out with no noindex header on
      // it. robots.txt still asks crawlers not to fetch it, but a disallowed URL
      // with an inbound link can still be indexed URL-only, and the header is
      // the part that actually prevents that.
      //
      // Matching mirrors robots.txt itself: prefix-based, with anything from the
      // first wildcard onwards dropped. So "/tickets/" denies /tickets/checkout
      // and /tickets/<ulid> while leaving the public /tickets listing alone.
      const isDisallowed = disallowPrefixes(nuxt);

      const denied = new Set([
        ...DENY.filter((path) => !options.allow!.includes(path)),
        ...options.deny!,
      ]);

      const canonical = new Set<string>();

      const walk = (list: any[], parent = "/") => {
        for (const page of list) {
          // Nuxt injects synthetic `_sync` pages for every routeRules redirect;
          // 14 of the 16 apps have some. They are not real pages.
          if (page._sync || page.mode === "server" || page.redirect) {
            continue;
          }
          if (/[:*[]/.test(page.path)) {
            continue; // dynamic — cannot be prerendered, children included
          }
          const full = joinURL(parent, page.path);
          canonical.add(stripLocale(full));
          if (page.children?.length) {
            walk(page.children, full);
          }
        }
      };
      walk(pages);

      for (const path of options.extra!) {
        canonical.add(path);
      }

      seeded = [...canonical]
        .filter((path) => !denied.has(path) && !isDisallowed(path))
        .flatMap(expand)
        .sort();

      const nitro = useNitro();
      const already = new Set(nitro.options.prerender.routes);
      for (const route of seeded) {
        if (!already.has(route)) {
          nitro.options.prerender.routes.push(route);
        }
      }

      const kept = seeded.length / (prefixes.length + 1);
      const heldBack = [...canonical].filter(isDisallowed).sort();
      logger.info(
        `Prerendering ${seeded.length} routes (${kept} paths × ${prefixes.length + 1} locales)` +
          (heldBack.length
            ? `, holding ${heldBack.join(", ")} on the Worker so robots.disallow ` +
              "can emit X-Robots-Tag for them"
            : ""),
      );
    });

    nuxt.hook("nitro:init", (nitro) => {
      nitro.hooks.hook("prerender:done", ({ failedRoutes }) => {
        const expected = new Set(seeded);
        const broken = [...failedRoutes].filter((route: any) =>
          expected.has(route.route),
        );
        // The artefact check: watching requests is not enough, because a
        // degraded API that answers 200 with an empty body trips nothing.
        if (activeEventTitle) {
          assertEventRendered(
            nitro.options.output.publicDir,
            activeEventTitle,
            seeded.includes("/"),
            logger,
          );
        }

        if (broken.length) {
          throw new Error(
            `[static-pages] ${broken.length} seeded page(s) failed to prerender:\n` +
              broken
                .map((r: any) => `  ${r.route} — ${r.error?.message ?? "unknown error"}`)
                .join("\n") +
              "\nFix the page, or add its path to `staticPages.deny` in this app's nuxt.config.ts.",
          );
        }

        // A social card that fails to render is NOT cosmetic once pages are
        // prerendered. Its URL is baked into the HTML unsigned, and at runtime
        // nuxt-og-image answers an unsigned /_og/s/ request with 403 (or 400
        // for the hash form) rather than rendering it — so the card is broken
        // for as long as that HTML is served, where before prerendering the
        // same page asked the Worker for it and healed itself on the next
        // crawl. `failOnError: false` means Nitro drops these silently.
        const brokenCards = [...failedRoutes].filter((route: any) =>
          String(route.route ?? "").startsWith("/_og/"),
        );

        if (brokenCards.length) {
          logger.error(
            `${brokenCards.length} OG image(s) failed to render. Every page pointing at ` +
              "one ships a link that answers 403/400 until the next deploy:\n" +
              brokenCards
                .map((r: any) => `  ${r.route} — ${r.error?.message ?? "unknown error"}`)
                .join("\n"),
          );
        }
      });
    });
  },
});

/**
 * Fail the build when PM One cannot answer for this app's project.
 *
 * Reads the project straight off the app's `app.config.ts`: a module cannot see
 * app.config through `nuxt.options.appConfig` (that key is the nuxt.config one),
 * and adding a second source of truth for the username would be worse than a
 * regex over the file that already owns it.
 */
/**
 * `robots.disallow` -> a prefix test, using robots.txt's own matching rules.
 *
 * Google's spec (and @nuxtjs/robots' `matches`, dist/util.mjs) matches a rule as
 * a plain prefix of the path, with `*` standing for any run of characters and a
 * trailing `$` anchoring the end. Cutting the pattern at its first wildcard and
 * comparing prefixes is the same test for every rule this repo writes, and it
 * errs the safe way for any it does not: a pattern like `/a*b` degrades to `/a`,
 * which denies more, never less.
 *
 * The trailing slash carries meaning here exactly as it does in robots.txt.
 * `/tickets/` denies /tickets/checkout and /tickets/<ulid> but not /tickets,
 * because /tickets is shorter than the prefix.
 */
function disallowPrefixes(nuxt: Nuxt): (path: string) => boolean {
  const rules: string[] = (nuxt.options as Record<string, any>).robots?.disallow ?? [];

  // Loud on purpose. If @nuxtjs/robots ever moves this key, or a layer drops it,
  // the read above quietly yields [] and every noindex path silently goes back
  // to being prerendered without an X-Robots-Tag — which is the exact bug this
  // function exists to prevent, and it would look like a green build.
  if (!rules.length) {
    throw new Error(
      "[static-pages] `robots.disallow` is empty or unreadable at pages:resolved. " +
        "It is the source of truth for which pages must not be prerendered " +
        "(a prerendered page is served by Static Assets and never gets an " +
        "X-Robots-Tag). Restore it in layers/base/nuxt.config.ts.",
    );
  }

  const prefixes = rules
    .map((rule) => String(rule).split(/[*$]/)[0])
    .filter((prefix): prefix is string => Boolean(prefix) && prefix !== "/");

  return (path: string) =>
    prefixes.some((prefix) => path === prefix || path.startsWith(prefix));
}

/**
 * The API origin the prerenderer will actually call.
 *
 * Nitro resolves `runtimeConfig.public.apiUrl` from `NUXT_PUBLIC_API_URL` when
 * that variable exists in the environment, which during a Cloudflare build it
 * does — so the value in nuxt.config is only half the answer. Reading it the
 * same way here is the whole point: a guard that probes a different host than
 * the build uses cannot catch a wrong host.
 */
function resolveApiUrl(nuxt: Nuxt): string {
  const configured = (nuxt.options.runtimeConfig as Record<string, any>)?.public
    ?.apiUrl;
  const url = process.env.NUXT_PUBLIC_API_URL || configured;

  if (!url) {
    throw new Error(
      "[static-pages] No API URL resolved from runtimeConfig.public.apiUrl or " +
        "NUXT_PUBLIC_API_URL. Prerendering cannot fetch PM One without one.",
    );
  }

  return String(url).replace(/\/+$/, "");
}

async function assertApiReachable(
  rootDir: string,
  apiUrl: string,
  apiKey: string,
  logger: ReturnType<typeof useLogger>,
): Promise<string | null> {
  const source = readFileSync(join(rootDir, "app/app.config.ts"), "utf8");
  const project =
    /dataSourceUsername:\s*"([^"]+)"/.exec(source)?.[1] ||
    /projectUsername:\s*"([^"]+)"/.exec(source)?.[1];

  if (!project) {
    throw new Error(
      "[static-pages] Could not read projectUsername from app/app.config.ts, so " +
        "the PM One reachability check cannot run. Prerendering without it risks " +
        "baking empty pages.",
    );
  }

  const url = `${apiUrl}/api/public/projects/${project}/events/active`;

  // Always name the origin, success or failure. Four builds died before anyone
  // could see that this one was pointed at a hostname with no server behind it.
  logger.info(`PM One API: ${apiUrl}`);

  // Same retry policy as pmOneFetch: api.pmone.id drops out for a second or two
  // at a time, and a single blip must not fail a build that would otherwise be
  // perfectly correct. Only a sustained outage is fatal.
  const ATTEMPTS = 4;
  let response: Response | null = null;
  let lastProblem = "";

  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      response = await fetch(url, {
        headers: { "X-API-Key": apiKey },
        signal: AbortSignal.timeout(30_000),
      });

      // 404 is a legitimate answer: a project between editions has no active
      // event, and the corporate sites never have one. Anything else in the
      // 4xx range is a real answer too — retrying an auth failure is pointless.
      if (response.ok || response.status < 500) {
        break;
      }
      lastProblem = `HTTP ${response.status}`;
    } catch (error) {
      lastProblem = (error as Error).message;
      response = null;
    }

    if (attempt === ATTEMPTS) {
      throw new Error(
        `[static-pages] PM One still unavailable after ${ATTEMPTS} attempts ` +
          `(${lastProblem}). Every prerendered page would be baked without its ` +
          "event data. Refusing to build — retry when the API is healthy.",
      );
    }

    const delay = 2000 * attempt;
    logger.warn(`PM One check failed (${lastProblem}), retrying in ${delay}ms`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  if (!response!.ok && response!.status !== 404) {
    throw new Error(
      `[static-pages] PM One answered ${response!.status} for ${project}'s active ` +
        "event. Every prerendered page would be baked without it. Refusing to " +
        "build — retry when the API is healthy.",
    );
  }

  const status = response!.status;

  if (status === 404) {
    logger.info(`PM One reachable for "${project}" (no active event)`);
    return null;
  }

  const title = ((await response!.json()) as { data?: { title?: string } })?.data?.title ?? null;
  logger.info(`PM One reachable for "${project}" (active event: ${title ?? "untitled"})`);

  return title;
}

/**
 * If PM One says this project HAS an active event, the built home page must
 * show it.
 *
 * This is the end-to-end check the other guards cannot make. They watch the
 * requests; this watches the artefact. A degraded API that answers 200 with an
 * empty body trips no retry, throws no error and produces a page that looks
 * fine to every layer above it — which is precisely how megabuild shipped a
 * home page with no dates, venue or edition, twice, on green builds.
 */
function assertEventRendered(
  publicDir: string,
  eventTitle: string,
  homeWasSeeded: boolean,
  logger: ReturnType<typeof useLogger>,
): void {
  if (!homeWasSeeded) {
    return; // this app prunes "/" (iicc); nothing to assert
  }

  const home = join(publicDir, "index.html");

  let html: string;
  try {
    html = readFileSync(home, "utf8");
  } catch (error) {
    // Never swallow this. If "/" was seeded the file must exist, so an
    // unreadable path means the guard is pointed at the wrong directory — and a
    // guard that silently passes is worse than no guard at all.
    throw new Error(
      `[static-pages] Cannot read the prerendered home page at ${home} ` +
        `(${(error as Error).message}), so its event data cannot be verified.`,
    );
  }

  if (html.includes(eventTitle)) {
    logger.success(`Home page renders the active event ("${eventTitle}")`);
    return;
  }

  throw new Error(
    `[static-pages] PM One reports an active event ("${eventTitle}") but the ` +
      "prerendered home page does not mention it, so it was built without its " +
      "event data. That page would be served until the next deploy. Refusing to " +
      "ship it — retry when PM One is healthy.",
  );
}
