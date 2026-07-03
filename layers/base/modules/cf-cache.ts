import { defineNuxtModule } from "@nuxt/kit";

/**
 * cf-cache — build-time half of the Cloudflare Pages caching strategy.
 *
 * Cuts Workers CPU billing on two fronts here:
 *  1. Prerenders truly-static pages (× every non-default locale) at build
 *     time. Prerendered HTML + their OG images (/_og/s/*) are served as
 *     static assets and never invoke the Worker.
 *  2. Collapses per-file `_routes.json` excludes into directory wildcards so
 *     the 100-rule Cloudflare limit isn't blown by prerendered page entries
 *     (it was already truncated before this module existed).
 *
 * The runtime half — `cache-control` headers that let the per-zone Cache Rule
 * edge-cache dynamic HTML + public GET APIs — lives in
 * layers/base/server/plugins/cacheControl.ts with its TTL tables in
 * layers/base/shared/cf-cache-rules.ts. Headers are set at runtime instead of
 * via routeRules because routeRules headers are all written into the
 * generated `_headers` file (100-rule Pages limit) and would knock out
 * critical rules (sw.js no-cache, /_nuxt immutable).
 *
 * Per-app knobs (app's nuxt.config.ts):
 *   cfCache: {
 *     extraStaticPages: ["/about", "/services"],
 *     // Base routes whose content store lacks the page's keys in this app
 *     // (they'd 500 during prerender AND at runtime — prerender surfaces it):
 *     skipStaticPages: ["/book-space"],
 *   }
 */

// Pages with no meaningful runtime data. Header/footer data (editions, project
// profile, event) bakes at build time — accepted staleness until next deploy.
// /faq, /links and /partners are deliberately NOT here: they SSR-await
// per-event API data (partners = media-coverage listing) → edge-cached via
// the cacheControl server plugin instead.
const STATIC_PAGES = [
  "/privacy",
  "/terms",
  "/event-policy",
  "/help-center",
  "/ticket-terms-and-conditions",
  "/ticket-refund-and-return-policy",
  "/media-partner-registration",
  "/sponsorship-registration",
  "/contact",
  "/book-space",
  "/winner",
];

// Directory wildcards for _routes.json excludes. Nitro's cloudflare-pages
// preset emits one exclude per public file, blowing the 100-rule CF limit
// (it was already truncated mid-/flags before this module). User-supplied
// wildcards suppress the matching per-file entries.
const ROUTES_EXCLUDE_WILDCARDS = [
  "/flags/*",
  "/fonts/*",
  "/icons/*",
  "/img/*",
  "/images/*",
  "/sfx/*",
  "/og/*",
  "/temp/*",
  "/screenshots/*",
  "/_i18n/*",
];

export default defineNuxtModule({
  meta: { name: "cf-cache", configKey: "cfCache" },
  defaults: {
    extraStaticPages: [] as string[],
    skipStaticPages: [] as string[],
  },
  setup(opts, nuxt) {
    const i18n: any = (nuxt.options as any).i18n || {};
    const defaultLocale: string = i18n.defaultLocale || "en";
    const prefixes: string[] = (i18n.locales || [])
      .map((l: any) => (typeof l === "string" ? l : l?.code))
      .filter((c: string) => c && c !== defaultLocale);

    const expand = (path: string): string[] => [
      path,
      ...prefixes.map((p) => `/${p}${path === "/" ? "" : path}`),
    ];

    // ---- 1. Prerender static pages (× locales) --------------------------
    const skip = new Set(opts.skipStaticPages || []);
    const pages = [...STATIC_PAGES, ...(opts.extraStaticPages || [])].filter(
      (p) => !skip.has(p),
    );
    const prerenderRoutes = pages.flatMap(expand);
    nuxt.options.nitro.prerender = {
      ...nuxt.options.nitro.prerender,
      // Explicit list only. The previous crawlLinks+ignore setup had no seed
      // ("/" was ignored) and prerendered nothing.
      crawlLinks: false,
      ignore: [],
      routes: [
        ...(nuxt.options.nitro.prerender?.routes || []),
        ...prerenderRoutes,
      ],
    };

    // ---- 2. _routes.json wildcard excludes -------------------------------
    const nitroOpts: any = nuxt.options.nitro;
    nitroOpts.cloudflare = nitroOpts.cloudflare || {};
    nitroOpts.cloudflare.pages = nitroOpts.cloudflare.pages || {};
    nitroOpts.cloudflare.pages.routes = nitroOpts.cloudflare.pages.routes || {};
    nitroOpts.cloudflare.pages.routes.exclude = [
      ...(nitroOpts.cloudflare.pages.routes.exclude || []),
      ...ROUTES_EXCLUDE_WILDCARDS,
    ];
  },
});
