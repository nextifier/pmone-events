export default defineNuxtConfig({
  extends: ["../../layers/base"],

  modules: ["nuxt-disqus"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://panoramaevents.id",
      // The instance this site belongs to. NUXT_PUBLIC_API_URL in the build
      // environment overrides it; leaving both unset fails the build.
      apiUrl: "https://api.pmone.id",
      turnstileSiteKey: "0x4AAAAAADpOqQtuQn6UfF_P",
      blogUsernames: "pe.blog",
    },
  },

  app: {
    head: {
      title: "Panorama Events: HR-Driven Corporate Outings for Team Growth",
    },
  },

  colorMode: { preference: "light", fallback: "light" },

  site: {
    url: "https://panoramaevents.id",
    name: "Panorama Events",
  },

  image: {
    cloudflare: {
      baseURL: "https://panoramaevents.id",
    },
  },

  schemaOrg: {
    enabled: false,
  },

  gtag: {
    tags: [{ id: "G-343DPRDD5M" }],
  },

  i18n: {
    locales: [{ code: "en", language: "en-US", name: "English", files: ["../../../../layers/base/i18n/locales/en.ts", "en.ts"] }],
    lazy: true,
    langDir: "../i18n/locales",
    baseUrl: "https://panoramaevents.id",
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
    "/ticket": { redirect: { to: "/tickets", statusCode: 301 } },
    "/tiket": { redirect: { to: "/tickets", statusCode: 301 } },
    "/tix": { redirect: { to: "/tickets", statusCode: 301 } },
    "/blog/**": { redirect: { to: "/news/**", statusCode: 301 } },
  },

  sitemap: {
    urls: ["/", "/about", "/services", "/events", "/faq", "/contact", "/news"],
  },

  pwa: {
    manifest: {
      name: "Panorama Events",
      short_name: "Panorama Events",
      description:
        "HR-Driven Corporate Outings for Team Growth by Panorama Events.",
      theme_color: "#ffffff",
      background_color: "#ffffff",
    },
  },

  nitro: {
    // Deploy target: Cloudflare Workers (+ Static Assets), migrated from the
    // cloudflare-pages preset. deployConfig generates .output/server/wrangler.json
    // (assets binding + nodejs_compat + compat date); deploy with
    // `npx wrangler --cwd apps/panorama-events/.output deploy`. wrangler.name sets the
    // Worker name. Base layer nitro.alias (unhead stub) merges in.
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      wrangler: {
        name: "panorama-events",
      },
    },
  },
});
