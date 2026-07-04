import { defineStore } from "pinia";

export const useContentStore = defineStore("content", () => {
  const { t } = useI18n();
  const appName = useAppConfig().app.name;

  const pages = computed(() => ({
    home: {
      title: t("pages.home.title"),
      description: t("pages.home.description"),
      withoutTitleTemplate: true,
    },
    brands: {
      title: t("pages.brands.title"),
      description: t("pages.brands.description"),
    },
    rundown: {
      title: t("pages.rundown.title"),
      description: t("pages.rundown.description", { appName }),
    },
    programs: {
      title: t("pages.programs.title"),
      description: t("pages.programs.description", { appName }),
    },
    contact: {
      title: t("pages.contact.title"),
      description: t("pages.contact.description"),
    },
    bookSpace: {
      title: t("pages.bookSpace.title"),
      description: t("pages.bookSpace.description", { appName }),
    },
    ticket: {
      title: t("pages.ticket.title", { appName }),
      description: t("pages.ticket.description", { appName }),
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
      title: t("hero.title"),
      description: t("hero.description"),
      cta: {},
    },

    brandPreview: {
      title: t("brandPreview.title", { appName }),
    },

    about: {},

    brandList: {
      title: t("brandList.title"),
      description: t("brandList.description"),
    },

    rundown: {
      title: t("rundown.title"),
      description: t("rundown.description", { appName }),
    },

    mainPrograms: {
      title: t("mainPrograms.title"),
      description: t("mainPrograms.description", { appName }),
    },

    factsAndFigures: {
      subtitle: t("factsAndFigures.subtitle"),
      title: t("factsAndFigures.title"),
      description: t("factsAndFigures.description"),
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
      description: t("visitorCta.description"),
      cta: {
        label: t("visitorCta.cta"),
        iconName: "hugeicons:ticket-01",
        url: "/tickets",
      },
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
  }));

  const getMetaByKey = (key) => pages.value[key] || null;

  return { pages, components, getMetaByKey };
});
