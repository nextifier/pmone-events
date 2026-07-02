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
    tiktokPixelId: "" as string | string[],
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
  //   baseColor:  neutral | stone | zinc | mauve | olive | mist | taupe
  //   theme/chartColor: above + amber blue cyan emerald fuchsia green indigo lime
  //     orange pink purple red rose sky teal violet yellow
  //   radius (optional): default | none | small | medium | large
  appearance: {
    enabled: false,
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    radius: "default",
  },
});
