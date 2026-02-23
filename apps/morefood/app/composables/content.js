import { defineStore } from "pinia"
export const useContentStore = defineStore("content", {
  state: () => ({
    pages: {
      home: {
        title: `More Food Expo Indonesia`,
        description: `More Food Expo Indonesia is happening 7-10 May 2026 at JIEXPO. We're connecting food businesses from around the world to Indonesia's growing Halal market. See what's new.`,
        ogImage: "/og/og-home.jpg",
        withoutTitleTemplate: true,
      },
      brands: {
        title: `Brands`,
        description: `See the full list of brands exhibiting at More Food Expo 2026. Find new partners and source products from a diverse lineup of local and international food brands.`,
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
        description: `Learn about the activities at More Food Expo 2026. From our Business Matching service to industry talks, find programs designed to help you make valuable connections.`,
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
        countdownLabel: "Your culinary adventure starts in:",
        subtitle:
          "More than an expo. It's an idea factory for your menu and store.",
        title: `Where Every Ingredient Tells a Story.`,
        description: `We’re serving up more than just food. Discover fresh ideas, new partners, and a whole menu of ways to grow your business.`,
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
            subHeadline: "Exhibitor Registration Is Open!",
            content: `
      <p>Showcase your brand to over 30,000+ buyers, distributors, and F&B professionals. This is your chance to shine in one of Southeast Asia's biggest food markets.</p>
    `,
            img: {
              src: "/img/banners/cover-1.jpg",
              w: 400,
              h: 500,
            },
            cta: {
              label: "Book Your Space Now",
              link: "/book-space",
              openInNewTab: false,
            },
          },
          {
            subHeadline: "Three Expos, One Ticket!",
            content: `
      <p>Your pass also gets you into the <strong>Franchise & License Expo (FLEI)</strong>. Discover even more business models and opportunities, all in one place.</p>
    `,
            img: {
              src: "/img/banners/flei-25th-poster.jpg",
              w: 400,
              h: 500,
            },
            cta: {
              label: "Discover FLEI",
              link: "https://franchise-expo.co.id",
              openInNewTab: true,
            },
          },
          {
            subHeadline: "For the Love of Coffee",
            content: `
      <p>Your ticket includes full access to the <strong>Cafe & Brasserie Expo</strong>. Explore the latest in coffee, pastry, and cutting-edge cafe tech. A must-visit for cafe owners!</p>
    `,
            img: {
              src: "/img/banners/cbe-7th-poster.jpg",
              w: 400,
              h: 500,
            },
            cta: {
              label: "Explore Cafe & Brasserie Expo",
              link: "https://cafebrasserieexpo.com/",
              openInNewTab: true,
            },
          },

          {
            subHeadline: "Did You Know?",
            content: `
      <p>Indonesia is the world's largest Halal food consumption market! It's a multi-billion dollar opportunity waiting for the right products. Are you ready?</p>
    `,
            img: {
              src: "/img/banners/cover-3.jpg",
              w: 400,
              h: 500,
            },
            cta: null,
          },
          {
            subHeadline: "Pro Tip for Visitors",
            content: `
      <p>Wear your most comfortable shoes! With over 20,000m² of space and 1,200+ exhibitors to explore, you'll be doing a lot of walking (and even more tasting!).</p>
    `,
            img: {
              src: "/img/banners/cover-4.jpg",
              w: 400,
              h: 500,
            },
            cta: {
              label: "See Who's Exhibiting",
              link: "/brands",
              openInNewTab: false,
            },
          },
          {
            subHeadline: "Early Bird Tickets Are Coming!",
            content: `
      <p>Want to get the best price for your ticket? Follow us on social media to be the first to know when our Early Bird promo launches. Don't miss out!</p>
    `,
            img: {
              src: "/img/banners/cover-5.jpg",
              w: 400,
              h: 500,
            },
            cta: {
              label: "Follow Us on Instagram",
              link: "https://www.instagram.com/morefoodexpo.id",
              openInNewTab: true,
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
          "See the full list of brands exhibiting at More Food Expo 2026. Find new partners and source products from a diverse lineup of local and international food brands.",
      },

      rundown: {
        title: "Rundown",
        description: `Stay updated with the detailed schedule of events and programs happening at ${
          useAppConfig().app.name
        }.`,
      },

      mainPrograms: {
        title: `<span class='text-outline'>Main</span> <span class='text-accent'>Programs</span>`,
        description: `Every corner of the expo is an opportunity to learn, connect, and get inspired. We've designed a full schedule of programs to help you get the most out of your visit.`,
        list: [
          {
            title: "The Global Marketplace",
            image: "/img/programs/program-1.jpg",
            description: `This is the heart of the event. Explore 20,000m² of space packed with over 1,200 exhibitors from around the world. Discover thousands of new products, ingredients, and technologies, all under one roof.`,
          },
          {
            title: "MoreFood Talks: Industry Summits",
            image: "/img/programs/program-2.jpg",
            description: `Gain a competitive edge with insights from top industry leaders, market analysts, and successful entrepreneurs. Our conference series covers the future of F&B, Halal market trends, and sustainable business practices.`,
          },
          {
            title: "Launch Pad: The Innovation Stage",
            image: "/img/programs/program-3.jpg",
            description: `Be the first to witness the unveiling of brand-new products. Our dedicated Launch Pad stage is where innovative brands debut their latest creations, from groundbreaking food tech to exciting new flavors.`,
          },
          {
            title: "The Inspiration Zone",
            image: "/img/programs/program-4.jpg",
            description: `A hands-on, interactive area designed to spark your creativity. Engage with sensory displays, discover unique food pairings, and get inspired by innovative cafe concepts and retail layouts.`,
          },
          {
            title: "Business Matching Service",
            image: "/img/programs/program-5.jpg",
            description: `Let us play cupid. We’ll connect you with pre-vetted buyers for focused, productive meetings that get straight to the point.`,
          },
          {
            title: "Chef's Table: Live Cooking Demos",
            image: "/img/programs/program-6.jpg",
            description: `See, smell, and taste the future. Renowned chefs take to the stage to transform exhibitors' products into culinary masterpieces. Get front-row seats to live cooking, recipe ideas, and delicious free samples.`,
          },
          {
            title: "Creator's Hub: KOL Live Streams",
            image: "/img/programs/program-7.jpg",
            description: `Feel the buzz! Top food influencers and content creators will be broadcasting live from our Creator's Hub. Watch them discover trends, interview brand owners, and share the excitement with millions online.`,
          },
          {
            title: "Halal Market Workshops",
            image: "/img/programs/program-8.jpg",
            description: `Your practical guide to succeeding in the Halal market. Join our expert-led workshops covering everything from the Halal certification process in Indonesia to marketing strategies for reaching Muslim consumers. Limited seats available.`,
          },
        ],
      },

      partnerships: {
        title: `
          <span class='text-outline'>Become a </span>
          <span class='text-accent'>Part of our Story</span>
        `,
        description: `The success of More Food Expo is built on strong partnerships. Whether you want to showcase your products, amplify your brand, or cover the event, we have an opportunity for you. Find your perfect fit below.`,

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
          src: "/img/cta-img-2.jpg",
          width: 1600,
          height: 897,
        },
        title: `
          <span class='text-outline'>Stop Scrolling.</span>
          <span class='text-accent'>Start Tasting.</span>
        `,
        description: ` Your screen can't capture the taste of opportunity. Secure your ticket and get ready to experience the future of the F&B industry.`,
        cta: {
          label: "Get Ticket",
          iconName: "hugeicons:ticket-01",
          url: "/ticket",
        },
        banners: [
          {
            image: "/img/banners/cbe-7th-poster.jpg",
            subtitle: "Cafe & Brasserie Expo Jakarta",
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
          // {
          //   image: "/img/banners/indooutingexpo-2025-poster.jpg",
          //   subtitle: "Indonesia Outing Expo",
          //   title: "Escape the Office, Build the Team.",
          //   description:
          //     "Discover unique destinations and activities for your next corporate gathering, team building event, or group getaway. Plan your escape here!",
          //   accentColor: {
          //     light: "#0284c7",
          //     dark: "#38bdf8",
          //   },
          //   cta: {
          //     label: "Explore IOE",
          //     link: "https://indooutingexpo.co.id/",
          //   },
          // },
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
