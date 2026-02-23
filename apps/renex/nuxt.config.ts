export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://renex.megabuild.co.id",
      blogUsernames: "megabuild.blog",
    },
  },

  app: {
    head: {
      title: "Renovation Expo by Megabuild Indonesia",
    },
  },

  colorMode: { preference: "dark", fallback: "dark" },

  image: {
    cloudflare: { baseURL: "https://megabuild.co.id" },
  },

  site: {
    url: "https://renex.megabuild.co.id",
    name: "Renovation Expo",
  },

  gtag: {
    tags: [{ id: "G-2PJCW7S32V" }],
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
