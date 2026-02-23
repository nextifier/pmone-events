import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  devtools: {
    enabled: true,
    componentInspector: false,
  },

  debug: true,

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
        lang: "en",
      },
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

  css: [resolve(__dirname, "app/assets/css/main.css")],

  vite: {
    plugins: [tailwindcss()],
  },

  modules: [
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxtjs/color-mode",
    "shadcn-nuxt",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@nuxtjs/seo",
    "nuxt-gtag",
    "@formkit/auto-animate/nuxt",
  ],

  fonts: {
    provider: "local",
    families: [
      {
        name: "MinusOne",
        src: "/fonts/MinusOne-VF.woff2",
        weight: "100 1000",
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
      component: "Page",
      width: 1200,
      height: 630,
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

  compatibilityDate: "2025-05-01",

  experimental: {
    viewTransition: true,
    appManifest: false,
  },
});
