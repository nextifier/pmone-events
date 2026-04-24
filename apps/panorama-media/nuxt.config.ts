export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://panoramamedia.co.id",
      blogUsernames: "", // Empty string means show all posts (no author filter)
    },
  },

  app: {
    head: {
      title: "Panorama Media",
    },
  },

  colorMode: { preference: "light", fallback: "light" },

  site: {
    url: "https://panoramamedia.co.id",
    name: "Panorama Media",
  },

  image: {
    cloudflare: {
      baseURL: "https://panoramamedia.co.id",
    },
  },

  schemaOrg: {
    enabled: true,
  },

  gtag: {
    tags: [{ id: "G-4ZNWF3G5DM" }],
  },

  i18n: {
    locales: [
      { code: "en", language: "en-US", name: "English", file: "en.ts" },
    ],
    lazy: true,
    langDir: "../i18n/locales",
    baseUrl: "https://panoramamedia.co.id",
    defaultLocale: "en",
    strategy: "prefix_except_default",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_locale",
      redirectOn: "root",
      alwaysRedirect: false,
      fallbackLocale: "en",
    },
    vueI18n: "./i18n.config.ts",
    compilation: {
      strictMessage: false,
    },
  },

  routeRules: {
    "/blog/**": { redirect: "/news/**", statusCode: 301 },
  },

  sitemap: {
    urls: [
      "/",
      "/about",
      "/products",
      "/brands",
      "/events",
      "/faq",
      "/contact",
      "/news",
    ],
  },

  pwa: {
    manifest: {
      name: "Panorama Media",
      short_name: "Panorama Media",
      description: "Panorama Media — brands, events, and products coverage.",
      theme_color: "#ffffff",
      background_color: "#ffffff",
    },
  },

  nitro: {
    preset: "cloudflare-pages",
  },
});
