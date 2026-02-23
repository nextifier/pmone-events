export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://cokelatexpo.id",
      blogUsernames: "cafe.blog",
    },
  },

  app: {
    head: {
      title: "Cokelat Expo Indonesia",
    },
  },

  colorMode: { preference: "dark", fallback: "dark" },

  fonts: {
    families: [
      {
        name: "Sink",
        src: "/fonts/Sink.woff2",
        weight: "400",
        display: "swap",
      },
    ],
  },

  image: {
    cloudflare: { baseURL: "https://cokelatexpo.id" },
  },

  site: {
    url: "https://cokelatexpo.id",
    name: "Cokelat Expo Indonesia",
  },

  gtag: {
    tags: [{ id: "G-9KLJTWG6QF" }],
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
