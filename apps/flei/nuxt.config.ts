export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://franchise-expo.co.id",
      blogUsernames: "flei.blog",
    },
  },

  app: {
    head: {
      title: "FLEI: Franchise & License Expo Indonesia",
    },
  },

  colorMode: { preference: "dark", fallback: "dark" },

  image: {
    cloudflare: { baseURL: "https://franchise-expo.co.id" },
  },

  site: {
    url: "https://franchise-expo.co.id",
    name: "Franchise & License Expo Indonesia",
  },

  gtag: {
    tags: [{ id: "G-VQ61WCGV98" }, { id: "AW-16673311348" }],
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
