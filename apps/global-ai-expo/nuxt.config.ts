export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://global-ai-expo.pages.dev",
      blogUsernames: "globalaiexpo",
      turnstileSiteKey: "0x4AAAAAADpOkX83QOOwxmmc",
    },
  },

  app: {
    head: {
      title: "Global AI Expo",
    },
  },

  colorMode: { preference: "light", fallback: "light" },

  image: {
    provider: process.env.NODE_ENV === "production" ? "ipx" : "ipx",
    quality: 85,
    format: ["webp"],
  },

  site: {
    url: "https://global-ai-expo.pages.dev",
    name: "Global AI Expo",
  },

  schemaOrg: {
    enabled: true,
  },

  // gtag: {
  //   tags: [{ id: "G-PLACEHOLDER" }],
  // },

  i18n: {
    locales: [
      {
        code: "en",
        language: "en-US",
        name: "English",
        files: ["../../../../layers/base/i18n/locales/en.ts", "en.ts"],
      },
      {
        code: "id",
        language: "id-ID",
        name: "Indonesia",
        files: ["../../../../layers/base/i18n/locales/id.ts", "id.ts"],
      },
    ],
    lazy: true,
    langDir: "../i18n/locales",
    baseUrl: "https://global-ai-expo.pages.dev",
    defaultLocale: "en",
    strategy: "prefix_except_default",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_locale",
      redirectOn: "root",
      alwaysRedirect: true,
      fallbackLocale: "en",
    },
    vueI18n: "./i18n.config.ts",
    compilation: {
      strictMessage: false,
    },
  },

  routeRules: {
    "/ticket": { redirect: "/tickets", statusCode: 301 },
    "/tiket": { redirect: "/tickets", statusCode: 301 },
    "/tix": { redirect: "/tickets", statusCode: 301 },
    "/blog/**": { redirect: "/news/**", statusCode: 301 },
  },

  // App-specific static pages prerendered by the base cf-cache module.
  cfCache: {
    extraStaticPages: ["/speakers", "/brand-guidelines", "/quotation"],
  },

  sitemap: {
    urls: [
      "/",
      "/brands",
      "/rundown",
      "/programs",
      "/gallery",
      "/faq",
      "/ticket-terms-and-conditions",
      "/ticket-refund-and-return-policy",
      "/event-policy",
      "/help-center",
      "/links",
      "/partners",
      "/book-space",
      "/tickets",
      "/news",
    ],
  },

  pwa: {
    manifest: {
      name: "Global AI Expo",
      short_name: "GAIExpo",
      description:
        "AI exhibition, conference, startup pavilion, and business matching at Sentul City, November 2026.",
      theme_color: "#0A0A0B",
      background_color: "#F4F1E8",
    },
  },

  nitro: {
    preset: "cloudflare-pages",
  },

  vite: {
    optimizeDeps: {
      exclude: ["shaders", "shaders/vue", "three"],
    },
  },
});
