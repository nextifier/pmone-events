import { defineStore } from "pinia";

export const useContentStore = defineStore("content", () => {
  const { t } = useI18n();
  const appName = useAppConfig().app.name;
  const config = useAppConfig();

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

  const components = computed(() => ({
    hero: {
      countdownLabel: t("hero.countdownLabel"),
      title: t("hero.title"),
      description: t("hero.description"),
      cta: {},
      announcements: [
        {
          text: t("hero.announcement"),
          link: "/book-space",
        },
        {
          text: t("hero.visitorAnnouncement"),
          link: "/ticket",
        },
      ],
      bannerHero: [
        {
          subHeadline: t("hero.banners.0.subHeadline"),
          content: t("hero.banners.0.content"),
          cta: {
            label: t("hero.banners.0.cta"),
            link: "/book-space",
          },
        },
        // {
        //   subHeadline: t("hero.banners.1.subHeadline"),
        //   content: t("hero.banners.1.content"),
        //   cta: {
        //     label: t("hero.banners.1.cta"),
        //     link: "https://www.instagram.com/megabuildindo",
        //   },
        // },
        {
          startTime: "2026-05-25T00:00:00+07:00",
          endTime: "2026-06-09T23:59:59+07:00",
          adImage: {
            src: "/img/banners/banner-hero/conversions/mb-banner-bondall-sm.jpg",
            srcFull: "/img/banners/banner-hero/mb-banner-bondall.jpg",
            alt: "Bondall",
          },
          // link: "",
        },
        {
          startTime: "2026-05-25T00:00:00+07:00",
          endTime: "2026-06-09T23:59:59+07:00",
          adImage: {
            src: "/img/banners/banner-hero/conversions/mb-banner-enchating-sm.jpg",
            srcFull: "/img/banners/banner-hero/mb-banner-enchating.jpg",
            alt: "Enchating",
          },
        },
        {
          startTime: "2026-05-25T00:00:00+07:00",
          endTime: "2026-06-09T23:59:59+07:00",
          adImage: {
            src: "/img/banners/banner-hero/conversions/mb-banner-fabrica-sm.jpg",
            srcFull: "/img/banners/banner-hero/mb-banner-fabrica.jpg",
            alt: "Fabrica",
          },
        },
        {
          startTime: "2026-05-25T00:00:00+07:00",
          endTime: "2026-06-09T23:59:59+07:00",
          adImage: {
            src: "/img/banners/banner-hero/conversions/mb-banner-fujisan-sm.jpg",
            srcFull: "/img/banners/banner-hero/mb-banner-fujisan.jpg",
            alt: "Fujisan",
          },
        },
        {
          startTime: "2026-05-25T00:00:00+07:00",
          endTime: "2026-06-09T23:59:59+07:00",
          adImage: {
            src: "/img/banners/banner-hero/conversions/mb-banner-inti-solar-sm.jpg",
            srcFull: "/img/banners/banner-hero/mb-banner-inti-solar.jpg",
            alt: "Inti Solar",
          },
        },
        {
          startTime: "2026-05-25T00:00:00+07:00",
          endTime: "2026-06-09T23:59:59+07:00",
          adImage: {
            src: "/img/banners/banner-hero/conversions/mb-banner-kayu-asri-sm.jpg",
            srcFull: "/img/banners/banner-hero/mb-banner-kayu-asri.jpg",
            alt: "Kayu Asri",
          },
        },
        {
          startTime: "2026-05-25T00:00:00+07:00",
          endTime: "2026-06-09T23:59:59+07:00",
          adImage: {
            src: "/img/banners/banner-hero/conversions/mb-banner-mevval-sm.jpg",
            srcFull: "/img/banners/banner-hero/mb-banner-mevval.jpeg",
            alt: "Mevval",
          },
        },
        {
          startTime: "2026-05-25T00:00:00+07:00",
          endTime: "2026-06-09T23:59:59+07:00",
          adImage: {
            src: "/img/banners/banner-hero/conversions/mb-banner-vas-lighting-sm.jpg",
            srcFull: "/img/banners/banner-hero/mb-banner-vas-lighting.jpg",
            alt: "VAS Lighting",
          },
        },
      ],
    },

    trustedBy: {
      title: t("trustedBy.title"),
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
      list: [
        {
          title: t("mainPrograms.items.0.title"),
          description: t("mainPrograms.items.0.description"),
        },
        {
          title: t("mainPrograms.items.1.title"),
          description: t("mainPrograms.items.1.description"),
        },
        {
          title: t("mainPrograms.items.2.title"),
          description: t("mainPrograms.items.2.description"),
        },
        {
          title: t("mainPrograms.items.3.title"),
          description: t("mainPrograms.items.3.description"),
        },
        {
          title: t("mainPrograms.items.4.title"),
          description: t("mainPrograms.items.4.description"),
        },
        {
          title: t("mainPrograms.items.5.title"),
          description: t("mainPrograms.items.5.description"),
        },
        {
          title: t("mainPrograms.items.6.title"),
          description: t("mainPrograms.items.6.description"),
        },
        {
          title: t("mainPrograms.items.7.title"),
          description: t("mainPrograms.items.7.description"),
        },
        {
          title: t("mainPrograms.items.8.title"),
          description: t("mainPrograms.items.8.description"),
        },
        {
          title: t("mainPrograms.items.9.title"),
          description: t("mainPrograms.items.9.description"),
        },
        {
          title: t("mainPrograms.items.10.title"),
          description: t("mainPrograms.items.10.description"),
        },
        {
          title: t("mainPrograms.items.11.title"),
          description: t("mainPrograms.items.11.description"),
        },
        {
          title: t("mainPrograms.items.12.title"),
          description: t("mainPrograms.items.12.description"),
        },
        {
          title: t("mainPrograms.items.13.title"),
          description: t("mainPrograms.items.13.description"),
        },
        {
          title: t("mainPrograms.items.14.title"),
          description: t("mainPrograms.items.14.description"),
        },
        {
          title: t("mainPrograms.items.15.title"),
          description: t("mainPrograms.items.15.description"),
        },
      ],
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
          image: "/img/banners/flei-26th-poster.jpg",
          subtitle: "Franchise & License Expo Indonesia",
          title: "Your Entrepreneurial Journey Starts Here.",
          description:
            "Looking to start your own business? Discover hundreds of proven franchise opportunities from top local and international brands. Find your future venture!",
          accentColor: {
            light: "#0891b2",
            dark: "#06b6d4",
          },
          cta: {
            label: "Explore FLEI",
            link: "https://franchise-expo.co.id",
          },
        },
        {
          image: "/img/banners/cbe-8th-poster.jpg",
          subtitle: "Cafe n' Brasserie Expo",
          title: "For the Love of Coffee & More.",
          description:
            "Immerse yourself in the world of coffee, tea, and fine foods. The perfect gathering for F&B professionals and aspiring cafe owners to source and connect.",
          accentColor: {
            light: "#795548",
            dark: "#a1887f",
          },
          cta: {
            label: "Explore CBE",
            link: "https://cafebrasserieexpo.com/",
          },
        },
        {
          image: "/img/banners/morefood-2026-poster.jpg",
          subtitle: "MoreFood Expo Indonesia",
          title: "Where Every Ingredient Tells a Story.",
          description:
            "MoreFood Expo is serving up more than just food. Discover fresh ideas, new partners, and a whole menu of ways to grow your business.",
          accentColor: {
            light: "#e7000b",
            dark: "#ff6467",
          },
          cta: {
            label: "Explore MoreFood",
            link: "https://morefoodexpo.com",
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
      title: t("faq.title"),
      description: t("faq.description"),
      emptyStateDescription: t("faq.emptyState"),
      contactTitle: t("faq.contactTitle"),
    },
  }));

  const getMetaByKey = (key) => pages.value[key] || null;

  return { pages, components, getMetaByKey };
});
