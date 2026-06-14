import { defineStore } from "pinia";

export const useContentStore = defineStore("content", {
  state: () => ({
    pages: {
      home: {
        title: `Megabuild Indonesia: Building Materials, Architecture, Construction, and Interior Design Expo`,
        description: `Discover the latest trends and innovations in building materials, architecture, and interior design at MEGABUILD Indonesia.`,
        ogImage: "/og/og-home.jpg",
        withoutTitleTemplate: true,
      },
      brands: {
        title: `Brands`,
        description: `Explore the diverse range of brands showcasing the latest innovations and products in the building materials, architecture, and interior design industries.`,
        ogImage: "/og/og-brands.jpg",
      },
      rundown: {
        title: `Rundown`,
        description: `Stay updated with the detailed schedule of events and programs happening at ${useAppConfig().app.name}.`,
        ogImage: "/og/og-rundown.jpg",
      },
      programs: {
        title: `Main Programs`,
        description: `Explore the main programs at ${useAppConfig().app.name}, including exhibitions, business conferences, seminars, and business matching. Gain insights and network with industry experts.`,
        ogImage: "/og/og-programs.jpg",
      },
      contact: {
        title: `Contact us`,
        description: `Need assistance or have questions? Contact us for information on tickets, partnerships, and event details.`,
        ogImage: "/og/og-contact.jpg",
      },
      bookSpace: {
        title: `Book Your Space`,
        description: `Secure your booth at ${useAppConfig().app.name} and showcase your brand to thousands of potential customers. Join leading brands and enhance your business growth.`,
        ogImage: "/og/og-book-space.jpg",
      },
      ticket: {
        title: `Get Your Ticket`,
        description: `Get your entry tickets for the ${useAppConfig().app.name}. Find all the details you need, including dates, venue, and ticket options.`,
        ogImage: "/og/og-ticket.jpg",
      },
      gallery: {
        title: `Event Gallery`,
        description: `Browse through our gallery to see highlights from previous editions of ${useAppConfig().app.name}.`,
      },
      faq: {
        description:
          "Find answers to common questions about our event, tickets, exhibitors, and more.",
        title: `FAQ`,
        description: `Find answers to frequently asked questions about ${useAppConfig().app.name}. Get information on tickets, event details, partnerships, and more.`,
      },
      links: {
        title: `Links`,
        description: `Explore our collection of essential links for convenient navigation.`,
      },
      news: {
        title: `News`,
        description: `Stay updated with the latest insights, news, and trends in the business industry. Read our blog for expert articles and event updates.`,
      },
      ticketPolicy: {
        title: `Ticket Policy`,
        description: `Secure your spot at ${useAppConfig().app.name} by understanding our Ticket Policy. Learn about ticket categories, pricing, and refund guidelines.`,
      },
      eventPolicy: {
        title: `Event Policy`,
        description: `Read the event policy for ${useAppConfig().app.name}. Get details on event rules, regulations, and important guidelines for participants and exhibitors.`,
      },
      partners: {
        title: `Our Partners`,
        description: `This event wouldn't be possible without the incredible support from our community. A huge thank you to the partners, sponsors, and media who help us bring this celebration to life.`,
      },
      terms: {
        title: `Terms of Service`,
        description: `Read the Terms of Service for ${useAppConfig().app.name}, covering the rules and conditions for using our website and services.`,
      },
      privacy: {
        title: `Privacy Policy`,
        description: `Read the Privacy Policy for ${useAppConfig().app.name} and learn how we collect, use, and protect your personal information.`,
      },
      winner: {
        title: `Random Winner Generator`,
        description: `Generate random winners instantly with our Random Winner Generator. Paste names, spin the slot machine, and pick a winner fairly. Perfect for contests, giveaways, and events!`,
      },
    },

    components: {
      hero: {
        countdownLabel: "Doors to the future of your home open in:",
        title: `The Blueprint for Your Dream Renovation.`,
        description: `Take control of your renovation. Touch and feel the latest materials, get direct advice from designers, and build your project with total confidence.`,
        cta: {},
      },

      trustedBy: {
        title: `Trusted by Leading Brands at Megabuild Indonesia`,
      },

      brandPreview: {
        title: `Discover the Amazing Brands at ${useAppConfig().app.name}`,
      },

      about: {},

      brandList: {
        title: "Brands",
        description:
          "Explore the diverse range of brands showcasing the latest innovations and products in the building materials, architecture, and interior design industries.",
      },

      rundown: {
        title: "Rundown",
        description: `Stay updated with the detailed schedule of events and programs happening at ${useAppConfig().app.name}.`,
      },

      mainPrograms: {
        title: `<span class=''>Main</span> <span class='text-accent'>Programs</span>`,
        description: `Explore the main programs at ${useAppConfig().app.name}, including exhibitions, business conferences, seminars, and business matching. Gain insights and network with industry experts.`,
      },

      factsAndFigures: {
        subtitle: "Facts & Figures",
        title: "Why Megabuild Indonesia Leads the Industry",
        description:
          "The facts & figures gathered from 21 editions are testament to the powerful platform that Megabuild Indonesia has provided for thousands of businesses to grow.",
      },

      partnerships: {
        title: `
          <span class=''>Become a </span>
          <span class='text-primary'>Part of our Story</span>
        `,
        description: `Take your business to the next level by participating in
          ${useAppConfig().app.name}. Meet potential partners, gain exposure,
          and grow your network.`,

        exhibitor: {
          title: "Become an Exhibitor",
          description:
            "Calling all brands and entrepreneurs! Showcase your products to a diverse and enthusiastic audience.",
          cta: {
            label: "Book Your Space",
            url: "/book-space",
          },
        },

        partnerships: [
          {
            image: "/img/thumbnails/sponsorship-thumbnail.jpg",
            title: "Become a Sponsor",
            description: `Connect with key decision-makers by sponsoring the industry's leading event.`,
            link: "/sponsorship-registration",
            ctaLabel: "Sponsor us",
          },
          {
            image: "/img/thumbnails/media-partner-thumbnail.jpg",
            title: "Become a Media Partner",
            description: `Partner with us for exclusive access to share the industry's biggest stories.`,
            link: "/media-partner-registration",
            ctaLabel: "Join as Media",
          },
        ],

        reservedSpace: {
          title: `We're saving this space for a great partner. Could it be you?`,
          cta: {
            label: "Become a Partner",
          },
        },
      },

      visitorCta: {
        img: {
          src: "/img/cta-image.png",
          width: 1721,
          height: 1963,
        },
        title: `
          <span class="text-primary">Planning a renovation?</span><br />
          <span class=""
            >Your essential guide awaits you here.</span
          >
        `,
        description: `Stop the endless searching online. Find all the suppliers, ideas, and professional advice you need in one place. Secure your pass to smarter renovation solutions.`,
        cta: {
          label: "Get Ticket",
          iconName: "hugeicons:ticket-01",
          url: "/ticket",
        },
      },

      mediaCoverage: {
        title: "Recognized by Industry Voices",
        description: `Explore media coverage from leading publications about ${useAppConfig().app.name}.`,
      },

      credits: {
        title: "Meet the Community Behind the Event",
        description:
          "This event is brought to life by the amazing support of our partners, sponsors, and media.",
      },

      postSlider: {
        title: {
          default: "Latest Updates",
          morePosts: "You might also like",
        },
      },

      contact: {
        title: "Contact us",
        description:
          "Need assistance or have questions? Contact us for information on tickets, partnerships, and event details.",
      },

      bookSpace: {
        title: "Exhibitor Registration",
        description: `Secure your booth at ${useAppConfig().app.name} and showcase your brand to thousands of potential customers. Join leading brands and enhance your business growth.`,
      },

      faq: {
        description:
          "Find answers to common questions about our event, tickets, exhibitors, and more.",
        title: "Frequently Asked Questions",
        emptyStateDescription:
          "We are gathering commonly asked questions. Please come back later.",
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
