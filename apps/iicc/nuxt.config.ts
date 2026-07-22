export default defineNuxtConfig({
  extends: ["../../layers/base"],

  css: ["~/assets/css/app.css"],

  runtimeConfig: {
    public: {
      siteUrl: "https://iicc.askindo.id",
      turnstileSiteKey: "0x4AAAAAADpOqQtuQn6UfF_P",
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
    enabled: false,
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
    urls: ["/", "/contact", "/terms", "/privacy", "/hotels"],
  },

  hooks: {
    "pages:extend"(pages) {
      const allowedPaths = new Set([
        "/",
        "/contact",
        "/terms",
        "/privacy",
        "/hotels",
      ]);
      // `/hotels` plus every nested hotel route (detail, booking, reservation,
      // success) — the listing and the booking flow are exposed as a set.
      const isAllowed = (path) =>
        allowedPaths.has(path) || path.startsWith("/hotels/");
      const filter = (list) =>
        list.filter((page) => {
          if (page.children?.length) {
            page.children = filter(page.children);
          }
          return isAllowed(page.path);
        });
      const filtered = filter(pages);
      pages.length = 0;
      pages.push(...filtered);
    },
  },

  // The `cfCache.skipStaticPages` list that used to live here is gone with the
  // cf-cache module (23 Jul 2026). It existed only because prerendering a route
  // this app dropped via `pages:extend` hard-failed the build. Nothing is
  // prerendered now, and the pages this app does not expose simply 404 at
  // runtime — 404s are never edge-cached, so no config is needed.

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
    // Deploy target: Cloudflare Workers (+ Static Assets), migrated from the
    // cloudflare-pages preset. deployConfig generates .output/server/wrangler.json
    // (assets binding + nodejs_compat + compat date); deploy with
    // `npx wrangler --cwd apps/iicc/.output deploy`. wrangler.name sets the
    // Worker name. Base layer nitro.alias (unhead stub) merges in.
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      wrangler: {
        name: "iicc",
      },
    },
  },
});
