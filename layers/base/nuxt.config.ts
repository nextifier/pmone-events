import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  devtools: {
    enabled: true,
    componentInspector: false,
  },

  runtimeConfig: {
    pmOneApiKey: process.env.NUXT_PM_ONE_API_KEY || "",

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
        "vue3-picture-swipe",
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
  ],

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
    disallow: ["/terms", "/privacy", "/winner"],
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
    locales: [
      { code: "en", language: "en-US", name: "English", file: "en.ts" },
    ],
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

  compatibilityDate: "2025-05-01",

  experimental: {
    viewTransition: true,
    appManifest: false,
  },
});
