export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://cafebrasserieexpo.com",
      turnstileSiteKey: "0x4AAAAAADpOkX83QOOwxmmc",
      blogUsernames: "cafe.blog",
    },
  },

  app: {
    head: {
      title: "Cafe n' Brasserie Expo Jakarta (CBE)",
    },
  },

  colorMode: { preference: "dark", fallback: "dark" },

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
    name: "Cafe n' Brasserie Expo Jakarta",
  },

  schemaOrg: {
    enabled: true,
  },

  gtag: {
    tags: [{ id: "G-896FDXSRSL" }],
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

  pwa: {
    manifest: {
      name: "Cafe n' Brasserie Expo Jakarta (CBE)",
      short_name: "CBE",
      description:
        "Pameran industri kafe dan restoran terbesar di Indonesia. Temukan peralatan, bahan baku, dan peluang bisnis F&B terkini.",
    },
  },

  nitro: {
    preset: "cloudflare-pages",
  },
});
