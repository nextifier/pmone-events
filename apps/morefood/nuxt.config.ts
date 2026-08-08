import { newsRedirects } from "../../layers/base/config/legacy-news-redirects";

export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://morefoodexpo.com",
      turnstileSiteKey: "0x4AAAAAADpOkX83QOOwxmmc",
      blogUsernames: "morefood.blog",
    },
  },

  app: {
    head: {
      title: "More Food Expo Indonesia",
    },
  },

  colorMode: { preference: "light", fallback: "light" },

  site: {
    url: "https://morefoodexpo.com",
    name: "More Food Expo Indonesia",
  },

  schemaOrg: {
    enabled: false,
  },

  gtag: {
    tags: [{ id: "G-4STNHTGXQQ" }],
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
    baseUrl: "https://morefoodexpo.com",
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
      "cara-mendaftar-nib-1": "cara-mendaftar-nib",
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
      name: "More Food Expo Indonesia",
      short_name: "MoreFood Expo",
      description: "Pameran food & beverage terlengkap di Indonesia. Temukan bahan baku, peralatan, dan peluang bisnis F&B dari ratusan brand.",
      theme_color: "#ffffff",
      background_color: "#ffffff",
    },
  },

  nitro: {
    // Deploy target: Cloudflare Workers (+ Static Assets), migrated from the
    // cloudflare-pages preset. deployConfig generates .output/server/wrangler.json
    // (assets binding + nodejs_compat + compat date); deploy with
    // `npx wrangler --cwd apps/morefood/.output deploy`. wrangler.name sets the
    // Worker name. Base layer nitro.alias (unhead stub) merges in.
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      wrangler: {
        name: "morefood",
      },
    },
  },
});
