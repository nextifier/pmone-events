export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://keramika.co.id",
      blogUsernames: "keramika.blog",
      turnstileSiteKey: "0x4AAAAAADpOkX83QOOwxmmc",
    },
  },

  app: {
    head: {
      title:
        "Keramika Indonesia: ASEAN's Leading Ceramics Industry Exhibition",
    },
  },

  colorMode: { preference: "light", fallback: "light" },

  site: {
    url: "https://keramika.co.id",
    name: "Keramika Indonesia",
  },

  schemaOrg: {
    enabled: false,
  },

  gtag: {
    tags: [{ id: "G-1V56RJ2Q78" }],
  },

  routeRules: {
    "/ticket": { redirect: "/tickets", statusCode: 301 },
    "/tiket": { redirect: "/tickets", statusCode: 301 },
    "/tix": { redirect: "/tickets", statusCode: 301 },
    "/blog/**": { redirect: "/news/**", statusCode: 301 },
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

  i18n: {
    locales: [
      { code: "en", language: "en-US", name: "English", files: ["../../../../layers/base/i18n/locales/en.ts", "en.ts"] },
      { code: "id", language: "id-ID", name: "Indonesia", files: ["../../../../layers/base/i18n/locales/id.ts", "id.ts"] },
      { code: "zh", language: "zh-CN", name: "中文", files: ["../../../../layers/base/i18n/locales/zh.ts", "zh.ts"] },
      { code: "ja", language: "ja-JP", name: "日本語", files: ["../../../../layers/base/i18n/locales/ja.ts", "ja.ts"] },
      { code: "ko", language: "ko-KR", name: "한국어", files: ["../../../../layers/base/i18n/locales/ko.ts", "ko.ts"] },
    ],
    lazy: true,
    langDir: "../i18n/locales",
    baseUrl: "https://keramika.co.id",
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

  pwa: {
    manifest: {
      name: "Keramika Indonesia",
      short_name: "Keramika",
      description: "Pameran industri keramik terdepan di ASEAN. Jelajahi koleksi terbaik dari brand keramik, marmer, granit, dan sanitari terkemuka.",
      theme_color: "#ffffff",
      background_color: "#ffffff",
    },
  },

  nitro: {
    preset: "cloudflare-pages",
  },
});
