export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://indooutingexpo.co.id",
      // The instance this site belongs to. NUXT_PUBLIC_API_URL in the build
      // environment overrides it; leaving both unset fails the build.
      apiUrl: "https://api.pmone.id",
      turnstileSiteKey: "0x4AAAAAADpOkX83QOOwxmmc",
      blogUsernames: "ioe.blog",
    },
  },

  app: {
    head: {
      title: "Indonesia Outing & Incentive Travel Expo (IOITE)",
    },
  },

  colorMode: { preference: "light", fallback: "light" },

  // shadcn Style (component shape). See layers/base/modules/appearance-style.ts.
  // style: mono, vega, nova, maia, lyra, mira, luma, sera, rhea). Default: mono.
  // appearance: { style: "luma" },

  site: {
    url: "https://indooutingexpo.co.id",
    name: "Indonesia Outing & Incentive Travel Expo",
  },

  schemaOrg: {
    enabled: false,
  },

  gtag: {
    tags: [{ id: "G-RMZ65GCEJV" }],
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
    baseUrl: "https://indooutingexpo.co.id",
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
      name: "Indonesia Outing & Incentive Travel Expo (IOITE)",
      short_name: "IOITE",
      description:
        "Pameran corporate outing dan incentive travel di Indonesia. Temukan destinasi, venue, dan solusi event untuk perusahaan Anda.",
      theme_color: "#ffffff",
      background_color: "#ffffff",
    },
  },

  nitro: {
    // Deploy target: Cloudflare Workers (+ Static Assets), migrated from the
    // cloudflare-pages preset. deployConfig generates .output/server/wrangler.json
    // (assets binding + nodejs_compat + compat date); deploy with
    // `npx wrangler --cwd apps/outingexpo/.output deploy`. wrangler.name sets the
    // Worker name. Base layer nitro.alias (unhead stub) merges in.
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      wrangler: {
        name: "outingexpo",
      },
    },
  },
});
