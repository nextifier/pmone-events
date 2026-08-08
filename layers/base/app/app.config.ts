export default defineAppConfig({
  app: {
    name: "",
    shortName: "",
    projectUsername: "",
    dataSourceUsername: "",
    url: "",
    company: {
      name: "",
      address: "",
    },
  },

  // Defaults for every app. Each app overrides only what differs — app.config
  // deep-merges across layers, so `settings.ticket.tabs.showPhotos: false` in an
  // app leaves the other five tabs on.
  //
  // These lived in the PM One dashboard (Website Settings / Site Config) between
  // Jun and Aug 2026 and were reverted to code so that every public page can be
  // prerendered. The values captured from production before the revert are in
  // docs/website-settings-export.json.
  settings: {
    header: {
      logoClass: "h-6 text-foreground",
    },
    footer: {
      logoClass: "h-8 text-foreground",
    },
    ogImage: {
      isDarkMode: true,
    },

    // Which tabs the /tickets page shows.
    ticket: {
      tabs: {
        showTickets: true,
        showGuests: false,
        showBrands: true,
        showRundown: true,
        showAbout: true,
        showPhotos: true,
      },
    },

    blog: {
      showPostCardAuthor: false,
      showPostCardExcerpt: false,
    },

    // How the rundown itself behaves — NOT whether the section appears (that is
    // a commented-out component in the app's index.vue). These were the last
    // three website_settings keys still edited from the PM One dashboard; the
    // editor was removed with the rest in Aug 2026, so they live here now like
    // every other display toggle.
    rundown: {
      showSearch: true,
      showLocationFilter: true,
      // Description, speakers and panelists rendered inline. When false they
      // sit behind a click, which is what opens the item dialog.
      showAllDetails: false,
    },

    // Optional fields on the /book-space exhibitor registration form.
    bookSpaceForm: {
      showJobTitle: false,
      showBrandName: true,
      showProducts: false,
    },

    // "Last updated" date printed on the legal pages, as "YYYY-MM-DD".
    terms: {
      lastUpdate: "2025-08-21",
    },

    // Tracking ids. GA4 is NOT here — it stays in each app's nuxt.config
    // `gtag.tags` because nuxt-gtag needs it before hydration. The rest are
    // read by plugins/analytics.client.ts and accept one id or an array.
    tiktokPixelId: "" as string | string[],
    metaPixelId: "" as string | string[],
    gtmId: "" as string | string[],

    // Whether an active event with no content of its own may borrow the most
    // recent previous edition's. Sent to the API as `?fallback=0|1` per
    // endpoint — see useDataFallback. `brands` only affects the home-page
    // preview and brand detail resolution; the /brands listing never borrows.
    dataFallback: {
      brands: true,
      guests: true,
      partners: true,
      mediaCoverages: true,
      programs: true,
      faqs: true,
      gallery: true,
    },
  },

  routes: {
    header: [] as any[],
    dialog: [] as any[],
    footer: [] as any[],
  },

  // Per-project design tokens — OPT-IN (default OFF = each app keeps its native
  // palette from app.css = production look). Two ways to theme a project:
  //   A) Custom brand palette (recommended): edit the app's app/assets/css/app.css
  //      `:root`/`.dark` — override --color-gray-* + semantic tokens (--primary...).
  //   B) A curated shadcn palette: in the app's app.config.ts set
  //      appearance: { enabled: true, baseColor: "zinc", theme: "blue", chartColor: "blue" }
  // Valid values:
  //   baseColor:  native | neutral | stone | zinc | mauve | olive | mist | taupe
  //     ("native" = the palette this repo's main.css/app.css already ships — the default)
  //   theme/chartColor: above + amber blue cyan emerald fuchsia green indigo lime
  //     orange pink purple red rose sky teal violet yellow
  //   radius (optional): default | none | small | medium | large
  appearance: {
    enabled: false,
    baseColor: "native",
    theme: "native",
    chartColor: "native",
    radius: "default",
  },
});
