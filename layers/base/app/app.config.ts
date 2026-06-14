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
      logoClass: "h-6 text-primary",
    },
    footer: {
      logoClass: "h-8 text-primary",
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
});
