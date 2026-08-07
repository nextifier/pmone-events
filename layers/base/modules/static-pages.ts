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
const DENY = [
  "/brands",
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

  setup(options, nuxt) {
    if (nuxt.options.dev) {
      return;
    }

    const logger = useLogger("static-pages");

    // The prerenderer calls the PM One proxies at BUILD time, and apps/*/.env is
    // gitignored — only the deployed Worker has the key. Without it here every
    // page would bake an empty/error state and the build would still report
    // success, so fail loudly instead.
    const apiKey =
      (nuxt.options.runtimeConfig as Record<string, any>)?.pmOneApiKey ||
      process.env.NUXT_PM_ONE_API_KEY;

    if (!apiKey) {
      throw new Error(
        "[static-pages] NUXT_PM_ONE_API_KEY is not set. Prerendering fetches PM One at build time; " +
          "without it every page would be baked empty. Set it as a Build variable in " +
          "Workers & Pages -> project -> Settings -> Build -> Variables and secrets.",
      );
    }

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

    const denied = new Set([
      ...DENY.filter((path) => !options.allow!.includes(path)),
      ...options.deny!,
    ]);

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
        .filter((path) => !denied.has(path))
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
      logger.info(
        `Prerendering ${seeded.length} routes (${kept} paths × ${prefixes.length + 1} locales)`,
      );
    });

    nuxt.hook("nitro:init", (nitro) => {
      nitro.hooks.hook("prerender:done", ({ failedRoutes }) => {
        const expected = new Set(seeded);
        const broken = [...failedRoutes].filter((route: any) =>
          expected.has(route.route),
        );
        if (broken.length) {
          throw new Error(
            `[static-pages] ${broken.length} seeded page(s) failed to prerender:\n` +
              broken
                .map((r: any) => `  ${r.route} — ${r.error?.message ?? "unknown error"}`)
                .join("\n") +
              "\nFix the page, or add its path to `staticPages.deny` in this app's nuxt.config.ts.",
          );
        }
      });
    });
  },
});
