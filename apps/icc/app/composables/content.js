import { defineStore } from "pinia"
export const useContentStore = defineStore("content", {
  state: () => ({
    pages: {
      home: {
        title: `Indonesia Comic Con (ICC)`,
        description: `Join us at Indonesia Comic Con for an unforgettable experience filled with toys, movies, comics, games, and lifestyle. Meet your favorite artists, celebrities, and fellow fans!`,
        ogImage: "/og/og-home.jpg",
        withoutTitleTemplate: true,
      },
      guests: {
        title: `Guests`,
        description: `Meet the stars of ${useAppConfig().app.name}! Explore our lineup of special guests, including celebrities, artists, and industry icons joining us in Jakarta.`,
      },
      brands: {
        title: `Brands`,
        description: `Explore the diverse range of brands at ICC, featuring the latest in comics, collectibles, gaming, tech, and pop culture products.`,
        ogImage: "/og/og-brands.jpg",
      },
      rundown: {
        title: `Rundown`,
        description: `Stay updated with the detailed schedule of events and programs happening at ${useAppConfig().app.name}.`,
        ogImage: "/og/og-rundown.jpg",
      },
      programs: {
        title: `Main Programs`,
        description: `Immerse yourself in the heart of ${useAppConfig().app.name} with our main programs, featuring world-class exhibitions, thrilling competitions, and exclusive panels that bring the world of pop culture to life.`,
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
      eventGuidelines: {
        title: `Event Guidelines`,
        description: `Ensure a fantastic experience at ${useAppConfig().app.name} by familiarizing yourself with our Event Guidelines. Learn about cosplay rules, conduct expectations, and other essential information. Let's make this celebration memorable and enjoyable for everyone!`,
      },
      safetyAndWeaponPolicy: {
        title: `Safety and Weapon Policy`,
        description: `Your safety is our top priority at ${useAppConfig().app.name}. Review our Safety and Weapon Policy to understand guidelines ensuring a secure environment for all attendees. Enjoy the pop culture celebration with peace of mind.`,
      },
      antiHarassmentPolicy: {
        title: `Anti-Harassment Policy`,
        description: `${useAppConfig().app.name} is committed to creating a safe and inclusive space for everyone. Explore our Anti-Harassment Policy to understand our zero-tolerance approach. Let's foster an environment of respect and enjoyment together.`,
      },
      meetAndGreet: {
        title: `Meet & Greet`,
        description: `Join the Meet & Greet at ${useAppConfig().app.name} for exclusive opportunities to interact with your favorite stars and creators. Don't miss out on autographs, photos, and personal interactions with the industry's top talent!`,
      },
      portfolioReview: {
        title: `Portfolio Review`,
        description: `Get expert feedback on your work at the ${useAppConfig().app.name} Portfolio Review. Enhance your skills with personalized critiques from industry professionals. Sign up now for an exclusive opportunity to showcase your talent!`,
      },
      raya: {
        title: `Raya Championship of Cosplay`,
        description: `Step into the spotlight at the Raya Championship of Cosplay and unleash your creative genius! Join the ranks of talented cosplayers competing for fame and glory.`,
      },
      specialShow: {
        title: `Special Show`,
        description: `Join the Special Show at ${useAppConfig().app.name}.`,
      },
      workshop: {
        title: `Workshop`,
        description: `Join the Workshop at ${useAppConfig().app.name}.`,
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
        countdownLabel: "Countdown to ICC 2026",
        subHeadline: "New Venue. Same Energy.",
        title: `A DECADE OF POP CULTURE FIESTA`,
        description: `Indonesia Comic Con has been the home for comics, toys, movies, games, and cosplay. This October, we're celebrating a decade of pop culture, and you're invited.`,
        cta: {},
        announcements: [
          // {
          //   text: `Tickets available`,
          //   link: "/ticket",
          // },
          {
            text: `Space is still available for exhibitors`,
            link: "/book-space",
          },
        ],

        bannerHero: [
          //       {
          //         subHeadline: "Did you know?",
          //         content: `
          //   <p>The "X" in "ICC X INACON" marks both our epic crossover with INACON and our legendary 10th (X) anniversary since our journey began in 2015!</p>
          // `,
          //         img: {
          //           src: "/img/banners/hero/banner-thumb-x.png",
          //           w: 400,
          //           h: 500,
          //         },
          //       },

          //       {
          //         subHeadline: "Meet INACON Mascots",
          //         content: `
          //   <p>ICC's Captain Sultan joins forces with INACON's dynamic duo, Kaito Arjuna & Kirana Yumi.</p>
          // `,
          //         img: {
          //           src: "/img/banners/hero/banner-thumb-mascots.png",
          //           w: 400,
          //           h: 500,
          //         },
          //         cta: {
          //           label: "Discover INACON",
          //           link: "https://indonesiaanimecon.com",
          //         },
          //       },

          {
            subHeadline: "Tenant Registration",
            content: `
      <p>Connect your brand with thousands of pop culture fans and collectors at Indonesia's largest pop culture event!</p>
    `,
            img: "",
            cta: {
              label: "Book Space",
              link: "/book-space",
            },
          },

          //       {
          //         subHeadline: "Community Booth Registration",
          //         content: `
          //   <p>Showcase your fan community at ICC x INACON by registering now for a chance to secure a FREE booth!</p>
          // `,
          //         // img: {
          //         //   src: "/img/thumbnails/community-registration.jpg",
          //         //   w: 400,
          //         //   h: 400,
          //         // },
          //         cta: {
          //           label: "Register Now",
          //           link: "/community-form",
          //         },
          //       },
        ],
      },

      brandPreview: {
        title: `Brands`,
      },

      about: {},

      brandList: {
        title: "Brands",
        description: `Discover the amazing brands showcasing their latest products and innovations at ${useAppConfig().event.title}.`,
      },

      rundown: {
        title: "Rundown",
        description: `Stay updated with the detailed schedule of events and programs happening at ${useAppConfig().event.title}.`,
      },

      mainPrograms: {
        title: `Main Programs`,
        description: `Immerse yourself in the heart of ${useAppConfig().event.title} with our main programs, featuring world-class exhibitions, thrilling competitions, and exclusive panels that bring the world of pop culture to life.`,
        list: [
          {
            title: "Exhibition",
            image: "/img/programs/main-programs/exhibition.jpg",
            description: "",
          },
          {
            title: "Main Guest Talkshow",
            image: "/img/programs/main-programs/main-guest-talkshow.jpg",
            description: "",
          },
          {
            title: "Meet & Greet",
            image: "/img/programs/main-programs/meet-and-greet.jpg",
            // link: "/meet-and-greet",
            description: "",
          },
          {
            title: "Cosplay Parade",
            image: "/img/programs/main-programs/cosplay-parade.jpg",
            description: "",
          },
          {
            title: "Cosplay Competition",
            image: "/img/programs/main-programs/cosplay-competition.jpg",
            description: "",
          },
          {
            title: "Gaming Competition",
            image: "/img/programs/main-programs/gaming-competition.jpg",
            description: "",
          },
          {
            title: "Movie Panel",
            image: "/img/programs/main-programs/movie-panel.jpg",
            description: "",
          },
          {
            title: "Portfolio Review",
            image: "/img/programs/main-programs/portfolio-review.jpg",
            // link: "/portfolio-review",
            description: "",
          },

          {
            title: "Creator Workshop",
            image: "/img/programs/main-programs/creator-workshop.jpg",
            // link: "/workshop",
            description: "",
          },
          {
            title: "Toys Auction",
            image: "/img/programs/main-programs/toys-auction.jpg",
            description: "",
          },
          {
            title: "Stamp Rally",
            image: "/img/programs/main-programs/stamp-rally.jpg",
            description: "",
          },
          {
            title: "Live Performance",
            image: "/img/programs/main-programs/live-performance.jpg",
            description: "",
          },
        ],
      },

      partnerships: {
        title: `
          Become a Part of our Story
        `,
        description: `Take your business to the next level by participating in
          ${useAppConfig().event.title}. Meet potential partners, gain exposure,
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
          // {
          //   image: "/img/thumbnails/community-registration.jpg",
          //   title: "Community Booth Registration",
          //   description:
          //     "Get a limited free booth for pop culture-related communities.",
          //   link: "/community-form",
          //   ctaLabel: "Join as Community",
          // },
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
          Experience the Epic Pop Culture Crossover of the Year
        `,
        description: `${useAppConfig().app.name} is back and bigger than ever! Don't miss out on meeting legendary guests, watching epic stage performances, and creating amazing memories. Secure your spot now!`,
        cta: {
          label: "Get Ticket",
          iconName: "hugeicons:ticket-01",
          url: "/ticket",
        },
        banners: [
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
          // {
          //   image: "/img/banners/flei-25th-poster.jpg",
          //   subtitle: "Franchise & License Expo Indonesia",
          //   title: "Your Entrepreneurial Journey Starts Here.",
          //   description:
          //     "Looking to start your own business? Discover hundreds of proven franchise opportunities from top local and international brands. Find your future venture!",
          //   accentColor: {
          //     light: "#0891b2",
          //     dark: "#06b6d4",
          //   },
          //   cta: {
          //     label: "Explore FLEI",
          //     link: "https://franchise-expo.co.id",
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
        title: "Tenant Registration",
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
            url: "https://drive.google.com/file/d/1qBzj3Ib02DrgXKGXp-XvVFzClhIfFOHJ/view?usp=sharing",
            iconName: "hugeicons:download-04",
          },
        ],
      },

      eventGuidelines: {
        title: "Event Guidelines",
        list: [
          {
            img: "no-indecent-costumes.svg",
            title: "No indecent costumes",
            description:
              "Please dress appropriately. Please do not wear offensive outfits.",
          },
          {
            img: "no-harassment.svg",
            title: "No harassment",
            description:
              "Please be respectful of other attendees, be civilised and mind your manners. Ask for consent. Any contact or taking pictures with your subject must be with their approval. We will not tolerate harassment, discrimination, violence, or offensive and unacceptable behaviours towards individuals on any grounds.",
          },
          {
            img: "no-dangerous-props.svg",
            title: "No dangerous props",
            description:
              "Please do not use dangerous items, sharp objects, projectile weapon, weapon more than 2m. Realistic weapon has to be disabled.",
          },
          {
            img: "no-traffic-obstruction.svg",
            title: "No traffic obstruction",
            description: "Please don't block entrance & walkways.",
          },
          {
            img: "no-littering.svg",
            title: "No littering",
            description: "Please dispose rubbish in provided facilities.",
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
