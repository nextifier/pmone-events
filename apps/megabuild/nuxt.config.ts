export default defineNuxtConfig({
  extends: ["../../layers/base"],

  runtimeConfig: {
    pmOneApiKey: "pk_vR1IOzEAHY8xa8ZJqgRk9z2zrBSYcVNCVEuZHl7A",
    public: {
      siteUrl: "https://megabuild.co.id",
      blogUsernames: "megabuild.blog",
    },
  },

  app: {
    head: {
      title:
        "Megabuild Indonesia: Building Materials, Architecture, Construction, and Interior Design Expo",
    },
  },

  colorMode: { preference: "dark", fallback: "dark" },

  image: {
    cloudflare: { baseURL: "https://megabuild.co.id" },
  },

  site: {
    url: "https://megabuild.co.id",
    name: "Megabuild Indonesia",
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
