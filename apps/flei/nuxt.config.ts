import { newsRedirects } from "../../layers/base/config/legacy-news-redirects";

export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://franchise-expo.co.id",
      turnstileSiteKey: "0x4AAAAAADpOqQtuQn6UfF_P",
      blogUsernames: "flei.blog",
    },
  },

  app: {
    head: {
      title: "FLEI: Franchise & License Expo Indonesia",
    },
  },

  colorMode: { preference: "dark", fallback: "dark" },

  site: {
    url: "https://franchise-expo.co.id",
    name: "Franchise & License Expo Indonesia",
  },

  schemaOrg: {
    enabled: false,
  },

  gtag: {
    tags: [{ id: "G-VQ61WCGV98" }, { id: "AW-16673311348" }],
  },

  i18n: {
    locales: [
      { code: "en", language: "en-US", name: "English", files: ["../../../../layers/base/i18n/locales/en.ts", "en.ts"] },
      { code: "id", language: "id-ID", name: "Indonesia", files: ["../../../../layers/base/i18n/locales/id.ts", "id.ts"] },
      { code: "zh", language: "zh-CN", name: "中文", files: ["../../../../layers/base/i18n/locales/zh.ts", "zh.ts"] },
      { code: "ja", language: "ja-JP", name: "日本語", files: ["../../../../layers/base/i18n/locales/ja.ts", "ja.ts"] },
      { code: "ko", language: "ko-KR", name: "한국어", files: ["../../../../layers/base/i18n/locales/ko.ts", "ko.ts"] },
    ],
    lazy: true,
    langDir: "../i18n/locales",
    baseUrl: "https://franchise-expo.co.id",
    defaultLocale: "en",
    strategy: "prefix_except_default",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_locale",
      redirectOn: "root",
      alwaysRedirect: true,
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
    ...newsRedirects({
      // Slug used to carry a space; the sitemap published it double-encoded as
      // %2520 and Google crawled the form truncated at the space. Both 404'd.
      "ide-bisnis-kreatif-yang-jarang": "ide-bisnis-kreatif-yang-jarang-ada",
      "dine-in-adalah": "apa-itu-dine-in",
      "frozen-food-apa-saja": "frozen-food-itu-apa-saja",
      "joint-venture-adalah-1": "joint-venture-adalah",
      "kitchen-crew-adalah": "apa-itu-kitchen-crew",
    }),
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
      "/tickets",
      "/news",
    ],
  },

  pwa: {
    manifest: {
      name: "Franchise & License Expo Indonesia (FLEI)",
      short_name: "FLEI",
      description: "Pameran franchise dan lisensi terbesar di Indonesia. Temukan peluang bisnis dari ratusan brand unggulan di berbagai sektor.",
    },
  },

  nitro: {
    // Deploy target: Cloudflare Workers (+ Static Assets), migrated from the
    // cloudflare-pages preset. deployConfig generates .output/server/wrangler.json
    // (assets binding + nodejs_compat + compat date); deploy with
    // `npx wrangler --cwd apps/flei/.output deploy`. wrangler.name sets the
    // Worker name. Base layer nitro.alias (unhead stub) merges in.
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      wrangler: {
        name: "flei",
      },
    },
  },
});
