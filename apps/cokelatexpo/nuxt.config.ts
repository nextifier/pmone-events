export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://cokelatexpo.id",
      // The instance this site belongs to. NUXT_PUBLIC_API_URL in the build
      // environment overrides it; leaving both unset fails the build.
      apiUrl: "https://api.pmone.id",
      turnstileSiteKey: "0x4AAAAAADpOkX83QOOwxmmc",
      blogUsernames: "cafe.blog",
    },
  },

  app: {
    head: {
      title: "Cokelat Expo Indonesia",
    },
  },

  colorMode: { preference: "light", fallback: "light" },

  site: {
    url: "https://cokelatexpo.id",
    name: "Cokelat Expo Indonesia",
  },

  schemaOrg: {
    enabled: false,
  },

  gtag: {
    tags: [{ id: "G-9KLJTWG6QF" }],
  },

  i18n: {
    locales: [
      {
        code: "en",
        language: "en-US",
        name: "English",
        files: ["../../../../layers/base/i18n/locales/en.ts", "en.ts"],
      },
      {
        code: "id",
        language: "id-ID",
        name: "Indonesia",
        files: ["../../../../layers/base/i18n/locales/id.ts", "id.ts"],
      },
      {
        code: "zh",
        language: "zh-CN",
        name: "中文",
        files: ["../../../../layers/base/i18n/locales/zh.ts", "zh.ts"],
      },
      {
        code: "ja",
        language: "ja-JP",
        name: "日本語",
        files: ["../../../../layers/base/i18n/locales/ja.ts", "ja.ts"],
      },
      {
        code: "ko",
        language: "ko-KR",
        name: "한국어",
        files: ["../../../../layers/base/i18n/locales/ko.ts", "ko.ts"],
      },
    ],
    lazy: true,
    langDir: "../i18n/locales",
    baseUrl: "https://cokelatexpo.id",
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
      name: "Cokelat Expo Indonesia",
      short_name: "CEI",
      description:
        "Pameran cokelat dan kakao pertama di Indonesia. Temukan produk cokelat premium, bahan baku, dan peluang bisnis di industri kakao.",
    },
  },

  nitro: {
    // Deploy target: Cloudflare Workers (+ Static Assets), migrated from the
    // cloudflare-pages preset. deployConfig generates .output/server/wrangler.json
    // (assets binding + nodejs_compat + compat date); deploy with
    // `npx wrangler --cwd apps/cokelatexpo/.output deploy`. wrangler.name sets the
    // Worker name. Base layer nitro.alias (unhead stub) merges in.
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      wrangler: {
        name: "cokelatexpo",
      },
    },
  },
});
