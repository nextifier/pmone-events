import { newsRedirects } from "../../layers/base/config/legacy-news-redirects";

export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://renex.megabuild.co.id",
      // The instance this site belongs to. NUXT_PUBLIC_API_URL in the build
      // environment overrides it; leaving both unset fails the build.
      apiUrl: "https://api.pmone.id",
      turnstileSiteKey: "0x4AAAAAADpOkX83QOOwxmmc",
      blogUsernames: "megabuild.blog",
    },
  },

  app: {
    head: {
      title: "Renovation Expo by Megabuild Indonesia",
    },
  },

  colorMode: { preference: "dark", fallback: "dark" },

  site: {
    url: "https://renex.megabuild.co.id",
    name: "Renovation Expo",
  },

  schemaOrg: {
    enabled: false,
  },

  gtag: {
    // Intentionally shares megabuild's GA4 property (id matches
    // apps/megabuild/nuxt.config.ts): renex.megabuild.co.id is a Megabuild
    // Indonesia sub-brand on Megabuild's own subdomain, not an independent
    // event site. See plans/015-content-contract-and-campx-500.md.
    tags: [{ id: "G-2PJCW7S32V" }],
  },

  routeRules: {
    "/ticket": { redirect: { to: "/tickets", statusCode: 301 } },
    "/tiket": { redirect: { to: "/tickets", statusCode: 301 } },
    "/tix": { redirect: { to: "/tickets", statusCode: 301 } },
    "/blog/**": { redirect: { to: "/news/**", statusCode: 301 } },
    ...newsRedirects({
      "franchise-vs-bangun-brand-sendiri": "franchise-vs-bangun-brand-sendiri-2",
      // renex serves megabuild.blog, so it renders this article at the same slug.
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
    baseUrl: "https://renex.megabuild.co.id",
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

  pwa: {
    manifest: {
      name: "Renovation Expo by Megabuild Indonesia",
      short_name: "RENEX",
      description: "Pameran renovasi dan desain interior by Megabuild Indonesia. Temukan inspirasi dan solusi terbaik untuk proyek renovasi Anda.",
    },
  },

  nitro: {
    // Deploy target: Cloudflare Workers (+ Static Assets), migrated from the
    // cloudflare-pages preset. deployConfig generates .output/server/wrangler.json
    // (assets binding + nodejs_compat + compat date); deploy with
    // `npx wrangler --cwd apps/renex/.output deploy`. wrangler.name sets the
    // Worker name. Base layer nitro.alias (unhead stub) merges in.
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      wrangler: {
        name: "renex",
      },
    },
  },
});
