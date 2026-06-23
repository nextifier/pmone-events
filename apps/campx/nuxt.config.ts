export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://campx.id",
      turnstileSiteKey: "0x4AAAAAADpOkX83QOOwxmmc",
      blogUsernames: "campx.blog",
    },
  },

  app: {
    head: {
      title: "CampX Holiday Park Jatiluhur",
    },
  },

  colorMode: { preference: "light", fallback: "light" },

  site: {
    url: "https://campx.id",
    name: "CampX Holiday Park Jatiluhur",
  },

  i18n: {
    locales: [{ code: "en", language: "en-US", name: "English", files: ["../../../../layers/base/i18n/locales/en.ts", "en.ts"] }],
    lazy: true,
    langDir: "../i18n/locales",
    baseUrl: "https://campx.id",
    defaultLocale: "en",
    strategy: "prefix_except_default",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_locale",
      redirectOn: "root",
      alwaysRedirect: false,
      fallbackLocale: "en",
    },
    vueI18n: "./i18n.config.ts",
    compilation: {
      strictMessage: false,
    },
  },

  gtag: {
    tags: [{ id: "G-QH1BX5M3WH" }],
  },

  nitro: {
    preset: "cloudflare-pages",
  },
});
