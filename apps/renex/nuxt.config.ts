export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://renex.megabuild.co.id",
      turnstileSiteKey: "0x4AAAAAADpOkX83QOOwxmmc",
      blogUsernames: "megabuild.blog",
    },
  },

  app: {
    head: {
      title: "Renovation Expo by Megabuild Indonesia",
    },
  },

  colorMode: { preference: "dark", fallback: "dark" },

  site: {
    url: "https://renex.megabuild.co.id",
    name: "Renovation Expo",
  },

  schemaOrg: {
    enabled: true,
  },

  gtag: {
    // Intentionally shares megabuild's GA4 property (id matches
    // apps/megabuild/nuxt.config.ts): renex.megabuild.co.id is a Megabuild
    // Indonesia sub-brand on Megabuild's own subdomain, not an independent
    // event site. See plans/015-content-contract-and-campx-500.md.
    tags: [{ id: "G-2PJCW7S32V" }],
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
    baseUrl: "https://renex.megabuild.co.id",
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
      name: "Renovation Expo by Megabuild Indonesia",
      short_name: "RENEX",
      description: "Pameran renovasi dan desain interior by Megabuild Indonesia. Temukan inspirasi dan solusi terbaik untuk proyek renovasi Anda.",
    },
  },

  nitro: {
    preset: "cloudflare-pages",
  },
});
