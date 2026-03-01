export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://megabuild.co.id",
      blogUsernames: "megabuild.blog",
    },
  },

  app: {
    head: {
      title:
        "Megabuild Indonesia: Building Materials, Architecture, Construction, and Interior Design Expo",
    },
  },

  colorMode: { preference: "dark", fallback: "dark" },

  image: {},

  site: {
    url: "https://megabuild.co.id",
    name: "Megabuild Indonesia",
  },

  schemaOrg: {
    enabled: true,
  },

  gtag: {
    tags: [{ id: "G-2PJCW7S32V" }],
  },

  i18n: {
    locales: [
      { code: "en", language: "en-US", name: "English", file: "en.json" },
      { code: "id", language: "id-ID", name: "Indonesia", file: "id.json" },
      { code: "zh", language: "zh-CN", name: "中文", file: "zh.json" },
      { code: "ja", language: "ja-JP", name: "日本語", file: "ja.json" },
      { code: "ko", language: "ko-KR", name: "한국어", file: "ko.json" },
    ],
    lazy: true,
    langDir: "../i18n/locales",
    defaultLocale: "en",
    strategy: "no_prefix",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_locale",
      redirectOn: "all",
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
