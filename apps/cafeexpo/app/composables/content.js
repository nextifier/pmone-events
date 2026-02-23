import { defineStore } from "pinia"
export const useContentStore = defineStore("content", {
  state: () => ({
    pages: {
      home: {
        title: `Café & Brasserie Expo Jakarta (CBE)`,
        description: `Join the Café & Brasserie Expo, a vibrant celebration of the nation’s coffee culture. Explore tastings, workshops, competitions, and more. Get your tickets now!`,
        ogImage: "/og/og-home.jpg",
        withoutTitleTemplate: true,
      },
      brands: {
        title: `Brands`,
        description: `Discover a diverse array of brands showcasing their products and innovations at the ${useAppConfig().app.name}. From coffee and tea to bakery, dessert, and more, explore what each brand has to offer.`,
        ogImage: "/og/og-brands.jpg",
      },
      rundown: {
        title: `Rundown`,
        description: `Stay updated with the detailed schedule of events and programs happening at ${useAppConfig().app.name}.`,
        ogImage: "/og/og-rundown.jpg",
      },
      programs: {
        title: `Main Programs`,
        description: `Explore the main programs at ${useAppConfig().app.name}. Gain insights and network with industry experts.`,
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
        countdownLabel: "Let the flavor festival begin in:",
        title: `All Your Cravings, All in One Place.`,
        description: `Come taste everything from hundreds of coffee, tea, wine, and chocolate brands. Your free ticket is your all-access pass to three days of flavor.`,
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
          //         subHeadline: "Your Ticket is On Us!",
          //         content: `
          //   <p>That's right. Access to all four festivals, live demos, and inspiring talks is completely free. All you need to do is register and show up ready to indulge.</p>
          // `,
          //         cta: {
          //           label: "Claim Your Free Pass",
          //           link: "/ticket",
          //         },
          //       },
          {
            subHeadline: "Got a Delicious Product?",
            content: `
      <p>Connect with over 23,000+ F&B professionals, cafe owners, and passionate foodies. This is the perfect stage to get your brand tasted and talked about.</p>
    `,
            cta: {
              label: "Showcase Your Brand",
              link: "/book-space",
            },
          },
          {
            subHeadline: "Passion Meets Profit",
            content: `
      <p>Your pass also unlocks the <strong>Franchise & License Expo Indonesia (FLEI)</strong> and <strong>More Food Expo Indonesia</strong> next door. It's the perfect place to learn how to scale your F&B passion into a thriving business.</p>
    `,
            cta: {
              label: "Discover FLEI",
              link: "https://franchise-expo.co.id",
            },
          },
          {
            subHeadline: "Don't Miss a Drop!",
            content: `
      <p>Follow us on Instagram for sneak peeks of our coolest exhibitors, special giveaways, and all the behind-the-scenes action. You won't want to miss it.</p>
    `,
            cta: {
              label: "Follow @cafebrasserieexpo",
              link: "https://www.instagram.com/cafebrasserieexpo",
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
          "Discover a diverse array of cafe brands showcasing their products and innovations. From coffee, tea, wine, to chocolate, and more, explore what each brand has to offer.",
      },

      rundown: {
        title: "Rundown",
        description: `Stay updated with the detailed schedule of events and programs happening at ${useAppConfig().app.name}.`,
      },

      mainPrograms: {
        title: `<span>Main Programs</span>`,
        description: `This is where the real action happens. We’ve packed the schedule with live competitions, hands-on workshops, and endless tastings to make sure every moment of your visit is filled with energy and inspiration.`,
        list: [
          {
            title: "Live Competitions",
            iconName: "hugeicons:champion",
            description: "Feel the adrenaline! Watch the nation's best baristas, brewers, and chefs battle it out for glory on the main stage. The energy is infectious, the talent is unreal.",
          },
          {
            title: "Tasting Bars",
            iconName: "hugeicons:coffee-01",
            description: "This is your playground. Sample hundreds of products from coffee, tea, wine, and chocolate exhibitors. Discover your next favorite flavor, completely free.",
          },
          {
            title: "Hands-On Workshops",
            iconName: "hugeicons:coffee-beans",
            description: "Don't just watch! Participate! Learn to taste wine like a pro, brew the perfect cup, or pair flavors in our intimate, expert-led sessions. Limited seats available.",
          },
          {
            title: "Bean-to-Bar Demos",
            iconName: "hugeicons:chocolate",
            description: "Witness the magic of chocolate making, right before your eyes. Our artisan makers will show you how a simple cacao bean transforms into a delicious bar.",
          },
          {
            title: "Industry Talks",
            iconName: "hugeicons:mic-01",
            description: "Get the inside scoop from the pros. Join casual talks about the future of cafe culture, sustainability in F&B, and the trends you need to know about now.",
          },
          {
            title: "Live Music & DJs",
            iconName: "hugeicons:music-note-01",
            description: "The soundtrack to your flavor journey. We'll have live bands and DJs spinning great tunes throughout the day to keep the good vibes flowing.",
          },
        ],
      },

      partnerships: {
        title: `
          Become a 
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
          The <span class="text-accent">biggest flavor party</span> of the year <span class="text-accent">is free.</span>
        `,
        description: `We're saving you a spot at the tastiest get-together of the year. Come to explore, indulge, and get inspired. All you need is your free pass.`,
        cta: {
          label: "Get Free Ticket",
          iconName: "hugeicons:ticket-01",
          url: "/ticket",
        },
        banners: [
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
          // {
          //   image: "/img/banners/cbe-7th-poster.jpg",
          //   subtitle: "Cafe & Brasserie Expo Indonesia",
          //   title: "For the Love of Coffee & More.",
          //   description:
          //     "Immerse yourself in the world of coffee, tea, and fine foods. The perfect gathering for F&B professionals and aspiring cafe owners to source and connect.",
          //   accentColor: {
          //     light: "#795548",
          //     dark: "#a1887f",
          //   },
          //   cta: {
          //     label: "Explore CBE",
          //     link: "https://cafebrasserieexpo.com/",
          //   },
          // },
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
            url: "https://drive.google.com/file/d/13P-JnDlpK4cOOR2Dke5Cn3vgdckTxB4y/view",
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
