export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://cafebrasserieexpo.com",
      blogUsernames: "cafe.blog",
    },
  },

  app: {
    head: {
      title: "Cafe & Brasserie Expo Jakarta (CBE)",
    },
  },

  colorMode: { preference: "light", fallback: "light" },

  fonts: {
    families: [
      {
        name: "Sink",
        src: "/fonts/Sink.woff2",
        weight: "400",
        display: "swap",
      },
    ],
  },

  image: {},

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

  site: {
    url: "https://cafebrasserieexpo.com",
    name: "Cafe & Brasserie Expo Jakarta",
  },

  gtag: {
    tags: [{ id: "G-896FDXSRSL" }],
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
