export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://indooutingexpo.co.id",
      blogUsernames: "ioe.blog",
    },
  },

  app: {
    head: {
      title: "Indonesia Outing & Incentive Travel Expo (IOITE)",
    },
  },

  colorMode: { preference: "light", fallback: "light" },

  image: {
    cloudflare: { baseURL: "https://indooutingexpo.co.id" },
  },

  site: {
    url: "https://indooutingexpo.co.id",
    name: "Indonesia Outing & Incentive Travel Expo",
  },

  gtag: {
    tags: [{ id: "G-RMZ65GCEJV" }],
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
