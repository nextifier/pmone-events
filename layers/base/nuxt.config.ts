import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  devtools: {
    enabled: true,
    componentInspector: false,
  },

  ignore: ["**/.DS_Store", "**/.DS_Store/**"],

  runtimeConfig: {
    pmOneApiKey: process.env.NUXT_PM_ONE_API_KEY || "",
    tiktokAccessTokens: process.env.NUXT_TIKTOK_ACCESS_TOKENS || "",

    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000",
      apiUrl:
        process.env.NODE_ENV === "production"
          ? "https://api.pmone.id"
          : "http://localhost:8000",
      blogUsernames: "",
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      ignore: ["/", "/brands", "/brands/**", "/rundown", "/news", "/news/**"],
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
    optimizeDeps: {
      include: [
        "@unhead/schema-org/vue",
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
    storageKey: "color-mode",
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
    },
    injectManifest: {
      globPatterns: ["**/*.{js,css,png,svg,ico}"],
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

  compatibilityDate: "2025-05-01",

  experimental: {
    viewTransition: true,
    appManifest: false,
    emitRouteChunkError: "automatic-immediate",
  },
});
