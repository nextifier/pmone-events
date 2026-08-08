import { newsRedirects } from "../../layers/base/config/legacy-news-redirects";

export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://megabuild.co.id",
      turnstileSiteKey: "0x4AAAAAADpOkX83QOOwxmmc",
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

  site: {
    url: "https://megabuild.co.id",
    name: "Megabuild Indonesia",
  },

  schemaOrg: {
    enabled: false,
  },

  gtag: {
    tags: [{ id: "G-2PJCW7S32V" }],
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
    baseUrl: "https://megabuild.co.id",
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
      "franchise-vs-bangun-brand-sendiri": "franchise-vs-bangun-brand-sendiri-2",
      // Slug was title-cased, so only the capitalised URL resolved. Lowercased
      // in the database 8 Aug 2026; this keeps whatever Google indexed alive.
      "Warna-cat-rumah-yang-bagus-dan-elegan": "warna-cat-rumah-yang-bagus-dan-elegan",
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
      name: "Megabuild Indonesia",
      short_name: "Megabuild",
      description: "Pameran bahan bangunan, arsitektur, konstruksi, dan desain interior terbesar di Indonesia.",
    },
  },

  nitro: {
    // Deploy target: Cloudflare Workers (+ Static Assets), migrated from the
    // cloudflare-pages preset. deployConfig generates the wrangler.json into
    // .output/server (assets binding + nodejs_compat + compat date) plus the
    // .wrangler/deploy/config.json redirect; deploy with
    // `npx wrangler --cwd apps/megabuild/.output deploy`. wrangler.name sets the
    // Worker name so no hand-written root wrangler config is needed. The base
    // layer's nitro.alias (unhead stream stub) merges in.
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      wrangler: {
        name: "megabuild",
      },
    },
  },
});
