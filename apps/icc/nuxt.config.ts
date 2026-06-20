export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://indonesiacomiccon.com",
      blogUsernames: "icc.blog",
    },
  },

  app: {
    head: {
      title: "Indonesia Comic Con (ICC)",
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
    baseUrl: "https://indonesiacomiccon.com",
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
    url: "https://indonesiacomiccon.com",
    name: "Indonesia Comic Con",
  },

  schemaOrg: {
    enabled: true,
  },

  gtag: {
    tags: [{ id: "G-JCGZGZQZ56" }],
  },

  routeRules: {
    "/raya": {
      redirect:
        "https://docs.google.com/forms/d/e/1FAIpQLSf7KsZ7rE7GrBsAr7q7B7pSqMG45N4pnJVqXyJlYH7D_0oaxQ/viewform",
      statusCode: 301,
    },
    "/rules-of-raya": {
      redirect:
        "https://drive.google.com/file/d/1HgNuREcAJz4SWQr8_-TBapDDQJAH5_5f/view?usp=sharing",
      statusCode: 301,
    },
    "/ticket": { redirect: "/tickets", statusCode: 301 },
    "/tiket": { redirect: "/tickets", statusCode: 301 },
    "/tix": { redirect: "/tickets", statusCode: 301 },
    "/blog/**": { redirect: "/news/**", statusCode: 301 },
    "/tenants/**": { redirect: "/brands/**", statusCode: 301 },
  },

  sitemap: {
    urls: [
      "/",
      "/guests",
      "/brands",
      "/rundown",
      "/programs",
      "/gallery",
      "/faq",
      "/ticket-terms-and-conditions",
      "/ticket-refund-and-return-policy",
      "/event-policy",
      "/event-guidelines",
      "/safety-and-weapon-policy",
      "/anti-harassment-policy",
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
      name: "Indonesia Comic Con (ICC)",
      short_name: "ICC",
      description: "Ajang pop culture terbesar di Indonesia. Nikmati pengalaman seru bertemu artis internasional, cosplay, komik, dan merchandise eksklusif.",
    },
  },

  nitro: {
    preset: "cloudflare-pages",
  },
});
