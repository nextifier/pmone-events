export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://cokelatexpo.id",
      blogUsernames: "cafe.blog",
    },
  },

  app: {
    head: {
      title: "Cokelat Expo Indonesia",
    },
  },

  colorMode: { preference: "dark", fallback: "dark" },

  site: {
    url: "https://cokelatexpo.id",
    name: "Cokelat Expo Indonesia",
  },

  schemaOrg: {
    enabled: true,
  },

  gtag: {
    tags: [{ id: "G-9KLJTWG6QF" }],
  },

  i18n: {
    locales: [
      { code: "en", language: "en-US", name: "English", file: "en.ts" },
      { code: "id", language: "id-ID", name: "Indonesia", file: "id.ts" },
      { code: "zh", language: "zh-CN", name: "中文", file: "zh.ts" },
      { code: "ja", language: "ja-JP", name: "日本語", file: "ja.ts" },
      { code: "ko", language: "ko-KR", name: "한국어", file: "ko.ts" },
    ],
    lazy: true,
    langDir: "../i18n/locales",
    baseUrl: "https://cokelatexpo.id",
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
    "/tickets": { redirect: "/ticket", statusCode: 301 },
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
      "/ticket",
      "/news",
    ],
  },

  nitro: {
    preset: "cloudflare-pages",
  },
});
