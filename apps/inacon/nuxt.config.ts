export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://indonesiaanimecon.com",
      blogUsernames: "inacon.blog",
    },
  },

  app: {
    head: {
      title: "Indonesia Anime Con (INACON)",
    },
  },

  colorMode: { preference: "dark", fallback: "dark" },

  fonts: {
    families: [
      {
        name: "DisplayGF",
        src: "/fonts/DisplayGF.woff2",
        weight: "400",
        display: "swap",
      },
      {
        name: "HeadingElv",
        src: "/fonts/HeadingElv.woff2",
        weight: "400",
        display: "swap",
      },
    ],
  },

  image: {
    cloudflare: { baseURL: "https://indonesiaanimecon.com" },
  },

  site: {
    url: "https://indonesiaanimecon.com",
    name: "Indonesia Anime Con",
  },

  gtag: {
    tags: [{ id: "G-QH16B87QEK" }],
  },

  routeRules: {
    "/tickets": { redirect: "/ticket", statusCode: 301 },
    "/blog/**": { redirect: "/news/**", statusCode: 301 },
    "/tenants/**": { redirect: "/brands/**", statusCode: 301 },
  },

  sitemap: {
    urls: [
      "/",
      "/guests",
      "/brands",
      "/rundown",
      "/programs",
      "/gallery",
      "/faq",
      "/icgp",
      "/ticket-terms-and-conditions",
      "/ticket-refund-and-return-policy",
      "/event-policy",
      "/event-guidelines",
      "/safety-and-weapon-policy",
      "/anti-harassment-policy",
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
