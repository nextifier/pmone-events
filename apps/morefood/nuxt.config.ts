export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://morefoodexpo.com",
      blogUsernames: "morefood.blog",
    },
  },

  app: {
    head: {
      title: "More Food Expo Indonesia",
    },
  },

  colorMode: { preference: "light", fallback: "light" },

  image: {
    cloudflare: { baseURL: "https://morefoodexpo.com" },
  },

  site: {
    url: "https://morefoodexpo.com",
    name: "More Food Expo Indonesia",
  },

  gtag: {
    tags: [{ id: "G-4STNHTGXQQ" }],
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
