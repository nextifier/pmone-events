export default defineAppConfig({
  app: {
    name: "",
    shortName: "",
    projectUsername: "",
    url: "",
    company: {
      name: "",
      address: "",
    },
  },

  event: {
    title: "",
    edition: {
      value: 0,
      ordinal: "",
    },
    poster: "",
    status: "",
    startTime: "",
    endTime: "",
    date: "",
    dateOnly: "",
    month: "",
    year: "",
    time: "",
    location: "",
    locationShort: "",
    locationLink: "",
    hall: "",
    teaserVideoId: "",
    profileImage: "",
    description: "",
    offersName: "",
    offersDescription: "",
    inConjunction: {
      label: "In conjunction with",
      list: [] as { name: string; url: string; img: string }[],
    },
  },

  settings: {
    header: {
      logoClass: "h-6 text-primary",
    },
    footer: {
      logoClass: "h-8 text-primary",
    },
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
    ogImage: {
      isDarkMode: true,
    },
    bookSpaceForm: {
      showJobTitle: false,
      showBrandName: true,
      showProducts: false,
    },
    terms: {
      lastUpdate: "",
    },
    tiktokPixelId: "" as string | string[],
  },

  contact: {
    email: "",
    whatsapp: "",
    whatsappMarketing: "",
  },

  social: {
    instagram: "",
    facebook: "",
    linkedin: "",
    youtube: "",
    tiktok: "",
    x: "",
  },

  contactLinks: {} as Record<string, { label: string; path: string }>,
  socialLinks: {} as Record<
    string,
    { label: string; path: string; iconName: string }
  >,

  routes: {
    header: [] as any[],
    dialog: [] as any[],
    footer: [] as any[],
  },
});
