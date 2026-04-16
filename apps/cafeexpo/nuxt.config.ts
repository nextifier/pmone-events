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

  colorMode: { preference: "dark", fallback: "dark" },

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
    baseUrl: "https://cafebrasserieexpo.com",
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

  site: {
    url: "https://cafebrasserieexpo.com",
    name: "Cafe & Brasserie Expo Jakarta",
  },

  schemaOrg: {
    enabled: true,
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

  pwa: {
    manifest: {
      name: "Cafe & Brasserie Expo Jakarta (CBE)",
      short_name: "CBE",
      description: "Pameran industri kafe dan restoran terbesar di Indonesia. Temukan peralatan, bahan baku, dan peluang bisnis F&B terkini.",
    },
  },

  nitro: {
    preset: "cloudflare-pages",
  },
});
