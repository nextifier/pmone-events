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
    brands: {
      title: t("pages.brands.title"),
      description: t("pages.brands.description"),
      ogImage: "/og/og-brands.jpg",
    },
    rundown: {
      title: t("pages.rundown.title"),
      description: t("pages.rundown.description", { appName }),
      ogImage: "/og/og-rundown.jpg",
    },
    programs: {
      title: t("pages.programs.title"),
      description: t("pages.programs.description"),
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
      eyebrow: t("hero.eyebrow"),
      title: t("hero.title"),
      description: t("hero.description"),
      metrics: [
        { value: "8", label: t("hero.metrics.zones") },
        { value: "100+", label: t("hero.metrics.startups") },
        { value: "$100K", label: t("hero.metrics.prize") },
        { value: "30+", label: t("hero.metrics.countries") },
      ],
      ctaTicket: t("hero.ctaTicket"),
      ctaExhibit: t("hero.ctaExhibit"),
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
      description: t("mainPrograms.description"),
      list: [
        {
          title: t("mainPrograms.items.0.title"),
          image: "/img/programs/program-1.jpg",
          description: t("mainPrograms.items.0.description"),
        },
        {
          title: t("mainPrograms.items.1.title"),
          image: "/img/programs/program-2.jpg",
          description: t("mainPrograms.items.1.description"),
        },
        {
          title: t("mainPrograms.items.2.title"),
          image: "/img/programs/program-3.jpg",
          description: t("mainPrograms.items.2.description"),
        },
        {
          title: t("mainPrograms.items.3.title"),
          image: "/img/programs/program-4.jpg",
          description: t("mainPrograms.items.3.description"),
        },
        {
          title: t("mainPrograms.items.4.title"),
          image: "/img/programs/program-5.jpg",
          description: t("mainPrograms.items.4.description"),
        },
        {
          title: t("mainPrograms.items.5.title"),
          image: "/img/programs/program-6.jpg",
          description: t("mainPrograms.items.5.description"),
        },
        {
          title: t("mainPrograms.items.6.title"),
          image: "/img/programs/program-7.jpg",
          description: t("mainPrograms.items.6.description"),
        },
        {
          title: t("mainPrograms.items.7.title"),
          image: "/img/programs/program-8.jpg",
          description: t("mainPrograms.items.7.description"),
        },
      ],
    },

    partnerships: {
      title: t("partnerships.title"),
      description: t("partnerships.description"),

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
      description: t("visitorCta.description"),
      cta: {
        label: t("visitorCta.cta"),
        iconName: "hugeicons:ticket-01",
        url: "/ticket",
      },
      banners: [
        {
          image: "/img/banners/cover-1.jpg",
          subtitle: "Global AI Expo Conference",
          title: "Four Tracks. Sixty Sessions. One Roof.",
          description:
            "Enterprise AI, robotics, healthcare AI, and policy. Single ticket covers all four conference rooms across four days.",
          accentColor: {
            light: "#2563eb",
            dark: "#60a5fa",
          },
          cta: {
            label: "See speakers",
            link: "/rundown",
          },
        },
        {
          image: "/img/banners/cover-2.jpg",
          subtitle: "Startup Pavilion",
          title: "100+ Startups. USD 100K Prize Pool.",
          description:
            "Asia's largest applied AI startup floor. Live pitches, investor matching, and a prize pool for breakout teams.",
          accentColor: {
            light: "#9333ea",
            dark: "#c084fc",
          },
          cta: {
            label: "Explore startups",
            link: "/programs",
          },
        },
      ],
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
      description: t("faq.description"),
      title: t("faq.title"),
      emptyStateDescription: t("faq.emptyState"),
      contactTitle: t("faq.contactTitle"),
    },

  }));

  const getMetaByKey = (key) => pages.value[key] || null;

  return { pages, components, getMetaByKey };
});
