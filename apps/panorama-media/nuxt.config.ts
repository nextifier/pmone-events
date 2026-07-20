export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://panoramamedia.co.id",
      turnstileSiteKey: "0x4AAAAAADpOqQtuQn6UfF_P",
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
    enabled: false,
  },

  gtag: {
    tags: [{ id: "G-4ZNWF3G5DM" }],
  },

  i18n: {
    locales: [
      { code: "en", language: "en-US", name: "English", files: ["../../../../layers/base/i18n/locales/en.ts", "en.ts"] },
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
    // Deploy target: Cloudflare Workers (+ Static Assets), migrated from the
    // cloudflare-pages preset. deployConfig generates .output/server/wrangler.json
    // (assets binding + nodejs_compat + compat date); deploy with
    // `npx wrangler --cwd apps/panorama-media/.output deploy`. wrangler.name sets the
    // Worker name. Base layer nitro.alias (unhead stub) merges in.
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      wrangler: {
        name: "panorama-media",
      },
    },
  },
});
