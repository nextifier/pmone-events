export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://indonesiacomiccon.com",
      blogUsernames: "icc.blog",
    },
  },

  app: {
    head: {
      title: "Indonesia Comic Con (ICC)",
    },
  },

  colorMode: { preference: "dark", fallback: "dark" },

  fonts: {
    families: [
      {
        name: "AvenirExtraBold",
        src: "/fonts/Avenir-ExtraBold.woff2",
        weight: "800",
        display: "swap",
      },
    ],
  },

  image: {},

  site: {
    url: "https://indonesiacomiccon.com",
    name: "Indonesia Comic Con",
  },

  gtag: {
    tags: [{ id: "G-JCGZGZQZ56" }],
  },

  routeRules: {
    "/raya": {
      redirect:
        "https://docs.google.com/forms/d/e/1FAIpQLSf7KsZ7rE7GrBsAr7q7B7pSqMG45N4pnJVqXyJlYH7D_0oaxQ/viewform",
      statusCode: 301,
    },
    "/rules-of-raya": {
      redirect:
        "https://drive.google.com/file/d/1HgNuREcAJz4SWQr8_-TBapDDQJAH5_5f/view?usp=sharing",
      statusCode: 301,
    },
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
