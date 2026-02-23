import { defineStore } from "pinia"
export const useContentStore = defineStore("content", {
  state: () => ({
    pages: {
      home: {
        title: `Franchise & License Expo Indonesia (FLEI) · Unlock Business Opportunities`,
        description: `Join us at FLEI in Jakarta to explore top franchise and license brands, attend insightful seminars, and network with industry leaders.`,
        ogImage: "/og/og-home.jpg",
        withoutTitleTemplate: true,
      },
      brands: {
        title: `Brands`,
        description: `Explore a diverse range of franchise and license brands from various business categories.`,
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
        description: ``,
      },
      privacy: {
        title: `Privacy Policy`,
        description: ``,
      },
      winner: {
        title: `Random Winner Generator`,
        description: `Generate random winners instantly with our Random Winner Generator. Paste names, spin the slot machine, and pick a winner fairly. Perfect for contests, giveaways, and events!`,
      },
    },

    components: {
      hero: {
        countdownLabel: "Your next business venture awaits in:",
        title: `Build Your Business Empire Here.`,
        description: `Meet top-tier brands from F&B, retail, education, and more. This
          is your prime destination to connect, learn, and build a
          profitable business.`,
        cta: {},
        announcements: [
          // {
          //   text: `Free tickets available`,
          //   link: "/ticket",
          // },
          {
            text: `Space is still available for exhibitors`,
            link: "/book-space",
          },
        ],

        bannerHero: [
          //       {
          //         subHeadline: "Your Ticket to Success is FREE!",
          //         content: `
          //   <p>Get direct access to hundreds of business opportunities, expert talks, and business coaching sessions, all for free. All you need to do is register.</p>
          // `,
          //         // img: {
          //         //   src: "/img/banners/flei-free-ticket.jpg", // Placeholder image name
          //         //   w: 400,
          //         //   h: 500,
          //         // },
          //         cta: {
          //           label: "Register for Free Now",
          //           link: "/ticket",
          //         },
          //       },
          {
            subHeadline: "Exhibitor Registration Is Open!",
            content: `
      <p>Showcase your brand at our milestone 26th edition in Indonesia's most-hyped venue, JIExpo Kemayoran. Connect with over 14,000+ quality buyers.</p>
    `,
            // img: {
            //   src: "/img/banners/flei-exhibit-at-nice.jpg", // Placeholder image name
            //   w: 400,
            //   h: 500,
            // },
            cta: {
              label: "Book Your Space Now",
              link: "/book-space",
            },
          },
          {
            subHeadline: "One Pass, Three Massive Shows!",
            content: `
      <p>Your FREE pass also gets you into the <strong>Cafe & Brasserie Expo Indonesia</strong> and <strong>More Food Expo Indonesia</strong>.</p>
    `,
            // img: {
            //   src: "/img/banners/flei-and-cbe-promo.jpg", // Placeholder image name
            //   w: 400,
            //   h: 500,
            // },
            cta: {
              label: "Discover Cafe & Brasserie Expo",
              link: "https://cafebrasserieexpo.com",
            },
          },
          // {
          //   subHeadline: "Pro Tip for Visitors",
          //   content: `
          //     <p>Bring your business cards! You'll be networking with future partners across our massive exhibition hall. Prepare for a productive day.</p>
          //   `,
          //   // img: {
          //   //   src: "/img/banners/flei-visitor-tips.jpg", // Placeholder image name
          //   //   w: 400,
          //   //   h: 500,
          //   // },
          //   cta: {
          //     label: "See Who's Exhibiting",
          //     link: "/brands",
          //   },
          // },
          {
            subHeadline: "Don't Miss Any Updates!",
            content: `
      <p>Follow us on Instagram for the latest exhibitor reveals, speaker announcements, and special promos. Be the first to know what's happening!</p>
    `,
            // img: {
            //   src: "/img/banners/flei-follow-instagram.jpg", // Placeholder image name
            //   w: 400,
            //   h: 500,
            // },
            cta: {
              label: "Follow @fleiexpoid",
              link: "https://www.instagram.com/fleiexpoid",
            },
          },
        ],
      },

      brandPreview: {
        title: `Discover the Amazing Brands at ${useAppConfig().app.name}`,
      },

      about: {},

      brandList: {
        title: "Brands",
        description:
          "Explore a diverse range of franchise and license brands from various business categories.",
      },

      rundown: {
        title: "Rundown",
        description: `Stay updated with the detailed schedule of events and programs happening at ${useAppConfig().app.name}.`,
      },

      mainPrograms: {
        title: `<span class='text-outline'>Main</span> <span class='text-accent'>Programs</span>`,
        description: `Explore the main programs at ${useAppConfig().app.name}, including exhibitions, business conferences, seminars, and business matching. Gain insights and network with industry experts.`,
        list: [
          {
            title: "Business Conference",
            iconName: "hugeicons:mic-01",
            description: `This is our main stage, where the biggest ideas and latest industry trends come to life. Join our "Grab-Run-Grow" sessions featuring top CEOs and founders who will share their playbooks for success in today's market.`,
          },
          {
            title: "Business Coaching",
            iconName: "hugeicons:chart-evaluation",
            description: "Got specific questions about any area of the business world? Sit down with our panel of experts for free, one-on-one consultations. Get personalized advice and solve the real-world challenges your business is facing.",
          },
          {
            title: "Business Matching",
            iconName: "hugeicons:agreement-01",
            description: "Why leave networking to chance? Our platform lets you find and schedule meetings with the right exhibitors and investors before you even arrive. Walk in with a plan, walk out with potential partners.",
          },
          {
            title: "Practical Masterclasses",
            iconName: "hugeicons:gitbook",
            description: "Go beyond theory in these deep-dive workshops. Learn actionable skills in digital marketing, operational efficiency, and brand management directly from leaders who practice it every day. Limited seats available.",
          },
          {
            title: "Ecopreneur Challenge",
            iconName: "hugeicons:leaf-03",
            description: "Have a brilliant, sustainable business idea? This is your stage. Showcase your vision in front of investors, get expert feedback, and compete for prizes that can help launch your green venture into the spotlight.",
          },
          {
            title: "Inspiration Stage",
            iconName: "hugeicons:ai-idea",
            description: "Hear the unfiltered stories, the struggles, and the strategies from founders who have built their empires from the ground up. Get motivated, learn from their journeys, and ignite your own ambition.",
          },
        ],
      },

      partnerships: {
        title: `
          <span class='text-outline'>Become a </span>
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
            link: `https://api.whatsapp.com/send?phone=${useAppConfig().contact.whatsapp}&text=Halo, ${useAppConfig().app.shortName}! Saya mau tanya-tanya tentang sponsorship.`,
            ctaLabel: "Sponsor us",
          },
          {
            image: "/img/thumbnails/media-partner-thumbnail.jpg",
            title: "Become a Media Partner",
            description: `Partner with us for exclusive access to share the industry's biggest stories.`,
            link: `https://api.whatsapp.com/send?phone=${useAppConfig().contact.whatsappMarketing}&text=Halo, ${useAppConfig().app.shortName}! Saya mau tanya-tanya tentang partnership.`,
            ctaLabel: "Join as Media",
          },
        ],

        reservedSpace: {
          title: `We're saving this space for a great partner. Could it be you?`,
          cta: {
            label: "Become a Partner",
            url: `https://api.whatsapp.com/send?phone=${useAppConfig().contact.whatsapp}&text=Halo, ${useAppConfig().app.shortName}!`,
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
          The <span class="text-accent">best investment</span> you'll make this year <span class="text-accent">is free.</span>
        `,
        description: `Join thousands of entrepreneurs and investors at Indonesia's most anticipated business show. Your ticket is free and registration only takes a minute.`,
        cta: {
          label: "Get Free Ticket",
          iconName: "hugeicons:ticket-01",
          url: "/ticket",
        },
        banners: [
          {
            image: "/img/banners/indooutingexpo-2025-poster.jpg",
            subtitle: "Indonesia Outing Expo",
            title: "Escape the Office, Build the Team.",
            description:
              "Discover unique destinations and activities for your next corporate gathering, team building event, or group getaway. Plan your escape here!",
            accentColor: {
              light: "#0284c7",
              dark: "#38bdf8",
            },
            cta: {
              label: "Explore IOE",
              link: "https://indooutingexpo.co.id/",
            },
          },
          {
            image: "/img/banners/cbe-7th-poster.jpg",
            subtitle: "Cafe & Brasserie Expo Indonesia",
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
            image: "/img/banners/renex-2025-poster.jpg",
            subtitle: "Renovation Expo",
            title: "The Blueprint for Your Home Renovation.",
            description:
              "Take control of your renovation. Touch and feel the latest materials, get direct advice from designers, and build your project with total confidence.",
            accentColor: {
              light: "#2563eb",
              dark: "#60a5fa",
            },
            cta: {
              label: "Explore RENEX",
              link: "https://megabuild.co.id",
            },
          },
        ],
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
        title: "Frequently Asked Questions",
        description:
          "Find answers to common questions about our event, tickets, exhibitors, and more.",
        emptyStateDescription:
          "We are gathering commonly asked questions. Please come back later.",
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
          {
            label: "Download Visitor E-Guide",
            url: "https://drive.google.com/file/d/1qmDvCfge_EPzkt2q0vX1dkuZwUhiuJWw/view",
            iconName: "hugeicons:download-04",
          },
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
