import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  devtools: {
    // Off: Nuxt DevTools' vite-plugin-inspect injects a @vueuse useColorMode onto
    // <html> that fights @nuxtjs/color-mode (dev-only color-mode desync).
    enabled: false,
    componentInspector: false,
  },

  ignore: ["**/.DS_Store", "**/.DS_Store/**"],

  runtimeConfig: {
    pmOneApiKey: process.env.NUXT_PM_ONE_API_KEY || "",
    tiktokAccessTokens: process.env.NUXT_TIKTOK_ACCESS_TOKENS || "",
    // Cloudflare Turnstile secret (server-side siteverify). When empty, the
    // contact form skips captcha verification entirely (safe to deploy first).
    turnstileSecret: process.env.NUXT_TURNSTILE_SECRET || "",
    // Stable secret for signing nuxt-og-image render URLs. The committed
    // fallback keeps it consistent across builds (silences the module's
    // "auto-generated secret changes every build" warning); override per
    // deploy with NUXT_OG_IMAGE_SECRET when desired.
    ogImage: {
      secret:
        process.env.NUXT_OG_IMAGE_SECRET ||
        "04045fc080f032a4186ccdc13922dd2fe6276b1a76d5825f5c52f16ecf240b59",
    },

    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000",
      apiUrl:
        process.env.NODE_ENV === "production"
          ? "https://api.pmone.id"
          : "http://localhost:8000",
      blogUsernames: "",
      // Cloudflare Turnstile site key (public). When empty, the widget is not
      // rendered and the form behaves exactly as before.
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || "",
    },
  },

  app: {
    head: {
      htmlAttrs: {
        translate: "no",
      },
      meta: [{ name: "google", content: "notranslate" }],
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
        "lucide-vue-next",
        "vaul-vue",
        "@vue/devtools-core",
        "@vue/devtools-kit",
      ],
    },
  },

  modules: [
    // Local: prerender static pages + cache-control routeRules + _routes.json
    // wildcards for Cloudflare Pages (cuts Workers CPU billing). Absolute path
    // so app builds resolve it from the layer, not the app dir.
    resolve(__dirname, "modules/cf-cache"),
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
    defaults: {
      renderer: "takumi",
    },
    // 30 days. The module self-injects `public, max-age, s-maxage, immutable`
    // routeRules on /_og/d/** with this TTL — do NOT hand-write /_og/**
    // routeRules or that injection is skipped. OG URLs hash their props, so
    // long-lived immutable caching is self-busting when content changes.
    cacheMaxAgeSeconds: 60 * 60 * 24 * 30,
  },

  robots: {
    // /winner is a utility tool (random winner generator), intentionally kept
    // out of search. Terms & Privacy are crawlable so they can score SEO 100.
    disallow: ["/winner"],
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
      redirectOn: "all",
      alwaysRedirect: true,
      fallbackLocale: "en",
    },
  },

  pwa: {
    registerType: "autoUpdate",
    registerWebManifestInRouteRules: true,
    manifest: {
      name: "",
      short_name: "",
      start_url: "/",
      display: "standalone",
      theme_color: "#09090b",
      background_color: "#09090b",
      description: "",
      icons: [
        {
          src: "icons/icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "icons/icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "icons/icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
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
    injectManifest: {
      globPatterns: ["**/*.{js,css,png,svg,ico}"],
      globIgnores: ["**/_og/**"],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: "module",
    },
  },

  nitro: {
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
  },
});
