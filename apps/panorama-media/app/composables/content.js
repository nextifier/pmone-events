import { defineStore } from "pinia";

export const useContentStore = defineStore("content", {
  state: () => ({
    // This app ships a bespoke Hero.vue + index.vue that read no content-store
    // copy, so it intentionally does not provide `components.hero`. Declared
    // here so the dev-only content-contract check treats the omission as
    // correct, not a gap.
    contentContractOmit: ["components.hero"],
    pages: {
      home: {
        title: `Panorama Media`,
        description: `Panorama Media is an Indonesian event solutions company creating trade exhibitions, pop culture events, corporate events, and live entertainment.`,
        withoutTitleTemplate: true,
      },
      about: {
        title: `About`,
        description: `Learn about Panorama Media, the team and experience behind some of Indonesia's largest exhibitions, festivals, and corporate events.`,
      },
      products: {
        title: `Products`,
        description: `Explore the products and services offered by Panorama Media, from trade exhibitions to corporate events and live entertainment.`,
      },
      events: {
        title: `Events`,
        description: `Discover events organized by Panorama Media, including trade exhibitions, pop culture festivals, and corporate gatherings across Indonesia.`,
      },
      links: {
        title: `Links`,
        description: `Every Panorama Media link in one place — our brands, events, and how to reach us.`,
      },
      gallery: {
        title: `Gallery`,
        description: `Photos from exhibitions, pop culture events, and corporate events produced by Panorama Media.`,
      },
      programs: {
        title: `Programs`,
        description: `Programs and activities across Panorama Media's events.`,
      },
      ticket: {
        title: `Tickets`,
        description: `Ticketing for events produced by Panorama Media.`,
      },
      winner: {
        title: `Winners`,
        description: `Winner announcements for Panorama Media giveaways and competitions.`,
      },
      partners: {
        title: `Partners`,
        description: `Partners and sponsors supporting Panorama Media events.`,
      },
      rundown: {
        title: `Rundown`,
        description: `Schedule and rundown for events produced by Panorama Media.`,
      },
      contact: {
        title: `Contact`,
        description: `Get in touch with Panorama Media to discuss your next exhibition, festival, corporate event, or live entertainment project.`,
      },
      faq: {
        title: `FAQ`,
        description: `Find answers to common questions about Panorama Media, our events, services, and how to work with us.`,
      },
      news: {
        title: `News`,
        description: `Read the latest news, updates, and stories from Panorama Media and its events across Indonesia.`,
      },
      terms: {
        title: `Terms of Service`,
        description: `Read the Terms of Service for Panorama Media, covering the rules and conditions for using our website and services.`,
      },
      privacy: {
        title: `Privacy Policy`,
        description: `Read the Privacy Policy for Panorama Media and learn how we collect, use, and protect your personal information.`,
      },
      bookSpace: {
        title: `Book Your Space`,
        description: `Secure your booth at ${useAppConfig().app.name} and showcase your brand to thousands of potential customers. Join leading brands and enhance your business growth.`,
      },
    },

    components: {
      postSlider: {
        title: {
          default: "Latest updates",
          morePosts: "You might also like",
        },
      },

      contact: {
        title: "Contact us",
        description: "",
      },

      bookSpace: {
        title: "Exhibitor Registration",
        description: `Secure your booth at ${useAppConfig().app.name} and showcase your brand to thousands of potential customers. Join leading brands and enhance your business growth.`,
      },

      faq: {
        title: "Frequently Asked Questions",
        emptyStateDescription:
          "We are gathering commonly asked questions. Please come back later 😉",
        contactTitle: "Have any questions? Just send it to us!",
      },
    },
  }),

  getters: {
    /**
     * Mengambil metadata untuk halaman tertentu berdasarkan kuncinya.
     * @param {object} state - State store.
     * @returns {function(string): object | null}
     */
    getMetaByKey: (state) => (key) => {
      return state.pages[key] || null;
    },
  },
});
