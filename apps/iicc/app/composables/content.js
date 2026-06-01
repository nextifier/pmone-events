import { defineStore } from "pinia";

export const useContentStore = defineStore("content", {
  state: () => ({
    pages: {
      home: {
        title: `The 9th Indonesia International Cocoa Conference & Dinner`,
        description: `The 9th Indonesia International Cocoa Conference & Dinner brings the global cocoa community together in Yogyakarta for keynotes, panels, networking, and a field trip.`,
        withoutTitleTemplate: true,
      },
      brands: {
        title: `Exhibitors`,
        description: `Discover the exhibitors and partners taking part in the 9th Indonesia International Cocoa Conference & Dinner in Yogyakarta.`,
      },
      rundown: {
        title: `Schedule`,
        description: `Explore the full schedule of the 9th Indonesia International Cocoa Conference & Dinner: three days of keynotes, panels, networking, and a field trip.`,
      },
      programs: {
        title: `Programs`,
        description: `Explore the programs of the 9th Indonesia International Cocoa Conference & Dinner, from keynote sessions and panel discussions to networking and a field trip.`,
      },
      contact: {
        title: `Contact`,
        description: `Get in touch with the organizing team of the Indonesia International Cocoa Conference & Dinner for registration, partnership, and event inquiries.`,
      },
      bookSpace: {
        title: `Book Your Space`,
        description: `Become an exhibitor or partner at the 9th Indonesia International Cocoa Conference & Dinner and connect with the global cocoa community.`,
      },
      ticket: {
        title: `Register`,
        description: `Register to attend the 9th Indonesia International Cocoa Conference & Dinner at Hotel Tentrem Yogyakarta, 22-24 July 2026.`,
      },
      gallery: {
        title: `Gallery`,
        description: `Browse photo highlights from previous editions of the Indonesia International Cocoa Conference & Dinner.`,
      },
      faq: {
        title: `FAQ`,
        description: `Find answers to frequently asked questions about the 9th Indonesia International Cocoa Conference & Dinner: registration, schedule, venue, and more.`,
      },
      links: {
        title: `Links`,
        description: `Quick links and resources for the 9th Indonesia International Cocoa Conference & Dinner.`,
      },
      news: {
        title: `News`,
        description: `Read the latest news and updates from the Indonesia International Cocoa Conference & Dinner.`,
      },
      ticketPolicy: {
        title: `Ticket Policy`,
        description: `Read the registration and ticket policy for the 9th Indonesia International Cocoa Conference & Dinner, including categories and refund guidelines.`,
      },
      eventPolicy: {
        title: `Event Policy`,
        description: `Read the event policy and on-site guidelines for the 9th Indonesia International Cocoa Conference & Dinner.`,
      },
      partners: {
        title: `Partners`,
        description: `Meet the partners, sponsors, and supporters behind the 9th Indonesia International Cocoa Conference & Dinner.`,
      },
      terms: {
        title: `Terms of Service`,
        description: `Read the Terms of Service for the Indonesia International Cocoa Conference & Dinner, covering the rules and conditions for using our website and services.`,
      },
      privacy: {
        title: `Privacy Policy`,
        description: `Read the Privacy Policy for the Indonesia International Cocoa Conference & Dinner and learn how we collect, use, and protect your personal information.`,
      },
      winner: {
        title: `Random Winner Generator`,
        description: `Generate random winners for giveaways and activities at the 9th Indonesia International Cocoa Conference & Dinner.`,
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
        description:
          "Have questions about the 9th IICC? Reach out and our team will get back to you.",
      },

      bookSpace: {
        title: "Exhibitor Registration",
        description: `Become an exhibitor or partner at the 9th Indonesia International Cocoa Conference & Dinner and connect with the global cocoa community.`,
      },

      faq: {
        title: "Frequently Asked Questions",
        emptyStateDescription:
          "We are gathering commonly asked questions. Please come back later 😉",
        contactTitle: "Have any questions? Just send it to us!",
      },

      rundown: {
        title: "Conference Schedule",
        description:
          "Three days of keynotes, panels, networking, and a field trip, all in Yogyakarta.",
      },

      mediaCoverage: {
        title: "In the News",
        description:
          "Read media coverage of the Indonesia International Cocoa Conference & Dinner.",
      },

      credits: {
        title: "Meet the Community Behind the Event",
        description:
          "This event is brought to life by the amazing support of our partners, members, and stakeholders.",
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
