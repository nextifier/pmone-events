export default defineNuxtConfig({
  extends: ["../../layers/base"],

  runtimeConfig: {
    pmOneApiKey: "pk_9nAjHFZNwpAlrUK3hujzNQR8AKtfoIT235Hk4nMT",
    public: {
      siteUrl: "https://cafebrasserieexpo.com",
      blogUsernames: "cafe.blog",
    },
  },

  app: {
    head: {
      title: "Cafe & Brasserie Expo Jakarta (CBE)",
    },
  },

  colorMode: { preference: "light", fallback: "light" },

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
    cloudflare: { baseURL: "https://cafebrasserieexpo.com" },
  },

  site: {
    url: "https://cafebrasserieexpo.com",
    name: "Cafe & Brasserie Expo Jakarta",
  },

  gtag: {
    tags: [{ id: "G-896FDXSRSL" }],
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
