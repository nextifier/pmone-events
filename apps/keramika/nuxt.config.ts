export default defineNuxtConfig({
  extends: ["../../layers/base"],

  runtimeConfig: {
    pmOneApiKey: "pk_w5W2IfMPgnQCOjn1UvqYBJNo0UDFstFRQxhyg2Ji",
    public: {
      siteUrl: "https://keramika.id",
      blogUsernames: "keramika.blog",
    },
  },

  app: {
    head: {
      title:
        "Keramika Indonesia: ASEAN's Leading Ceramics Industry Exhibition",
    },
  },

  colorMode: { preference: "light", fallback: "light" },

  image: {
    cloudflare: { baseURL: "https://keramika.co.id" },
  },

  site: {
    url: "https://keramika.id",
    name: "Keramika Indonesia",
  },

  gtag: {
    tags: [{ id: "G-1V56RJ2Q78" }],
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
