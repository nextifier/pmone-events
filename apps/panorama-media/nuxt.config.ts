import { ENGLISH_ONLY, newsRedirects } from "../../layers/base/config/legacy-news-redirects";

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
    // Opt back out of the layer's `ssr: false` for brand detail. That rule
    // exists because the event sites render thousands of API-backed brand
    // pages for crawlers; this app's brands are its own content, read from a
    // local store with no fetch at all, so the render is already free and the
    // copy is worth having in the delivered HTML.
    "/brands/*": { ssr: true },
    "/blog/**": { redirect: { to: "/news/**", statusCode: 301 } },
    ...newsRedirects(
      {
        "13-ide-usaha-yang-menjanjikan-dengan-modal-kecil-catat": "usaha-yang-menjanjikan",
        "cara-memulai-bisnis": "cara-memulai-bisnis-1",
        "cara-mendaftar-nib-1": "cara-mendaftar-nib",
        "dine-in-adalah": "apa-itu-dine-in",
        "franchise-vs-bangun-brand-sendiri": "franchise-vs-bangun-brand-sendiri-2",
        "frozen-food-apa-saja": "frozen-food-itu-apa-saja",
        "ide-bisnis-makanan-kekinian": "ide-bisnis-makanan-kekinian-1",
        "joint-venture-adalah-1": "joint-venture-adalah",
        "kitchen-crew-adalah": "apa-itu-kitchen-crew",
        // Two slugs repaired in the database 8 Aug 2026: one carried a space,
        // the other a capital. Both were reachable here too.
        "Warna-cat-rumah-yang-bagus-dan-elegan": "warna-cat-rumah-yang-bagus-dan-elegan",
        "ide-bisnis-kreatif-yang-jarang": "ide-bisnis-kreatif-yang-jarang-ada",
      },
      ENGLISH_ONLY,
    ),
  },

  // This app's /brands is a store-driven static page, not the base layer's API
  // listing, so it is safe to prerender.
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
