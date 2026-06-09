import { defineStore } from "pinia";

export const useContentStore = defineStore("content", () => {
  const { t } = useI18n();
  const appName = useAppConfig().app.name;

  const pages = computed(() => ({
    home: {
      title: t("pages.home.title"),
      description: t("pages.home.description"),
      ogImage: "/og/og-home.jpg",
      withoutTitleTemplate: true,
    },
    icgp: {
      title: t("pages.icgp.title"),
      description: t("pages.icgp.description"),
    },
    guests: {
      title: t("pages.guests.title"),
      description: t("pages.guests.description", { appName }),
    },
    brands: {
      title: t("pages.brands.title"),
      description: t("pages.brands.description", { appName }),
      ogImage: "/og/og-brands.jpg",
    },
    rundown: {
      title: t("pages.rundown.title"),
      description: t("pages.rundown.description", { appName }),
      ogImage: "/og/og-rundown.jpg",
    },
    programs: {
      title: t("pages.programs.title"),
      description: t("pages.programs.description", { appName }),
      ogImage: "/og/og-programs.jpg",
    },
    contact: {
      title: t("pages.contact.title"),
      description: t("pages.contact.description"),
      ogImage: "/og/og-contact.jpg",
    },
    bookSpace: {
      title: t("pages.bookSpace.title"),
      description: t("pages.bookSpace.description", { appName }),
      ogImage: "/og/og-book-space.jpg",
    },
    ticket: {
      title: t("pages.ticket.title", { appName }),
      description: t("pages.ticket.description", { appName }),
      ogImage: "/og/og-ticket.jpg",
    },
    gallery: {
      title: t("pages.gallery.title"),
      description: t("pages.gallery.description", { appName }),
    },
    faq: {
      title: t("pages.faq.title"),
      description: t("pages.faq.description", { appName }),
    },
    links: {
      title: t("pages.links.title"),
      description: t("pages.links.description"),
    },
    news: {
      title: t("pages.news.title"),
      description: t("pages.news.description"),
    },
    eventGuidelines: {
      title: t("pages.eventGuidelines.title"),
      description: t("pages.eventGuidelines.description", { appName }),
    },
    safetyAndWeaponPolicy: {
      title: t("pages.safetyAndWeaponPolicy.title"),
      description: t("pages.safetyAndWeaponPolicy.description", { appName }),
    },
    antiHarassmentPolicy: {
      title: t("pages.antiHarassmentPolicy.title"),
      description: t("pages.antiHarassmentPolicy.description", { appName }),
    },
    meetAndGreet: {
      title: t("pages.meetAndGreet.title"),
      description: t("pages.meetAndGreet.description", { appName }),
    },
    portfolioReview: {
      title: t("pages.portfolioReview.title"),
      description: t("pages.portfolioReview.description", { appName }),
    },
    raya: {
      title: t("pages.raya.title"),
      description: t("pages.raya.description"),
    },
    specialShow: {
      title: t("pages.specialShow.title"),
      description: t("pages.specialShow.description", { appName }),
    },
    workshop: {
      title: t("pages.workshop.title"),
      description: t("pages.workshop.description", { appName }),
    },
    ticketPolicy: {
      title: t("pages.ticketPolicy.title"),
      description: t("pages.ticketPolicy.description", { appName }),
    },
    eventPolicy: {
      title: t("pages.eventPolicy.title"),
      description: t("pages.eventPolicy.description", { appName }),
    },
    partners: {
      title: t("pages.partners.title"),
      description: t("pages.partners.description"),
    },
    terms: {
      title: t("pages.terms.title"),
      description: t("pages.terms.description"),
    },
    privacy: {
      title: t("pages.privacy.title"),
      description: t("pages.privacy.description"),
    },
    winner: {
      title: t("pages.winner.title"),
      description: t("pages.winner.description"),
    },
  }));

  const config = useAppConfig();

  const components = computed(() => ({
    hero: {
      countdownLabel: t("hero.countdownLabel"),
      subHeadline: t("hero.subHeadline"),
      title: t("hero.title"),
      description: t("hero.description"),
      cta: {},
      announcements: [
        {
          text: t("hero.announcement"),
          link: "/book-space",
        },
      ],

    },

    brandPreview: {
      title: t("brandPreview.title"),
    },

    about: {},

    brandList: {
      title: t("brandList.title"),
      description: t("brandList.description", { appName }),
    },

    rundown: {
      title: t("rundown.title"),
      description: t("rundown.description", { appName }),
    },

    mainPrograms: {
      title: t("mainPrograms.title"),
      description: t("mainPrograms.description", { appName }),
    },

    partnerships: {
      title: t("partnerships.title"),
      description: t("partnerships.description", { appName }),

      exhibitor: {
        title: t("partnerships.exhibitor.title"),
        description: t("partnerships.exhibitor.description"),
        cta: {
          label: t("partnerships.exhibitor.cta"),
          url: "/book-space",
        },
      },

      partnerships: [
        {
          image: "/img/thumbnails/sponsorship-thumbnail.jpg",
          title: t("partnerships.sponsor.title"),
          description: t("partnerships.sponsor.description"),
          link: "/sponsorship-registration",
          ctaLabel: t("partnerships.sponsor.cta"),
        },
        {
          image: "/img/thumbnails/media-partner-thumbnail.jpg",
          title: t("partnerships.mediaPartner.title"),
          description: t("partnerships.mediaPartner.description"),
          link: "/media-partner-registration",
          ctaLabel: t("partnerships.mediaPartner.cta"),
        },
      ],

      reservedSpace: {
        title: t("partnerships.reservedSpace.title"),
        cta: {
          label: t("partnerships.reservedSpace.cta"),
          url: `https://api.whatsapp.com/send?phone=${config.contact.whatsapp}&text=Halo, ${config.app.shortName}!`,
        },
      },
    },

    visitorCta: {
      img: {
        src: "/img/cta-image.png",
        width: 1721,
        height: 1963,
      },
      title: t("visitorCta.title"),
      description: t("visitorCta.description", { appName }),
      cta: {
        label: t("visitorCta.cta"),
        iconName: "hugeicons:ticket-01",
        url: "/ticket",
      },
      banners: [],
    },

    mediaCoverage: {
      title: t("mediaCoverage.title"),
      description: t("mediaCoverage.description", { appName }),
    },

    credits: {
      title: t("credits.title"),
      description: t("credits.description"),
    },

    postSlider: {
      title: {
        default: t("postSlider.title"),
        morePosts: t("postSlider.titleMorePosts"),
      },
    },

    contact: {
      title: t("contact.title"),
      description: t("contact.description"),
    },

    bookSpace: {
      title: t("bookSpace.title"),
      description: t("bookSpace.description", { appName }),
    },

    faq: {
      title: t("faq.title"),
      description: t("faq.description"),
      emptyStateDescription: t("faq.emptyState"),
      contactTitle: t("faq.contactTitle"),
    },

    eventGuidelines: {
      title: t("eventGuidelines.title"),
      list: [
        {
          img: "no-indecent-costumes.svg",
          title: t("eventGuidelines.items.0.title"),
          description: t("eventGuidelines.items.0.description"),
        },
        {
          img: "no-harassment.svg",
          title: t("eventGuidelines.items.1.title"),
          description: t("eventGuidelines.items.1.description"),
        },
        {
          img: "no-dangerous-props.svg",
          title: t("eventGuidelines.items.2.title"),
          description: t("eventGuidelines.items.2.description"),
        },
        {
          img: "no-traffic-obstruction.svg",
          title: t("eventGuidelines.items.3.title"),
          description: t("eventGuidelines.items.3.description"),
        },
        {
          img: "no-littering.svg",
          title: t("eventGuidelines.items.4.title"),
          description: t("eventGuidelines.items.4.description"),
        },
      ],
    },
  }));

  const getMetaByKey = (key) => pages.value[key] || null;

  return { pages, components, getMetaByKey };
});
