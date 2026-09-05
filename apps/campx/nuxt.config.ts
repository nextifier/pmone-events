import { fileURLToPath } from "node:url";
import {
  dynamicRoutePaths,
  legacyExperienceRedirects,
  sitemapUrls,
} from "./app/data/routes";

/**
 * Pages this app serves from the base layer. Everything else the base layer
 * contributes is dropped in `hooks: pages:extend` below.
 *
 * campx has no exhibitors, no tickets, no hotels, no editions and no event
 * rundown, so ~26 inherited route records would answer 200 with an empty shell.
 * Two of them actively conflict with this app's own tree: `[edition]/brands`
 * and `[edition]/rundown` sit at the same depth as `[location]`, and vue-router
 * ranks a static segment above a dynamic one — so `/jatiluhur/rundown` would
 * render the edition rundown instead of 404ing, and a package could never be
 * called "rundown" or "brands".
 */
const KEEP_BASE_PAGES = new Set(["/links"]);
const KEEP_BASE_PREFIXES = ["/news", "/f/"];

export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://campx.id",
      // The instance this site belongs to. NUXT_PUBLIC_API_URL in the build
      // environment overrides it; leaving both unset fails the build.
      apiUrl: "https://api.pmone.id",
      turnstileSiteKey: "0x4AAAAAADpOkX83QOOwxmmc",
      blogUsernames: "campx.blog",
    },
  },

  // "Jatiluhur" is out of the site name since Aug 2026: it is one of two
  // branches now, and leaving it here would poison every "%s · %siteName"
  // title with the wrong location.
  app: {
    head: {
      title: "CampX Holiday Park",
    },
  },

  colorMode: { preference: "light", fallback: "light" },

  site: {
    url: "https://campx.id",
    name: "CampX Holiday Park",
  },

  // Redundant with the base layer, which disables nuxt-schema-org for all 16
  // apps: its unhead plugin is incompatible with unhead v3 / Nuxt 4.5 and
  // crashes head rendering (see layers/base/modules/schema-org-stubs.ts).
  // Kept explicit so nobody "fixes" this app by flipping it on. JSON-LD is
  // emitted as raw useHead scripts instead — see app/composables/useJsonLd.ts.
  schemaOrg: {
    enabled: false,
  },

  // Single locale, Indonesian. The site has always been written in Indonesian;
  // it was just declared as `en`, so every page shipped `<html lang="en">`.
  //
  // `strategy: "prefix_except_default"` with one locale that IS the default
  // means every URL stays unprefixed — no /id/* duplicates, nothing to redirect.
  // The base layer's id.ts covers 300 keys; the app file only adds what it does
  // not have (see i18n/locales/id.ts).
  i18n: {
    locales: [
      {
        code: "id",
        language: "id-ID",
        name: "Indonesia",
        files: ["../../../../layers/base/i18n/locales/id.ts", "id.ts"],
      },
    ],
    langDir: "../i18n/locales",
    baseUrl: "https://campx.id",
    defaultLocale: "id",
    strategy: "prefix_except_default",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_locale",
      redirectOn: "root",
      alwaysRedirect: false,
      fallbackLocale: "id",
    },
    vueI18n: "./i18n.config.ts",
    compilation: {
      strictMessage: false,
    },
  },

  gtag: {
    tags: [{ id: "G-QH1BX5M3WH" }],
  },

  hooks: {
    /**
     * Keep this app's own pages plus the short allowlist above; drop the rest.
     *
     * Matching is on `page.file`, not `page.path`: the file path is stable
     * across Nuxt versions, while the dynamic-segment path format is not
     * (`/[location]` vs `/:location()`), and a regex that stops matching would
     * silently prune the whole location tree.
     *
     * `static-pages` hooks `pages:resolved`, which runs after every
     * `pages:extend`, so a route dropped here can never reach the prerender
     * queue. Pruned URLs simply 404, and 404s are never edge-cached.
     */
    "pages:extend"(pages) {
      const appPages = fileURLToPath(new URL("./app/pages/", import.meta.url));

      const keep = (page: { path: string; file?: string }) =>
        Boolean(page.file?.startsWith(appPages)) ||
        KEEP_BASE_PAGES.has(page.path) ||
        KEEP_BASE_PREFIXES.some((prefix) => page.path.startsWith(prefix));

      const filter = (list: typeof pages): typeof pages =>
        list.filter((page) => {
          if (page.children?.length) {
            page.children = filter(page.children);
          }
          return keep(page);
        });

      const kept = filter(pages);
      pages.length = 0;
      pages.push(...kept);
    },
  },

  // The base list names /winner, /tickets/checkout, /tickets/result and
  // /hotels/success. All four are pruned above, so robots.txt would be
  // advertising URLs that do not exist.
  robots: {
    disallow: [],
  },

  /**
   * `/jatiluhur`, `/cikidang` and all 24 package pages carry a `[param]`, so
   * `static-pages` skips them and they would run SSR on the Worker forever.
   * Seeding them here turns each into a flat file served from Static Assets.
   *
   * The list is derived from `app/data`, never hand-written: the same module
   * feeds `definePageMeta({ validate })` on those pages, and a seeded route
   * whose validate says 404 hard-fails the build.
   */
  staticPages: {
    extra: dynamicRoutePaths(),
  },

  /**
   * The `nuxt:prerender` sitemap source reads `_prerenderedRoutes` from a
   * `nitro:config` virtual module evaluated before prerendering runs, and its
   * handler early-returns because `crawlLinks` is false — so seeded routes never
   * reach the sitemap on their own. Static file-based pages still come from the
   * `nuxt:pages` source, which reads the route table after pruning.
   */
  sitemap: {
    urls: sitemapUrls(),
  },

  /**
   * Old URLs. Every `/experiences/<slug>` rule is generated from that package's
   * own `legacySlug`, so renaming a slug can never orphan its redirect.
   *
   * `statusCode` MUST sit inside `redirect`. As a sibling key nitro does not
   * read it and every one of these silently becomes a 307.
   */
  routeRules: {
    ...legacyExperienceRedirects(),
    "/experiences": { redirect: { to: "/paket", statusCode: 301 } },
    "/contact": { redirect: { to: "/kontak", statusCode: 301 } },
    "/gallery": { redirect: { to: "/galeri", statusCode: 301 } },
    // The legal pages kept English slugs while the rest of the site moved to
    // Indonesian ones. They are linked from other sites and from PM One, so the
    // old paths stay alive as permanent redirects.
    "/privacy": { redirect: { to: "/kebijakan-privasi", statusCode: 301 } },
    "/terms": { redirect: { to: "/syarat-ketentuan", statusCode: 301 } },
    // Anything else that used to live under /experiences lands on the catalog
    // rather than a 404. Exact keys above are matched first.
    "/experiences/**": { redirect: { to: "/paket", statusCode: 301 } },
  },

  // The base defaults are empty strings plus a near-black theme colour, which
  // is wrong for a light-mode app: an installed CampX would show a blank name
  // and a dark splash.
  pwa: {
    manifest: {
      name: "CampX Holiday Park",
      short_name: "CampX",
      description:
        "Camping, glamping, rafting, dan outing di Jatiluhur (Purwakarta) dan Cikidang (Sukabumi).",
      theme_color: "#ffffff",
      background_color: "#ffffff",
    },
  },

  // Plan 015: /book-space no longer 500s (base VisitorCta/BrandList/etc. now
  // guard missing `components.*` keys instead of throwing - see
  // plans/015-content-contract-and-campx-500.md). Restored to prerender +
  // crawl like every other app; it now renders ContactForm's generic
  // "Contact us" fallback (this app's content store defines no bookSpace
  // copy). Revisit if CampX decides exhibitor-registration copy should be
  // added, or the route should be hidden/redirected instead.
  nitro: {
    // Deploy target: Cloudflare Workers (+ Static Assets), migrated from the
    // cloudflare-pages preset. deployConfig generates .output/server/wrangler.json
    // (assets binding + nodejs_compat + compat date); deploy with
    // `npx wrangler --cwd apps/campx/.output deploy`. wrangler.name sets the
    // Worker name. Base layer nitro.alias (unhead stub) merges in.
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      wrangler: {
        name: "campx",
      },
    },
  },
});
