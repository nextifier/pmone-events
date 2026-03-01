import { defineStore } from 'pinia'

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
        countdownLabel: "Doors to the future of your home open in:",
        title: `The Blueprint for Your Dream Renovation.`,
        description: `Take control of your renovation. Touch and feel the latest materials, get direct advice from designers, and build your project with total confidence.`,
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
            subHeadline: "Exhibit at Megabuild Indonesia!",
            content: `
              <p>Position your brand in front of thousands of homeowners, architects, and designers. Let's build success together.</p>
            `,
            cta: {
              label: "Book Your Space Now",
              link: "/book-space",
            },
          },
          {
            subHeadline: "Stay Inspired, Stay Updated!",
            content: `
            <p>Follow our Instagram for daily building-related inspiration, exhibitor spotlights, and special giveaways leading up to the event. Don't miss a single update!</p>
          `,
            cta: {
              label: "Follow @megabuildindo",
              link: "https://www.instagram.com/megabuildindo",
            },
          },
        ],
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
        list: [
          {
            title: "Exhibition",
            description:
              "Discover the latest innovations in building materials, architecture, construction, and interior design from Indonesia's leading manufacturers and international brands.",
          },
          {
            title: "Opening Ceremony",
            description:
              "Join the grand opening of Megabuild Indonesia, inaugurated by government officials and attended by distinguished guests from institutions, associations, communities, and media.",
          },
          {
            title: "Megabuild Conference",
            description:
              "Dive into relevant building and construction industry topics. Featuring expert speakers and industry leaders, this conference runs on the first and second days of the exhibition.",
          },
          {
            title: "Seminars, Forum, Talkshows",
            description:
              "Featuring media partners and industry experts, these sessions attract architects, designers, contractors, and developers with valuable insights and industry discussions.",
          },
          {
            title: "1O1 - Business Matching",
            description:
              "Connecting building material manufacturers with importers, distributors, and project owners. We link suppliers of materials, technology, and equipment with buyers across the region.",
          },
          {
            title: "Power Networking Night",
            description:
              "An evening dinner and networking session for company owners, top management, association leaders, and all industry stakeholders. Build connections that lead to meaningful collaborations for the future.",
          },
          {
            title: "Hosted Buyer Program",
            description:
              "We're bringing in targeted buyers and partners from across the ASEAN region to connect with exhibitors. Accommodation fully covered by the organizer for qualified industry players.",
          },
          {
            title: "Building Contractors & Property Developers Members Gathering",
            description:
              "A collaborative event with the Indonesian Real Estate Association and Indonesian Contractors Association, bringing members together for networking and knowledge-sharing during the exhibition.",
          },
          {
            title: "The Beauty of Indonesia Ceramics Installation",
            description:
              "A curated showcase highlighting the finest designs from Indonesian ceramics, from floor tiles and sanitaryware to roofing products and tableware. See the best of local craftsmanship in one place.",
          },
          {
            title: "Professional & Student Visit",
            description:
              "Inviting architects, interior designers, consultants, contractors, design students, and lecturers to explore the exhibition and discover the latest in building materials and design innovation.",
          },
          {
            title: "Brand Talks",
            description:
              "Podcast-style sessions discussing the latest products, designs, technologies, and innovations from participating brands. Each brand gets a dedicated spotlight to share their story.",
          },
          {
            title: "Designer Workshops",
            description:
              "Partnering with Ikatan Arsitek Indonesia and Himpunan Interior Desainer Indonesia to deliver workshops, training, and educational programs that add real value for their members attending the exhibition.",
          },
          {
            title: "Jakarta Design Week 2026",
            description:
              "In collaboration with Ikatan Arsitek Indonesia and DKI Jakarta Provincial Government, this event brings forums and conferences tackling architectural challenges and innovations shaping the city's future.",
          },
          {
            title: "Floor & Wall Tile Installation Competition",
            description:
              "Tile installers compete using products from exhibitors. Showcase your skills and craftsmanship for a chance to win cash prizes and recognition in the industry.",
          },
          {
            title: "Megabuild Awards 2026",
            description:
              "Recognizing excellence in Indonesia's building materials and design industry. In partnership with HDII, IAI, and GBCI, we honor outstanding achievements in categories like Best Design, Innovation, Sustainability, and more.",
          },
          {
            title: "Megabuild Best Booth",
            description:
              "Celebrating booth creativity across four categories: large booths (>108 sqm), medium booths (50-108 sqm), small booths (<50 sqm), and the Favorite Booth chosen by popular vote.",
          },
        ],
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
            url: "https://drive.google.com/file/d/1_DWoC8vfqPgF5eryMDoEMxKTu3kOs8dH/view?usp=sharing",
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
