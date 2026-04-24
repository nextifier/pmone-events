export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://campx.id",
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
    baseUrl: "https://campx.id",
    vueI18n: "./i18n.config.ts",
  },

  gtag: {
    tags: [{ id: "G-QH1BX5M3WH" }],
  },

  nitro: {
    preset: "cloudflare-pages",
  },
});
