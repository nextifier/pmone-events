import { defineStore } from "pinia";

export const useContentStore = defineStore("content", {
  state: () => ({
    pages: {
      home: {
        title: `Panorama Events: HR-Driven Corporate Outings for Team Growth`,
        description: `Transform your team with purposeful corporate outings by Panorama Events. We design HR-driven experiences in Indonesia that boost engagement & build lasting connections.`,
        ogImage: "/og/og-home.jpg",
        withoutTitleTemplate: true,
      },
      about: {
        title: `About`,
        description: `Discover Panorama Events, Indonesia's specialist in HR-driven corporate outings. Learn about our mission to create impactful team experiences, backed by Panorama Group.`,
      },
      services: {
        title: `Corporate Outing Services in Indonesia`,
        description: `Explore comprehensive corporate outing services by Panorama Events. From program design & travel to on-site management, we deliver seamless HR-driven experiences.`,
      },
      events: {
        title: `Impactful Corporate Outing Portfolio`,
        description: `See our successful HR-driven corporate outings! Browse the Panorama Events portfolio for inspiring team building events, retreats & engaging employee experiences.`,
      },
      contact: {
        title: `Plan Your Corporate Outing`,
        description: `Ready for an impactful corporate outing? Contact Panorama Events in Indonesia for a custom proposal. Let's design your team's next growth experience!`,
      },
      faq: {
        title: `Corporate Outing FAQs - Planning & Services`,
        description: `Got questions about corporate outings? Find answers in Panorama Events' FAQ on our HR-driven planning, unique services, budget, customization, and more.`,
      },
      news: {
        title: `News`,
        description: `Stay updated with the latest insights, news, and trends in the business industry. Read our blog for expert articles and event updates.`,
      },
      terms: {
        title: `Terms of Service`,
        description: ``,
      },
      privacy: {
        title: `Privacy Policy`,
        description: ``,
      },
    },

    components: {
      postSlider: {
        title: {
          default: "Latest Updates",
          morePosts: "You might also like",
        },
      },

      contact: {
        title: "Contact us",
        description:
          "Ready for your perfect HR-driven outing? Share some details, and our specialist will contact you soon to discuss your ideas!",
      },

      faq: {
        title: "Frequently Asked Questions",
        emptyStateDescription:
          "We are gathering commonly asked questions. Please come back later 😉",
        contactTitle: "Have any questions? Just send it to us!",
      },

      links: {
        title: "Links",
        list: [
          {
            label: "Tickets",
            url: "/ticket",
            iconName: "hugeicons:ticket-01",
          },
          {
            label: "Brands",
            url: "/brands",
            iconName: "hugeicons:grid-view",
          },
          {
            label: "Rundown",
            url: "/rundown",
            iconName: "hugeicons:check-list",
          },
          // {
          //   label: "Download Visitor E-Guide",
          //   url: "https://drive.google.com/file/d/1O7blEpzAx0HEEAkV3TzF3O-gC_Wab4Fy/view",
          //   iconName: "hugeicons:download-04",
          // },
        ],
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
