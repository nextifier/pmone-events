import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * The backend this site talks to. Development always means the local API;
 * production must be told, because guessing here is how a site quietly serves
 * another instance's data.
 */
function apiUrlFromEnvironment(): string {
  if (process.env.NODE_ENV !== "production") {
    return process.env.NUXT_PUBLIC_API_URL || "http://localhost:8000";
  }

  const configured = process.env.NUXT_PUBLIC_API_URL;

  if (!configured) {
    throw new Error(
      "NUXT_PUBLIC_API_URL is not set. A production build must name the API it talks to " +
        "(https://api.<instance-domain>); there is no default to fall back to.",
    );
  }

  return configured.replace(/\/+$/, "");
}

export default defineNuxtConfig({
  devtools: {
    // Off: Nuxt DevTools' vite-plugin-inspect injects a @vueuse useColorMode onto
    // <html> that fights @nuxtjs/color-mode (dev-only color-mode desync).
    enabled: false,
    componentInspector: false,
  },

  ignore: ["**/.DS_Store", "**/.DS_Store/**"],

  runtimeConfig: {
    // NUXT_PM_ONE_API_KEY is the historical name and still honoured: every
    // site's build environment sets it, and renaming a build variable and the
    // code reading it in one step breaks whichever site rebuilds second.
    apiKey: process.env.NUXT_API_KEY || process.env.NUXT_PM_ONE_API_KEY || "",
    tiktokAccessTokens: process.env.NUXT_TIKTOK_ACCESS_TOKENS || "",
    // Cloudflare Turnstile secret (server-side siteverify). When empty, the
    // contact form skips captcha verification entirely (safe to deploy first).
    turnstileSecret: process.env.NUXT_TURNSTILE_SECRET || "",

    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000",
      // No production default. This layer serves sites for more than one
      // instance now, and a baked-in host would send a new client's site to the
      // wrong backend without any error - the build would succeed and every
      // request would 401. Each site's build environment names its API.
      apiUrl: apiUrlFromEnvironment(),
      blogUsernames: "",
      // Cloudflare Turnstile site key (public). When empty, the widget is not
      // rendered and the form behaves exactly as before.
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || "",
    },
  },

  app: {
    head: {
      // `interactive-widget=resizes-content` shrinks the layout viewport when
      // the software keyboard opens, so anything anchored to the bottom edge —
      // Drawer, ResponsiveDialog, Sheet — rises above it with no JavaScript at
      // all. Without it browsers fall back to `resizes-visual` and the keyboard
      // covers the panel. WebKit has never implemented the descriptor, so iOS
      // still needs the `useDrawerVirtualKeyboard` fallback in ui/drawer.
      //
      // Declared as a `meta` entry rather than `app.head.viewport`: Nuxt fills
      // in a default `viewport` at app level, and defu lets that default win
      // over a layer's value. A tag in the array is deduped by name instead.
      htmlAttrs: {
        translate: "no",
      },
      meta: [
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1, interactive-widget=resizes-content",
        },
        { name: "google", content: "notranslate" },
        // iOS ignores the manifest's `display`, so without these an
        // Add-to-Home-Screen launch opens a plain Safari tab instead of a
        // standalone window. "black" (not "black-translucent") keeps the status
        // bar out of the layout, so no safe-area padding is needed.
        // apple-mobile-web-app-title is deliberately omitted: it would be wrong
        // for 15 of the 16 apps, and iOS falls back to the manifest short_name.
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "black" },
      ],
      link: [
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/icons/apple-touch-icon.png",
        },
        // Preload the variable font used for the hero headline (LCP text). The
        // crossorigin attr is required so this matches the CORS font fetch.
        {
          rel: "preload",
          as: "font",
          type: "font/woff2",
          href: "/fonts/MinusOne-VF.woff2",
          crossorigin: "",
        },
      ],
      script: [],
    },
  },

  css: [],

  // Production-only: cssnano runs postcss-calc, whose grammar predates CSS
  // relative color syntax. Every style-*.css scales chroma with
  // `oklch(from var(--primary) 0.93 calc(c * 0.4) h)`, and main.css does the
  // same with `calc(alpha * 0.2)` / `calc(l + 0.4)`. postcss-calc cannot lex a
  // bare channel keyword as a calc operand, throws, catches its own throw, and
  // warns — 22 "Lexical error on line 1: Unrecognized text" per build, in every
  // one of the 16 apps. The declaration is left untouched either way, so the
  // pass buys nothing here: every other calc() Tailwind emits references a CSS
  // variable, which postcss-calc cannot fold at build time either. Turning the
  // one sub-plugin off keeps the rest of the cssnano preset intact.
  // Set under $production so `nuxt build` AND `nuxt generate` both get it while
  // dev keeps Nuxt's own default of skipping cssnano entirely.
  $production: {
    postcss: {
      plugins: {
        cssnano: { preset: ["default", { calc: false }] },
      },
    },
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // vue-sonner menyimpan state toast di module scope; pnpm bisa membuat
      // beberapa salinan fisik versi yang sama (peer-hash berbeda) sehingga
      // layer dan app ter-resolve ke real path berbeda. Di build produksi itu
      // menjadi dua instance state — toast() menulis ke instance yang tidak
      // di-subscribe Toaster dan tidak ada toast yang tampil. dedupe memaksa
      // satu resolusi untuk semua importer.
      dedupe: ["vue-sonner"],
    },
    optimizeDeps: {
      // "@unhead/schema-org/vue" deliberately absent from `include`: the module
      // is disabled (unhead v3 incompatibility, see useEventSchema.js) and the
      // alias only exists while it is enabled, so pre-bundling would fail.
      include: [
        "embla-carousel-vue",
        "embla-carousel-autoplay",
        "embla-carousel-auto-scroll",
        "embla-carousel-wheel-gestures",
        "gsap",
        "gsap/ScrollTrigger",
        "gsap/SplitText",
        "gsap/Flip",
        "vue-scrollto",
        "@number-flow/vue",
        "vue-tippy",
        "v-wave",
        "class-variance-authority",
        "dayjs",
        "dayjs/plugin/relativeTime",
        "dayjs/plugin/customParseFormat",
        "vue-sonner",
        "reka-ui",
        "clsx",
        "tailwind-merge",
        "@lucide/vue",
        // No @vue/devtools-* entries: devtools is disabled above, so
        // pre-bundling them is work for code that never loads.
      ],
    },
  },

  modules: [
    // The local `cf-cache` module was removed on 23 Jul 2026. It did two things,
    // both obsolete: it prerendered 11 static pages (which baked the
    // dashboard-managed nav/appearance payload into them, so nav edits needed a
    // rebuild — those pages are now SSR + edge-cached instead), and it wrote
    // `_routes.json` excludes, which only the `cloudflare-pages` preset reads
    // and became dead code when the deploy preset moved to `cloudflare_module`.
    // Nothing replaced it: HTML is no longer cached at the edge at all (see
    // server/plugins/cacheControl.ts).
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxtjs/color-mode",
    "@nuxtjs/i18n",
    "shadcn-nuxt",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@nuxtjs/seo",
    "nuxt-gtag",
    "@formkit/auto-animate/nuxt",
    "@vite-pwa/nuxt",
    "nuxt-vitalizer",
  ],

  vitalizer: {
    // Strip the <link rel="prefetch"> tags Nuxt emits for every dynamic-import
    // chunk. They download JS the current page never runs (PageSpeed: "Reduce
    // unused JavaScript"). Navigation still works — chunks load on demand.
    disablePrefetchLinks: true,
  },

  fonts: {
    families: [
      {
        name: "MinusOne",
        src: "/fonts/MinusOne-VF.woff2",
        weight: "400 1000",
        display: "swap",
      },
    ],
  },

  icon: {
    mode: "svg",
    clientBundle: {
      scan: true,
      // Names the template scanner cannot see because they are built at
      // runtime from JS maps or dashboard data (SOCIAL_ICON_MAP in
      // useProjectProfile, brand-view toggles, locale switcher…). Without
      // this, every visitor's browser fetched them from /api/_nuxt_icon at
      // runtime — ~55k requests/day across the sites (measured 24 Jul 2026).
      // The endpoint itself stays enabled as the fallback for icon names that
      // only exist in dashboard content; do NOT "optimise" it away with
      // fallbackToApi:false (that breaks those icons — see the daily log).
      icons: [
        "hugeicons:instagram",
        "hugeicons:facebook-01",
        "hugeicons:new-twitter-rectangle",
        "hugeicons:tiktok",
        "hugeicons:linkedin-01",
        "hugeicons:youtube",
        "hugeicons:link-02",
        "hugeicons:grid-view",
        "hugeicons:layout-grid",
        "hugeicons:layout-table-01",
        "hugeicons:ticket-01",
        "hugeicons:sidebar-right-01",
        "hugeicons:clock-02",
        "ri:instagram-line",
        "lucide:languages",
        "lucide:x",
        "lucide:menu",
        "lucide:search",
        "lucide:check",
        "lucide:loader",
      ],
    },
  },

  shadcn: {
    prefix: "",
    componentDir: resolve(__dirname, "app/components/ui"),
  },

  colorMode: {
    preference: "dark",
    fallback: "dark",
    classSuffix: "",
    hid: "color-mode-script",
    globalName: "__COLOR_MODE__",
    // Cookie storage (not localStorage) so the preference is readable during SSR
    // → html class + colorMode.value resolve synchronously, no flash/desync.
    // App-scoped key avoids clobbering across apps on the dev localhost origin.
    storage: "cookie",
    storageKey: "events-color-mode",
  },

  image: {
    provider: process.env.NODE_ENV === "production" ? "cloudflare" : "ipx",
    quality: 85,
    format: ["webp"],
  },

  ogImage: {
    // No `defaults.renderer` here: v6 dropped both `defaults.component` and
    // `defaults.renderer` (`ModuleOptions.defaults` is
    // `Omit<OgImageOptions, 'component' | 'renderer' | …>`). The renderer comes
    // from the `.takumi` filename suffix of OgImage/Page.takumi.vue.
    //
    // Signing secret for the /_og render URLs. The module reads it from HERE
    // (module option `security.secret`) or `process.env.NUXT_OG_IMAGE_SECRET`
    // — a `runtimeConfig.ogImage.secret` entry is NOT picked up. Without an
    // explicit value it generates a random secret every build, which warns in
    // dev and breaks rolling/multi-instance deploys (instances would sign with
    // different secrets). The committed fallback keeps it stable; override per
    // deploy with NUXT_OG_IMAGE_SECRET.
    security: {
      secret:
        process.env.NUXT_OG_IMAGE_SECRET ||
        "04045fc080f032a4186ccdc13922dd2fe6276b1a76d5825f5c52f16ecf240b59",
    },
    // 30 days. The module self-injects `public, max-age, s-maxage, immutable`
    // routeRules on /_og/d/** with this TTL — do NOT hand-write /_og/**
    // routeRules or that injection is skipped. OG URLs hash their props, so
    // long-lived immutable caching is self-busting when content changes.
    cacheMaxAgeSeconds: 60 * 60 * 24 * 30,
  },

  /**
   * Brand detail pages skip server rendering entirely.
   *
   * WHY. Measured 10 Aug 2026 across the estate: /brands/[slug] is 100%
   * unknown user-agents — crawlers, not one real browser — and its edge-cache
   * hit rate is 4.5% against 63.9% for /news/[slug]. The reason is structural:
   * megabuild alone has thousands of brand URLs times five locales, and the
   * Cloudflare cache is per data centre, so a tail that long never warms. We
   * were paying a full ~300 ms Vue render, per colo, per URL, to feed crawlers.
   *
   * With `ssr: false` Nitro takes getSPARenderer()
   * (@nuxt/nitro-server/dist/runtime/utils/renderer/build-files.mjs:34-64):
   * Vue is never invoked, the 4.3 MB server bundle is never imported, and the
   * shell string is computed once and memoised for the isolate's lifetime.
   * Milliseconds instead of hundreds, and ~10 KB instead of 140 KB. The page
   * itself needs no change — its fetch already has no `server: false`, and it
   * already renders a skeleton while pending.
   *
   * Accepted: no <title>, og:image or link preview in the delivered HTML, and
   * a dead slug answers 200 + shell rather than 404. The page sets a noindex
   * meta itself in that case (see pages/brands/[slug].vue).
   *
   * `*` NOT `**`. radix3 maps `/brands/**` to the key `/brands` and matches it
   * exactly (dist/index.mjs:216,244), which would drag in the PRERENDERED
   * listing — and `ssr: false` does not disable prerendering
   * (nitropack/dist/core/index.mjs:2047 only checks `prerender === false`), so
   * the build would bake an empty shell into dist/brands.html. `*` takes the
   * placeholder branch, which requires a following segment.
   *
   * Route rules are locale-blind (nitropack/dist/runtime/internal/route-rules.mjs:68-79),
   * so one segment of wildcard covers `/id|zh|ja|ko/brands/x` AND the edition
   * form `/2025/brands/x`; two cover `/id/2025/brands/x`.
   *
   * panorama-media overrides this back to `ssr: true` — its brand pages are its
   * own content, read from a local store with no API call, so rendering them is
   * already free and they carry real copy worth indexing.
   */
  routeRules: {
    "/brands/*": { ssr: false },
    "/*/brands/*": { ssr: false },
    "/*/*/brands/*": { ssr: false },
  },

  site: {
    // EXPLICIT ON PURPOSE. nuxt-robots derives indexability as
    // `site.indexable ?? (site.env === "production")`, and `site.env` comes from
    // NODE_ENV at build time — supplied only by each app's `build` script
    // ("NODE_ENV=production nuxt build"). Any build that misses that script
    // (`nuxt build` by hand, a CI job calling a different script, an edited
    // Cloudflare build command) bakes `env: "development"`, and nuxt-robots then
    // emits `Disallow: /` plus `X-Robots-Tag: noindex, nofollow` on every page —
    // silently, with no error. That is exactly the shape of "all our sites
    // vanished from Google". Stating it here removes the landmine; canonical
    // URLs still point at each app's `site.url`, so a preview deployment cannot
    // outrank production.
    indexable: true,
  },

  robots: {
    // /winner is a utility tool (random winner generator), intentionally kept
    // out of search. Terms & Privacy are crawlable so they can score SEO 100.
    //
    // Everything under `/tickets/`, plus the two `/hotels/` paths, is
    // per-visitor. `/tickets/checkout` is a cart, `/tickets/result` a payment
    // outcome, `/tickets/<ulid>` one attendee's e-ticket, and
    // `/tickets/order/<token>` and `/hotels/reservation/<token>` are magic links
    // mailed to a single buyer. `/hotels/success` is a booking confirmation.
    // None of them holds anything a searcher wants; a stale one sends people to
    // a dead order, and an indexed magic link hands a stranger someone else's
    // booking. The first three were fixed on 6 Aug 2026 (3 paths x 5 locales x
    // 16 sites of `index, follow`); the token routes were missed then and were
    // still serving `X-Robots-Tag: index, follow` on 4 Sep 2026.
    //
    // THE TRAILING SLASH ON "/tickets/" IS LOAD-BEARING. robots.txt matching is
    // prefix-based (@nuxtjs/robots dist/util.mjs `matches`), so `/tickets/`
    // covers every child — including the two token routes, which have no static
    // prefix to name — while the public listing at `/tickets` stays indexable,
    // because a path shorter than the pattern cannot match. Writing `/tickets`
    // instead would de-index the listing. Nothing public lives below it:
    // verified that no app adds a page of its own under `/tickets/`.
    //
    // Listing a path here does FOUR jobs, so do not restate it anywhere else:
    // nuxt-robots locale-expands it into robots.txt, emits `X-Robots-Tag:
    // noindex` for it, feeds the exclusion into @nuxtjs/sitemap (verified:
    // /winner appears in zero sitemaps), and modules/static-pages.ts reads this
    // same array to keep the path off the prerender queue. That last one is not
    // cosmetic: a prerendered page is served straight from Cloudflare Static
    // Assets with `run_worker_first: false`, so the Worker never runs and the
    // page ships with NO `X-Robots-Tag` at all. /winner was in exactly that
    // state until 4 Sep 2026.
    disallow: [
      "/winner",
      "/tickets/",
      "/hotels/reservation",
      "/hotels/success",
    ],
    // NO AI-crawler group, ON PURPOSE.
    //
    // `groups: [{ userAgent: ["Google-Extended"], disallow: ["/"] }]` lived here
    // from 6 Aug to 4 Sep 2026 as the in-code replacement for Cloudflare's
    // "Block AI training crawlers" rule. That rule had to go because it cannot
    // tell Google-Extended from Googlebot — same user agent, same IPs — and was
    // answering 1,200-1,800 real Googlebot requests a day with 403 across all 28
    // zones, de-indexing 612 pages on franchise-expo.co.id alone.
    //
    // The opt-out itself was never a decision, though: it was a Cloudflare
    // default that got faithfully reimplemented. Per Google's own documentation
    // the token governs only training and grounding for Gemini Apps and Vertex
    // AI ("Google-Extended does not impact a site's inclusion in Google Search
    // nor is it used as a ranking signal"), so blocking it cost nothing in
    // Search but did keep these sites out of Gemini's answers. These are event
    // marketing sites whose entire job is to be found, there is no content worth
    // withholding, and every other AI crawler — GPTBot, ClaudeBot,
    // PerplexityBot, Bytespider, Meta-ExternalAgent — was allowed through
    // regardless. The group shut out the one vendor that sends traffic back.
    //
    // IF AI CRAWLERS SHOULD BE BLOCKED AGAIN, ADD A `groups` ENTRY HERE. Do NOT
    // re-enable the Cloudflare dashboard's AI-training setting: that is the
    // control that caused the August outage, and its state does not live in git.
  },

  sitemap: {
    sources: ["/api/sitemap-urls"],
  },

  schemaOrg: {
    enabled: false,
  },

  linkChecker: {
    enabled: false,
  },

  // nuxt-seo-utils. `minify` defaults to true, which installs an unhead
  // `ssr:render` hook that re-minifies every inline <script>/<style> on EVERY
  // render. It buys us nothing: the three ld+json blocks are already
  // JSON.stringify output, and the color-mode script is minified by the
  // bundler. Only the runtime half is turned off — the build half still
  // minifies the static head once, for free.
  seo: {
    minify: { runtime: false },
  },

  gtag: {
    // Manual init: the baked `id`/`tags` below (set per app, e.g.
    // apps/campx/nuxt.config.ts) are used only as a *fallback* value. The
    // single init point is layers/base/app/plugins/analytics.client.ts
    // (plan 009), which resolves the dashboard-managed
    // `site_config.analytics.ga4` (falling back to this baked id) and calls
    // `useGtag().initialize()` itself. Auto-init must stay off here so that
    // plugin is the only place `gtag.js` ever gets loaded - no double-count.
    initMode: "manual",
    loadingStrategy: "defer",
  },

  i18n: {
    lazy: true,
    langDir: "../i18n/locales",
    defaultLocale: "en",
    strategy: "prefix_except_default",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_locale",
      // "root" (not "all"): with "all" + alwaysRedirect, a locale-prefixed URL
      // could still redirect based on the i18n_locale cookie — the response for
      // a given URL would then vary by cookie. Only "/" negotiates locale, so
      // every other URL renders exactly what its path says. All 16 apps already
      // override to "root"; this default just stops a new app from silently
      // reintroducing the hazard.
      redirectOn: "root",
      alwaysRedirect: true,
      fallbackLocale: "en",
    },
  },

  pwa: {
    registerType: "autoUpdate",
    registerWebManifestInRouteRules: true,
    manifest: {
      // Explicit id, so the app identity survives a future start_url change —
      // without it Chrome derives identity from start_url and would treat an
      // updated one as an entirely new app.
      id: "/",
      name: "",
      short_name: "",
      start_url: "/",
      display: "standalone",
      theme_color: "#09090b",
      background_color: "#09090b",
      description: "",
      // Absolute hrefs: relative ones resolve against the manifest's location,
      // which happens to be correct at the root but breaks under any other scope.
      // No maskable entry: every app ships full-bleed illustrated artwork, which
      // needs a per-brand redraw rather than a mechanical rescale.
      icons: [
        {
          src: "/icons/icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/icons/icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    workbox: {
      cleanupOutdatedCaches: true,
      // autoUpdate memaksa skipWaiting+clientsClaim true (vite-plugin-pwa), lalu
      // auto-reload halaman saat SW baru aktif → transisi build ditangani reload
      // + plugin chunkReload.client.js sebagai jaring pengaman.
      skipWaiting: true,
      clientsClaim: true,
      navigateFallback: null,
      // JANGAN precache html: route SSR selalu fresh dari network → referensi
      // chunk selalu current. Cegah SW serve HTML basi yang nunjuk chunk lama (404).
      globPatterns: ["**/*.{js,css,png,svg,ico}"],
      // OG images (prerendered by nuxt-og-image into /_og/s/) are only ever
      // fetched by social crawlers — never precache them to visitors.
      globIgnores: ["**/_og/**"],
    },
    // No injectManifest block: `strategies` is unset, so vite-plugin-pwa runs
    // generateSW and reads `workbox` above — an injectManifest block would never
    // be read.
    client: {
      // The plugin calls preventDefault() on beforeinstallprompt whenever this
      // is true, which suppresses the browser's own install affordance. Flip it
      // back to true ONLY together with a component that consumes
      // $pwa.showInstallPrompt / $pwa.install(); until then, `false` leaves the
      // mini-infobar (Android) and address-bar install icon (desktop) in place.
      installPrompt: false,
    },
    devOptions: {
      enabled: false,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: "module",
    },
  },

  nitro: {
    // `nitro.prerender` is owned entirely by modules/static-pages.ts — one
    // owner, so the route list and the flags around it cannot disagree.

    cloudflare: {
      wrangler: {
        assets: {
          // Canonical URL has no trailing slash, matching what <NuxtLink>
          // emits, so a prerendered /contact.html is served at /contact with no
          // redirect hop. Pairs with `autoSubfolderIndex: false`.
          html_handling: "drop-trailing-slash",
          // MUST stay "none". Anything else makes the asset router answer paths
          // that have no file — which is every SSR route — and the Worker would
          // never see them.
          not_found_handling: "none",
          // Assets win, so a prerendered page never invokes the Worker. This is
          // the whole point: Cloudflare bills invocations, not asset reads.
          run_worker_first: false,
        },
      },
    },

    alias: {
      // Nuxt 4.5 statically imports unhead's SSR-streaming IIFE (a JS module
      // exporting the whole script as one big string) even when ssrStreaming is
      // off. Nitro's replace plugin rewrites `typeof window` INSIDE that string,
      // breaking its quote escaping and failing the server build with
      // "RollupError: Expected a semicolon". Streaming is disabled here, so the
      // module is dead code — stub it out until nitro/unhead fix this upstream.
      "@unhead/vue/stream/iife": resolve(__dirname, "./mock/unhead-stream-iife.mjs"),
      "unhead/stream/iife": resolve(__dirname, "./mock/unhead-stream-iife.mjs"),
    },
  },

  compatibilityDate: "2025-05-01",

  experimental: {
    viewTransition: true,
    appManifest: false,
    emitRouteChunkError: "automatic-immediate",
    // Keep the payload INLINE in each prerendered page. Seeding
    // nitro.prerender.routes would otherwise switch extraction on, which writes
    // a _payload.json per route and makes hydration wait on an extra fetch —
    // while client-side navigation could never use those payloads anyway,
    // because shouldLoadPayload() needs a routeRules.prerender entry or the app
    // manifest, and `appManifest` is false above. Same effective value as
    // before prerendering was enabled.
    payloadExtraction: false,
  },
});
