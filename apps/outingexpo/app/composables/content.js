import { defineStore } from "pinia"
export const useContentStore = defineStore("content", {
  state: () => ({
    pages: {
      home: {
        title: `Indonesia Outing & Incentive Travel Expo: Your One-Stop Hub for All Things Outing!`,
        description: `Discover endless inspiration for your next company outing, school trip, or group adventure at Indonesia Outing & Incentive Travel Expo!`,
        ogImage: "/og/og-home.jpg",
        withoutTitleTemplate: true,
      },
      brands: {
        title: `Brands`,
        description: `Discover a diverse array of brands showcasing their products and innovations at the Indonesia Outing & Incentive Travel Expo.`,
        ogImage: "/og/og-brands.jpg",
      },
      rundown: {
        title: `Rundown`,
        description: `Stay updated with the detailed schedule of events and programs happening at ${
          useAppConfig().app.name
        }.`,
        ogImage: "/og/og-rundown.jpg",
      },
      programs: {
        title: `Main Programs`,
        description: `Explore the main programs at ${
          useAppConfig().app.name
        }, including exhibitions, business conferences, seminars, and business matching. Gain insights and network with industry experts.`,
        ogImage: "/og/og-programs.jpg",
      },
      contact: {
        title: `Contact us`,
        description: `Need assistance or have questions? Contact us for information on tickets, partnerships, and event details.`,
        ogImage: "/og/og-contact.jpg",
      },
      bookSpace: {
        title: `Book Your Space`,
        description: `Secure your booth at ${
          useAppConfig().app.name
        } and showcase your brand to thousands of potential customers. Join leading brands and enhance your business growth.`,
        ogImage: "/og/og-book-space.jpg",
      },
      ticket: {
        title: `Get Your Ticket`,
        description: `Get your entry tickets for the ${
          useAppConfig().app.name
        }. Find all the details you need, including dates, venue, and ticket options.`,
        ogImage: "/og/og-ticket.jpg",
      },
      gallery: {
        title: `Event Gallery`,
        description: `Browse through our gallery to see highlights from previous editions of ${
          useAppConfig().app.name
        }.`,
      },
      faq: {
        description:
          "Find answers to common questions about our event, tickets, exhibitors, and more.",
        title: `FAQ`,
        description: `Find answers to frequently asked questions about ${
          useAppConfig().app.name
        }. Get information on tickets, event details, partnerships, and more.`,
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
        description: `Secure your spot at ${
          useAppConfig().app.name
        } by understanding our Ticket Policy. Learn about ticket categories, pricing, and refund guidelines.`,
      },
      eventPolicy: {
        title: `Event Policy`,
        description: `Read the event policy for ${
          useAppConfig().app.name
        }. Get details on event rules, regulations, and important guidelines for participants and exhibitors.`,
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
        countdownLabel: "Adventure begins in:",
        title: `Indonesia Outing & Incentive Travel Expo 2026`,
        description: `Connect with top event organizers, discover amazing destinations, grab exclusive travel deals, and find everything you need for your next unforgettable outing. `,
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
          {
            subHeadline: "Your Gateway to Epic Adventures Awaits!",
            content: `
      <p>Get free access to Indonesia's biggest outing showcase: hundreds of destinations, expert event organizers, and exclusive travel deals all in one place.</p>
    `,
            cta: {
              label: "Get Your Free Ticket",
              link: "/ticket",
            },
          },
          {
            subHeadline:
              "Showcase Your Brand at Indonesia Outing & Incentive Travel Expo 2026!",
            content: `
      <p>Connect with thousands of adventure seekers, corporate planners, and travel enthusiasts actively looking for their next outing experience. Let's create amazing adventures together.</p>
    `,
            cta: {
              label: "Book Your Space Now",
              link: "/book-space",
            },
          },
          {
            subHeadline: "Free Adventure Planning Consultation!",
            content: `
      <p>Bring your ideas! Get personalized advice from professional event organizers and travel experts to plan your perfect outing experience.</p>
    `,
            cta: {
              label: "See All Programs",
              link: "/programs",
            },
          },
          {
            subHeadline: "Stay Adventurous, Stay Connected!",
            content: `
      <p>Follow our Instagram for daily adventure inspiration, exhibitor highlights, and exclusive giveaways leading up to Indonesia Outing & Incentive Travel Expo. Your next adventure starts here!</p>
    `,
            cta: {
              label: "Follow @indooutingexpo",
              link: "https://www.instagram.com/indooutingexpo",
            },
          },
        ],
      },

      brandPreview: {
        title: `Discover the Amazing Brands at ${useAppConfig().app.name}`,
      },

      brandList: {
        title: "Brands",
        description:
          "Discover a diverse array of brands showcasing their products and innovations at the Indonesia Outing & Incentive Travel Expo.",
      },

      rundown: {
        title: "Rundown",
        description: `Stay updated with the detailed schedule of events and programs happening at ${
          useAppConfig().app.name
        }.`,
      },

      mainPrograms: {
        title: `<span class='text-outline'>Main</span> <span class="gradient-accent bg-clip-text font-extrabold text-transparent pr-1">Programs</span>`,
        description: `Explore the main programs at ${
          useAppConfig().app.name
        }, including exhibitions, business conferences, seminars, and business matching. Gain insights and network with industry experts.`,
        list: [
          {
            title: "Outing Inspiration Stage",
            image: "/img/programs/program-1.jpg",
            description: "Fresh ideas from the best in the biz.",
          },
          {
            title: "Live Activity Demos",
            image: "/img/programs/program-2.jpg",
            description: "See team building and activities in action.",
          },
          {
            title: "Flash Deals",
            image: "/img/programs/program-3.jpg",
            description: "On-the-spot outing promos.",
          },
          {
            title: "Business Matching",
            image: "/img/programs/program-4.jpg",
            description: "Connect with buyers & partners.",
          },
          {
            title: "Community Meet-Ups",
            image: "/img/programs/program-5.jpg",
            description: "Grow your network, your way.",
          },
        ],
      },

      partnerships: {
        title: `
          <span class='text-outline'>Become a </span>
          <span class="gradient-accent bg-clip-text font-extrabold text-transparent pr-1">Part of IOITE Story</span>
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
            link: `https://api.whatsapp.com/send?phone=${
              useAppConfig().contact.whatsapp
            }&text=Halo, ${
              useAppConfig().app.shortName
            }! Saya mau tanya-tanya tentang sponsorship.`,
            ctaLabel: "Sponsor us",
          },
          {
            image: "/img/thumbnails/media-partner-thumbnail.jpg",
            title: "Become a Media Partner",
            description: `Partner with us for exclusive access to share the industry's biggest stories.`,
            link: `https://api.whatsapp.com/send?phone=${
              useAppConfig().contact.whatsappMarketing
            }&text=Halo, ${
              useAppConfig().app.shortName
            }! Saya mau tanya-tanya tentang partnership.`,
            ctaLabel: "Join as Media",
          },
        ],

        reservedSpace: {
          title: `We're saving this space for a great partner. Could it be you?`,
          cta: {
            label: "Become a Partner",
            url: `https://api.whatsapp.com/send?phone=${
              useAppConfig().contact.whatsapp
            }&text=Halo, ${useAppConfig().app.shortName}!`,
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
          Your Adventure Starts with One <span class="gradient-accent bg-clip-text font-extrabold text-transparent pr-1">Free Ticket</span>
        `,
        description: `Discover hundreds of exciting outing options, meet professional event planners, and grab special promotions. Reserve your spot at Indonesia Outing & Incentive Travel Expo 2026 today!`,
        cta: {
          label: "Get Free Ticket",
          iconName: "hugeicons:ticket-01",
          url: "/ticket",
        },
        banners: [
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
            image: "/img/banners/flei-25th-poster.jpg",
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
        ],
      },

      mediaCoverage: {
        title: "Recognized by Industry Voices",
        description: `Explore media coverage from leading publications about ${
          useAppConfig().app.name
        }.`,
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
        description: `Secure your booth at ${
          useAppConfig().app.name
        } and showcase your brand to thousands of potential customers. Join leading brands and enhance your business growth.`,
      },

      faq: {
        description:
          "Find answers to common questions about our event, tickets, exhibitors, and more.",
        title: "Frequently Asked Questions",
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
            url: "https://drive.google.com/file/d/1GTk41QgncvptrAEY4ATIdRBSFKlTnBMA/view?usp=sharing",
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
