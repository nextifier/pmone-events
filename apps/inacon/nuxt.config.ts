export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://indonesiaanimecon.com",
      blogUsernames: "inacon.blog",
    },
  },

  app: {
    head: {
      title: "Indonesia Anime Con (INACON)",
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
    baseUrl: "https://indonesiaanimecon.com",
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
    url: "https://indonesiaanimecon.com",
    name: "Indonesia Anime Con",
  },

  schemaOrg: {
    enabled: true,
  },

  gtag: {
    tags: [{ id: "G-QH16B87QEK" }],
  },

  routeRules: {
    "/tickets": { redirect: "/ticket", statusCode: 301 },
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
      "/icgp",
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
      "/ticket",
      "/news",
    ],
  },

  pwa: {
    manifest: {
      name: "Indonesia Anime Con (INACON)",
      short_name: "INACON",
      description: "Festival anime dan budaya Jepang terbesar di Indonesia. Nikmati guest artis, cosplay, merchandise eksklusif, dan pengalaman seru lainnya.",
    },
  },

  nitro: {
    preset: "cloudflare-pages",
  },
});
