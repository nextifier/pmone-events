export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://iicc.askindo.id",
    },
  },

  app: {
    head: {
      title: "The 9th Indonesia International Cocoa Conference & Dinner",
      meta: [
        {
          name: "description",
          content:
            "The 9th Indonesia International Cocoa Conference & Dinner. Join the world's cocoa community in Yogyakarta, July 22-24, 2026.",
        },
      ],
    },
  },

  colorMode: { preference: "light", fallback: "light" },

  site: {
    url: "https://iicc.askindo.id",
    name: "Indonesia International Cocoa Conference (IICC)",
  },

  image: {
    cloudflare: {
      baseURL: "https://iicc.askindo.id",
    },
  },

  schemaOrg: {
    enabled: true,
  },

  gtag: {
    tags: [{ id: "G-Y96T5YPS3H" }],
  },

  i18n: {
    locales: [
      { code: "en", language: "en-US", name: "English", files: ["../../../../layers/base/i18n/locales/en.ts", "en.ts"] },
      { code: "id", language: "id-ID", name: "Indonesia", files: ["../../../../layers/base/i18n/locales/id.ts", "id.ts"] },
    ],
    lazy: true,
    langDir: "../i18n/locales",
    baseUrl: "https://iicc.askindo.id",
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

  sitemap: {
    sources: [],
    urls: ["/", "/contact", "/terms", "/privacy"],
  },

  hooks: {
    "pages:extend"(pages) {
      const allowedPaths = new Set(["/", "/contact", "/terms", "/privacy"]);
      const filter = (list) =>
        list.filter((page) => {
          if (page.children?.length) {
            page.children = filter(page.children);
          }
          return allowedPaths.has(page.path);
        });
      const filtered = filter(pages);
      pages.length = 0;
      pages.push(...filtered);
    },
  },

  pwa: {
    manifest: {
      name: "The 9th Indonesia International Cocoa Conference & Dinner",
      short_name: "IICC",
      description:
        "The 9th Indonesia International Cocoa Conference & Dinner — Yogyakarta, July 22-24, 2026.",
      theme_color: "#ffffff",
      background_color: "#ffffff",
    },
  },

  nitro: {
    preset: "cloudflare-pages",
  },
});
