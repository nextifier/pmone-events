import { defineStore } from "pinia";

export const useBrandsStore = defineStore("brands", {
  state: () => ({
    brands: [
      {
        slug: "panorama-events",
        name: "Panorama Events",
        shortName: "Panorama Events",
        category: "Corporate Events",
        tagline: "Your team deserves more than another meeting room.",
        shortDescription:
          "Corporate outings, team building, conferences, gala dinners. We design experiences around your HR goals. Not the other way around.",
        companyName: "PT Panorama Evenindo",
        website: "https://panoramaevents.id",
        email: "events@panoramamedia.co.id",
        whatsapp: "6281110529527",
        socials: {
          instagram: "panoramaevents.id",
          facebook: "https://www.facebook.com/hellopanoramaevents",
        },
        hero: {
          headline: "Corporate events that don't feel corporate.",
          subheadline:
            "Team building that doesn't make people groan. Conferences where people actually network. Gala dinners that end with real conversations.",
          description:
            "We've been doing this since 2007. Over 450 events. 280+ clients. 50,000+ participants. But here's what matters: we design around your HR goals, not around templates.\n\nYou tell us what you want your team to feel when they leave. We figure out how to get there.",
        },
        services: [
          {
            title: "Team Building & Retreats",
            description:
              "Activities designed to strengthen bonds. Not check boxes.",
          },
          {
            title: "Corporate Gatherings & Kickoffs",
            description:
              "Annual meetings, quarterly kickoffs, company-wide events that actually energize.",
          },
          {
            title: "Conferences & Seminars",
            description:
              "From intimate VIP sessions to large-scale industry conferences.",
          },
          {
            title: "Gala Dinners & Award Ceremonies",
            description:
              "Celebrations that feel celebratory. Not another rubber chicken night.",
          },
          {
            title: "Company Outings & Retreats",
            description:
              "Multi-day experiences across Indonesia. We handle logistics. You take credit.",
          },
          {
            title: "Family Days",
            description: "Inclusive events for employees and their families.",
          },
          {
            title: "CSR & Social Impact Programs",
            description:
              "Community activities that build internal connections while giving back.",
          },
        ],
        approach: {
          title: "Our Approach",
          description:
            "We don't do one-size-fits-all.\n\nEvery company has its own culture. Every team has its own dynamics. We start by listening. Understanding what you're trying to achieve, not just what date you need.\n\nThen we design backward from the outcome you want.",
        },
        included: [
          "Venue & hotel sourcing nationwide",
          "Full creative design and branding",
          "Professional photography and videography",
          "Talent and speaker coordination",
          "Ground handling and transportation",
          "On-site management team",
          "Budget oversight with no surprises",
        ],
        clients: [
          "PwC",
          "JP Morgan",
          "KSEI",
          "IDX",
          "Bank BTN",
          "Ministry of Trade",
          "Ministry of Tourism",
          "Telkomsel",
          "Smartfren",
          "Philip Morris International",
          "Calvin Klein",
        ],
        values: [
          "Synergy",
          "Pursuit of Excellence",
          "Integrity",
          "Reliability",
          "Innovative",
          "Truly Care",
        ],
      },
      {
        slug: "panorama-live",
        name: "Panorama Live",
        shortName: "Panorama Live",
        category: "Concerts & Festivals",
        tagline: "Shows people actually talk about.",
        shortDescription:
          "Concerts and festivals built around emotional moments. Reunion tours. Nostalgia acts. The kind of night where 10,000 people hold their breath at the same time.",
        companyName: "PT Panorama Evenindo",
        website: "https://panoramalive.id",
        email: "live@panoramamedia.co.id",
        whatsapp: "6281110529527",
        socials: {
          instagram: "panoramalive.id",
        },
        hero: {
          headline: "The show people remember.",
          subheadline:
            "Some concerts are just loud. Some festivals are just crowded. We're after something else.",
          description:
            "The moment when thousands hold their breath at the same time. When strangers become friends for a night. When the artist and audience forget who's performing for whom.\n\nWe create shows built around emotional moments. Not just ticket sales.",
        },
        services: [
          {
            title: "Music Festivals",
            description:
              "Large-scale multi-artist events featuring Indonesia's best musicians.",
          },
          {
            title: "Concerts",
            description:
              "Intimate to arena-scale. Reunion tours. Nostalgia acts. New discoveries.",
          },
          {
            title: "Experience Shows",
            description:
              "Events that go beyond music. Interactive, immersive, emotional.",
          },
        ],
        approach: {
          title: "Our Approach",
          description:
            '"Event Seru, Galau, dan Penuh Cinta."\n(Exciting, Melancholic, and Full of Love.)\n\nWe embrace the full spectrum. Joy, nostalgia, catharsis. The best shows make people feel something real.',
        },
        notableEvents: [
          {
            title: "Lovefest",
            description:
              "Legendary Indonesian bands, all formations, one unforgettable night. Featuring: Padi Reborn, GIGI, Nidji, Maliq & D'Essentials, and more.",
          },
          {
            title: "Haru Biru Experience Show",
            description:
              'A heartbreak-themed experience. Comedians, melancholic musicians, "memory trash cans" for symbolic letting go, and workshops for fellow heartbreak survivors.',
          },
        ],
      },
      {
        slug: "megabuild-indonesia",
        name: "Megabuild Indonesia",
        shortName: "Megabuild",
        category: "Exhibition",
        tagline: "Where Indonesia's built environment takes shape.",
        shortDescription:
          "The country's largest building materials, architecture, and construction expo. Architects meet manufacturers. Contractors find suppliers. Deals get done months before ground breaks.",
        companyName: "PT Pameran Masa Kini",
        website: "https://megabuild.co.id",
        email: "megabuild@panoramamedia.co.id",
        whatsapp: "628118805638",
        socials: {
          instagram: "megabuildindo",
          facebook: "https://www.facebook.com/megabuildindo",
          linkedin: "https://www.linkedin.com/company/megabuildid",
          youtube: "https://www.youtube.com/@megabuildindo",
        },
        hero: {
          headline: "Indonesia's construction industry. One address. Four days.",
          subheadline:
            "Where architects meet manufacturers. Contractors find suppliers. And deals get done months before ground breaks.",
          description:
            "The largest building materials, architecture, and construction expo in Indonesia. Over 500 exhibitors, 40,000+ professional visitors, exhibitors from 25 countries, visitors from 45.\n\nThis is where Indonesia's built environment takes shape.",
        },
        categories: [
          {
            title: "Building Materials & Construction",
            items: [
              "Building & construction materials",
              "Construction equipment & technology",
              "Construction chemicals",
              "Flooring & roofing",
              "Ceiling & cladding solutions",
            ],
          },
          {
            title: "Architecture & Design",
            items: [
              "Architectural solutions",
              "Interior design products",
              "Fenestration (windows & doors)",
              "Furniture & hardware",
            ],
          },
          {
            title: "Home & Living",
            items: [
              "Bathroom & kitchen",
              "Furnishings & décor",
              "Home automation & smart tech",
              "Safety & security systems",
            ],
          },
          {
            title: "Specialty Sectors",
            items: [
              "Marble & stone",
              "Green building innovations",
              "Energy-efficient solutions",
            ],
          },
        ],
        exhibitors: [
          "Indonesian leading manufacturers",
          "International brands from 25+ countries",
          "Raw material and technology suppliers",
          "Construction technology companies",
          "Smart home and automation providers",
        ],
        visitors: [
          "Architects and interior designers",
          "Construction contractors",
          "Property developers and project owners",
          "Building contractors",
          "Industry consultants",
          "Importers and distributors",
          "Engineers",
          "Facility managers",
          "Design students and lecturers",
          "ASEAN buyers and distributors",
        ],
        programs: [
          "Megabuild Conference",
          "Designer Workshops",
          "Brand Talks",
          "1O1 Business Matching",
          "Power Networking Night",
          "Hosted Buyer Program",
          "Megabuild Awards",
          "Floor & Wall Tile Installation Competition",
          "The Beauty of Indonesia Ceramics Installation",
          "Jakarta Design Week collaboration",
        ],
        partners: [
          "Asosiasi Aneka Industri Keramik Indonesia (ASAKI)",
          "Ikatan Arsitek Indonesia (IAI)",
          "Indonesian Real Estate Association",
          "Indonesian Contractors Association",
        ],
      },
      {
        slug: "keramika-indonesia",
        name: "Keramika Indonesia",
        shortName: "Keramika",
        category: "Exhibition",
        tagline: "ASEAN's only ceramics-dedicated expo.",
        shortDescription:
          "Co-located with Megabuild. Manufacturers, technology providers, and buyers. All focused on what's next in ceramics. Tiles to tableware, machinery to materials.",
        companyName: "PT Pameran Masa Kini",
        website: "https://keramika.co.id",
        email: "keramika@panoramamedia.co.id",
        whatsapp: "628118805638",
        socials: {
          instagram: "keramikaid",
          facebook: "https://www.facebook.com/keramikaid",
          linkedin: "https://www.linkedin.com/company/keramikaindonesia",
        },
        hero: {
          headline: "The ceramics trade, concentrated.",
          subheadline: "ASEAN's only dedicated ceramics industry exhibition.",
          description:
            "Indonesia is ASEAN's largest ceramic producer. Keramika brings together manufacturers, technology providers, and buyers. All looking for what's next in an industry that's too often fragmented.\n\nCo-located with Megabuild Indonesia. Same venue. Same dates. Combined reach.",
        },
        categories: [
          {
            title: "Products",
            items: [
              "Ceramic tiles (floor, wall, roof)",
              "Sanitaryware and bathroom fixtures",
              "Tableware and food industry ceramics",
              "Furnishing pottery and porcelain",
            ],
          },
          {
            title: "Manufacturing & Technology",
            items: [
              "Chemicals and refractory materials",
              "Raw materials and additives",
              "Glazing materials and technology",
              "Digital printing and decoration machines",
              "Machinery and equipment",
            ],
          },
        ],
        exhibitors: [
          "Indonesia's leading ceramic manufacturers (ASAKI members)",
          "ASEAN-based ceramic suppliers",
          "International manufacturers from 12+ countries",
          "Raw material suppliers",
          "Equipment and machinery manufacturers",
          "Technology solution providers",
        ],
        visitors: [
          "Ceramic industry professionals and decision-makers",
          "Architects and interior designers",
          "Project owners and operators",
          "Property developers",
          "ASEAN importers and distributors",
          "Engineering professionals",
          "Design consultants and students",
        ],
        programs: [
          "Keramika Conference",
          "1O1 Business Matching",
          "Power Networking Night",
          "Hosted Buyer Program",
          "Brand Talks",
          "Designer Workshops",
          "Floor & Wall Tile Installation Competition",
          "Keramika Awards",
          "Ceramics Artistic Showcase",
          "The Beauty of Indonesia Ceramics Installation",
        ],
      },
      {
        slug: "franchise-license-expo-indonesia",
        name: "Franchise & License Expo Indonesia",
        shortName: "FLEI",
        category: "Exhibition",
        tagline: "Your next business starts here.",
        shortDescription:
          "Indonesia's longest-running franchise expo. F&B concepts, retail brands, licensing deals, business opportunities. Thousands of entrepreneurs find their first business here every year.",
        companyName: "PT Pameran Peluang Bisnis",
        website: "https://franchise-expo.co.id",
        email: "fleiexpo@panoramamedia.co.id",
        whatsapp: "6288977742709",
        socials: {
          instagram: "fleiexpoid",
          facebook: "https://www.facebook.com/fleiexpoid",
          tiktok: "https://tiktok.com/@fleiexpoid",
          linkedin:
            "https://www.linkedin.com/company/flei-franchise-and-license-expo-indonesia",
          youtube: "https://www.youtube.com/@fleiexpoid",
        },
        hero: {
          headline: "Your next business starts here.",
          subheadline:
            "Indonesia's longest-running franchise and business opportunity expo.",
          description:
            'Started before "franchise" was a common word in Indonesia. Now it\'s where thousands of aspiring entrepreneurs find their first business every year.\n\nNot just fast food. Not just retail. If there\'s a proven business model, it\'s probably here.',
        },
        categories: [
          {
            title: "What You'll Find",
            items: [
              "Franchise opportunities (F&B, retail, education, services)",
              "Business opportunities (emerging concepts with growth potential)",
              "Licensing & co-branding deals",
              "Retail tech solutions",
              "Distributor partnerships",
            ],
          },
        ],
        exhibitors: [
          "Food & Beverage brands",
          "Retail businesses",
          "Education franchises",
          "Cafe and Brasserie concepts",
          "Service businesses",
        ],
        visitors: [
          "Aspiring entrepreneurs seeking their first business",
          "Young professionals looking for alternative income",
          "Potential franchisees ready to invest",
          "Investors seeking proven concepts",
          "Industry decision-makers",
        ],
        programs: [
          "Business Conference (CEO and founder sessions)",
          "Business Coaching (free one-on-one consultations)",
          "Business Matching (pre-scheduled meetings)",
          "Masterclasses (digital marketing, operations, brand management)",
          "Ecopreneur Challenge (sustainable business competition)",
          "Inspiration Stage (founder stories)",
        ],
        partners: [
          "KADIN (Indonesian Chamber of Commerce)",
          "FAI (Franchise Association Indonesia)",
        ],
        bundledAccess: ["Cafe & Brasserie Expo", "More Food Expo"],
      },
      {
        slug: "cafe-brasserie-expo",
        name: "Cafe & Brasserie Expo",
        shortName: "CBE",
        category: "Exhibition",
        tagline: "For people building cafe businesses. Not just dreaming.",
        shortDescription:
          "Equipment, beans, concepts, tech. Everything a cafe needs to stand out and stay open. Plus four festivals in one: coffee, tea, wine, chocolate.",
        companyName: "PT Pameran Kreasi Rasa",
        website: "https://cafebrasserieexpo.com",
        email: "cafe@panoramamedia.co.id",
        whatsapp: "6285180646401",
        socials: {
          instagram: "cafebrasserieexpo",
          facebook: "https://www.facebook.com/cafebrasserieexpo",
          tiktok: "https://tiktok.com/@cafebrasserieexpo",
        },
        hero: {
          headline:
            "For people building cafe businesses. Not just dreaming about them.",
          subheadline: "Equipment, beans, concepts, tech. Plus four festivals in one.",
          description:
            "Where serious cafe owners find their next espresso machine, discover new suppliers, and learn what's actually working in the market.\n\nNo fluff. Just the equipment, ingredients, and knowledge to run a cafe that lasts.",
        },
        festivals: [
          {
            name: "Indonesia Coffee Festival (ICF)",
            description: "Specialty coffee, barista competitions",
          },
          {
            name: "Indonesia Tea Festival (ITF)",
            description: "Tea varieties, rare leaves, brewing education",
          },
          {
            name: "Indonesia Wine Festival (IWF)",
            description: "Wine tasting, local and international selections",
          },
          {
            name: "Cokelat Expo Indonesia (CEI)",
            description: "Artisan chocolate, bean-to-bar makers",
          },
        ],
        categories: [
          {
            title: "Equipment & Technology",
            items: [
              "Espresso machines",
              "Roasting machines",
              "Grinders and brewing equipment",
              "POS systems",
              "Packaging solutions",
            ],
          },
          {
            title: "Products & Ingredients",
            items: [
              "Coffee beans (green and roasted)",
              "Tea varieties",
              "Chocolate products",
              "Wine and beverages",
            ],
          },
          {
            title: "Business Solutions",
            items: [
              "Cafe furniture and design",
              "Retail solutions",
              "Franchise opportunities",
              "Training programs",
            ],
          },
        ],
        visitors: [
          "Cafe and restaurant owners",
          "Baristas and coffee professionals",
          "Hoteliers",
          "F&B entrepreneurs",
          "Coffee, tea, wine, chocolate enthusiasts",
          "Franchise seekers",
          "Food producers and distributors",
        ],
        competitions: [
          "Indonesia Coffee in Good Spirits Championship",
          "Indonesian Drinking Chocolate Competition",
          "Indonesia Barista Championship",
          "Indonesia Brewers Cup",
          "Indonesia Cup Tasters Championship",
          "National Cafe Latte Art Championship",
        ],
        partners: [
          "SCAI (Specialty Coffee Association of Indonesia)",
          "ACBI (Indonesian Bean-to-Bar Chocolate Association)",
          "AISTEA (Indonesian Specialty Tea Association)",
          "HCI (HIMPI Culinary Indonesia)",
          "TSWS (The Sommelier Wine Society)",
          "GAPMMI (Indonesian Food and Beverage Producers Association)",
        ],
      },
      {
        slug: "indonesia-coffee-festival",
        name: "Indonesia Coffee Festival",
        shortName: "ICF",
        category: "Festival",
        tagline: "Beyond the cup.",
        shortDescription:
          "The heart of Cafe & Brasserie Expo. Barista championships, cupping sessions, brewing workshops. Where Indonesia's coffee community gathers to compete, learn, and geek out.",
        companyName: "PT Pameran Kreasi Rasa",
        website: "https://indocoffeefestival.com",
        email: "cafe@panoramamedia.co.id",
        whatsapp: "6285180646401",
        socials: {
          instagram: "indocoffeefest",
          facebook: "https://www.facebook.com/cafebrasserieexpo",
          tiktok: "https://tiktok.com/@cafebrasserieexpo",
        },
        hero: {
          headline: "The people behind Indonesian coffee.",
          subheadline: "Beyond the cup. Into the community.",
          description:
            "ICF is the coffee-dedicated heart of Cafe & Brasserie Expo. Barista championships, cupping sessions, roaster showcases. The whole supply chain, from Aceh to Jakarta, in one place.\n\nFor people who think about coffee way too much. In the best way.",
        },
        programs: [
          "National barista championships",
          "Brewing competitions",
          "Cupping sessions",
          "Farm-to-cup exhibitions",
          "Roaster showcases",
          "Workshops and masterclasses",
        ],
        competitions: [
          "Indonesia Coffee in Good Spirits Championship",
          "Indonesia Barista Championship (IBC)",
          "Indonesia Brewers Cup (IBrC)",
          "Indonesia Cup Tasters Championship (ICTC)",
          "National Cafe Latte Art Championship",
        ],
        achievements: [
          "Mikael Jasin: 2024 World Barista Champion (first Indonesian winner)",
          "Ryan Wibawa: 3rd place, 2024 World Brewers Cup",
          "Indonesia hosted 2025 World Brewers Cup at World of Coffee Jakarta",
        ],
        visitors: [
          "Cafe owners and roasters",
          "Equipment suppliers and distributors",
          "Coffee lovers and home brewers",
          "Specialty coffee fans",
        ],
      },
      {
        slug: "cokelat-expo-indonesia",
        name: "Cokelat Expo Indonesia",
        shortName: "Cokelat Expo",
        category: "Exhibition",
        tagline: "Indonesia's chocolate scene, finally spotlighted.",
        shortDescription:
          "Part of CBE. Bean-to-bar makers, industrial suppliers, artisan chocolatiers. Indonesia is the world's 3rd largest cacao producer. This expo shows why that matters.",
        companyName: "PT Pameran Kreasi Rasa",
        website: "https://cokelatexpo.com",
        email: "cafe@panoramamedia.co.id",
        whatsapp: "6285180646401",
        socials: {
          instagram: "cokelatexpo.id",
          facebook: "https://www.facebook.com/cafebrasserieexpo",
          tiktok: "https://tiktok.com/@cafebrasserieexpo",
        },
        hero: {
          headline:
            "Indonesia is a chocolate country. Time it had a chocolate expo.",
          subheadline:
            "Third-largest cocoa producer in the world. Hundreds of bean-to-bar makers emerging. A local chocolate scene finally getting interesting.",
          description:
            "Part of Cafe & Brasserie Expo. Cokelat Expo brings together farmers, makers, buyers, and enthusiasts. From single-origin artisans to industrial suppliers.",
        },
        categories: [
          {
            title: "What's On Show",
            items: [
              "Bean-to-bar chocolatiers",
              "Artisan and small-batch producers",
              "Industrial cocoa suppliers",
              "Chocolate production equipment",
              "Cacao farmers and cooperatives",
              "Packaging solutions",
            ],
          },
        ],
        visitors: [
          "F&B buyers",
          "Retail chains",
          "Hotel and restaurant pastry chefs",
          "Chocolate enthusiasts",
          "Export buyers",
        ],
        programs: [
          "Indonesian Drinking Chocolate Competition",
          "Bean-to-bar demonstrations",
          "Chocolate sculpture live shows",
          "Tasting sessions",
          "Industry talks on sustainability",
        ],
        industryContext:
          "Indonesia: 3rd largest cocoa producer globally. Growing reputation for sustainable, single-origin cacao. Becoming a major cocoa processing hub.",
      },
      {
        slug: "indonesia-comic-con",
        name: "Indonesia Comic Con",
        shortName: "ICC",
        category: "Pop Culture Event",
        tagline: "Where fandoms collide.",
        shortDescription:
          "Indonesia's biggest pop culture gathering. Cosplay, collectibles, gaming, celebrity guests. The annual pilgrimage for fans who don't need to explain their obsessions.",
        companyName: "PT Ekspresi Generasi Kreatif",
        website: "https://indonesiacomiccon.com",
        email: "icc@panoramamedia.co.id",
        whatsapp: "6281119220005",
        socials: {
          instagram: "indocomiccon",
          x: "https://x.com/indocomicconx",
        },
        hero: {
          headline: "Where fandoms collide.",
          subheadline: "Indonesia's biggest pop culture gathering. Period.",
          description:
            'Started when "comic con" was still an American thing. Now it\'s the annual pilgrimage for fans across Southeast Asia.\n\nCosplayers who spent months on their costumes. Collectors hunting rare figures. Fans meeting the artists who shaped their childhoods.',
        },
        pillars: [
          "Comics (Western comics, manga, graphic novels)",
          "Toys (action figures, collectibles, merchandise)",
          "Movies (film promotions, celebrity appearances)",
          "Video Games (tournaments, demos, esports)",
          "Lifestyles (fashion, fandom communities)",
        ],
        programs: [
          "Celebrity appearances & panels",
          "RAYA Championship of Cosplay",
          "Cosplay Parade",
          "Gaming/Esports Tournaments",
          "Live idol group performances",
          "VTuber shows and virtual concerts",
          "Main Guest Talkshows",
          "Artist Alley",
          "Portfolio Reviews",
          "Creator workshops",
          "Toy auctions",
        ],
        pastGuests: [
          "Brandon Routh (Superman)",
          "Ed Westwick (Gossip Girl)",
          "Cobie Smulders (HIMYM/Marvel)",
          "Jason David Frank (Power Rangers)",
          "Austin St. John (Power Rangers)",
        ],
        visitors: [
          "Pop culture fans and collectors",
          "Cosplayers (amateur to professional)",
          "Gamers (all platforms)",
          "Comic enthusiasts (Western and manga)",
          "Families",
        ],
        stats: {
          attendees: "30,000+ annually",
          exhibitors: "200+",
        },
      },
      {
        slug: "indonesia-anime-con",
        name: "Indonesia Anime Con",
        shortName: "INACON",
        category: "Pop Culture Event",
        tagline: "Your favorite universe. Real for a weekend.",
        shortDescription:
          "Anime, manga, J-pop idols, cosplay. Now merged with ICC for the ultimate crossover. East meets West under one roof.",
        companyName: "PT Ekspresi Generasi Kreatif",
        website: "https://indonesiaanimecon.com",
        email: "inacon@panoramamedia.co.id",
        whatsapp: "6281119220005",
        socials: {
          instagram: "indoanimecon",
        },
        hero: {
          headline: "Your favorite universe. Real for a weekend.",
          subheadline: "Anime, manga, cosplay, and the community that lives for it.",
          description:
            "Three days of Japanese pop culture. Anime screenings, manga artists, cosplay showcases, idol performances. 50,000 people who finally don't need to explain their interests.\n\nNow merged with Indonesia Comic Con. East meets West, one epic celebration.",
        },
        focus: [
          "Anime screenings",
          "Japanese guest appearances",
          "J-pop idol group performances",
          "Cosplay competitions",
          "Manga and merchandise market",
          "Wotagei performances",
          "VTuber content",
        ],
        programs: [
          "Exhibition (collectibles, merchandise, lifestyle products)",
          "Main Guest Talkshow",
          "Meet & Greet",
          "Cosplay Parade",
          "Cosplay Competition (RAYA Championship)",
          "Gaming Competition",
          "Movie Panel",
          "Portfolio Review",
          "Creator Workshop",
          "Toys Auction",
          "Stamp Rally",
          "Live Performance",
        ],
        visitors: [
          "Anime and manga enthusiasts",
          "Cosplay community",
          "Collectors (figures, merchandise)",
          "Gaming enthusiasts",
          "J-pop and idol fans",
          "Content creators",
        ],
      },
      {
        slug: "indonesia-outing-incentive-travel-expo",
        name: "Indonesia Outing & Incentive Travel Expo",
        shortName: "IOITE",
        category: "Exhibition",
        tagline: "Corporate outings, minus the headache.",
        shortDescription:
          "Venues, travel packages, team building providers, activity operators. All in one place. Compare options, negotiate on-site, skip weeks of vendor research.",
        companyName: "PT Panorama Media",
        website: "https://indooutingexpo.co.id",
        email: "ioe@panoramamedia.co.id",
        whatsapp: "6281293235557",
        socials: {
          instagram: "indooutingexpo",
        },
        hero: {
          headline: "Corporate outings. One stop.",
          subheadline: "Your one-stop hub for all things outing.",
          description:
            "Planning an outing for 200 people? Finding a venue for your team building program? IOITE puts every option in one room.\n\nCompare venues, negotiate packages, meet activity providers. Skip weeks of vendor research.",
        },
        categories: [
          {
            title: "Venues & Accommodations",
            items: [
              "Beach resorts",
              "Adventure lodges",
              "Urban hotels",
              "Garden venues",
            ],
          },
          {
            title: "Activity & Adventure Providers",
            items: [
              "Adventure companies",
              "Theme parks",
              "Cultural attractions",
              "Outdoor camps",
            ],
          },
          {
            title: "Travel & Logistics",
            items: [
              "Transportation providers",
              "Tour operators",
              "Event management companies",
            ],
          },
        ],
        visitors: [
          "HR Departments and Managers",
          "Corporate Event Planners",
          "Procurement Officers",
          "Business Decision-Makers",
          "Professional Event Organizers",
          "Travel Agents",
          "School Administrators",
        ],
        programs: [
          "Outing Inspiration Stage",
          "Live Activity Demonstrations",
          "Flash Deals",
          "Business Matching Sessions",
          "Community Meet-Ups",
        ],
        exhibitors: [
          "Tanjung Lesung Beach & Resort",
          "Royal Safari Garden",
          "Hotel Borobudur Jakarta",
          "Trans Studio",
          "Trans Snow World",
          "SuperPark Indonesia",
          "Caldera Adventure",
          "Sobek Bali",
          "Bluebird Group",
        ],
      },
      {
        slug: "renovation-expo",
        name: "Renovation Expo",
        shortName: "RENEX",
        category: "Exhibition",
        tagline: "Home upgrades. Honest advice.",
        shortDescription:
          "Part of the Megabuild family, but built for homeowners. Touch materials, meet designers, get free Feng Shui consultations. Renovate with confidence, not confusion.",
        companyName: "PT Pameran Masa Kini",
        website: "https://renex.megabuild.co.id",
        email: "megabuild@panoramamedia.co.id",
        whatsapp: "628118805638",
        socials: {
          instagram: "megabuildindo",
          facebook: "https://www.facebook.com/megabuildindo",
          linkedin: "https://www.linkedin.com/company/megabuildid",
          youtube: "https://www.youtube.com/@megabuildindo",
        },
        hero: {
          headline: "Home upgrades. Honest advice.",
          subheadline: "Take control of your renovation.",
          description:
            "Part of the Megabuild family, but focused on homeowners. Not trade professionals.\n\nTouch and feel materials. Get direct advice from designers. Build your project with confidence, not confusion.\n\nBring your floor plans. Get free consultations.",
        },
        categories: [
          {
            title: "What's On Show",
            items: [
              "Building materials and supplies",
              "Interior design services",
              "Architecture services",
              "Kitchen and bathroom fixtures",
              "Windows, doors, hardware",
              "Paint and finishes",
              "Smart home technology",
              "Sustainable building solutions",
            ],
          },
        ],
        visitors: [
          "Homeowners planning renovations",
          "Apartment owners",
          "Architects and designers (secondary)",
          "Contractors (secondary)",
        ],
        programs: [
          "Exhibition (hundreds of brands)",
          "Design & Feng Shui Consultation (FREE)",
          "Inspiration & Experience Zone",
          "Brand Talks & Workshops",
          "Product Launches",
          "Business Matching",
          "Year-end Great Sale",
          "Lucky Draw & Door Prize",
        ],
        partners: [
          "IPBBI (Indonesian Building Materials Association)",
          "IAI (Indonesian Architects Association)",
          "HDII (Indonesian Interior Designers Association)",
        ],
        differentiator:
          "Megabuild: Industry-scale B2B event. Renex: Consumer-friendly, homeowner-focused with free Feng Shui consultations.",
      },
      {
        slug: "more-food-expo",
        name: "More Food Expo",
        shortName: "More Food Expo",
        category: "Exhibition",
        tagline: "Halal F&B. Global scale.",
        shortDescription:
          "International trade expo connecting global suppliers to Indonesia, the world's largest halal food market. Raw ingredients to finished products, machinery to distribution.",
        companyName: "Huamo Expo (Co-organized with Panorama Media)",
        website: "https://morefoodexpo.com",
        email: "morefood@panoramamedia.co.id",
        whatsapp: "6281190083305",
        socials: {
          instagram: "morefoodexpo.id",
          facebook: "https://www.facebook.com/morefoodexpo.id",
          tiktok: "https://tiktok.com/@morefoodexpo.id",
        },
        hero: {
          headline: "Halal F&B. Global scale.",
          subheadline: "Your gateway to Indonesia's halal market.",
          description:
            "Indonesia is the world's largest halal food consumption market. More Food Expo connects global suppliers to this opportunity.\n\nInternational trade expo. Raw ingredients to finished products. Machinery to distribution. B2B connections that matter.",
        },
        categories: [
          {
            title: "What's On Show",
            items: [
              "Raw ingredients and suppliers",
              "High-tech machinery and equipment",
              "Finished food products",
              "Brands and entrepreneurs",
              "Importers and distributors",
            ],
          },
        ],
        exhibitors: [
          "Food manufacturers (local and international)",
          "Raw material suppliers",
          "Processing equipment providers",
          "Packaging solution companies",
          "Certification services",
        ],
        visitors: [
          "Importers and distributors",
          "Hotel and restaurant chains",
          "F&B professionals",
          "Cafe owners",
          "Franchise seekers",
          "Key industry decision-makers",
        ],
        programs: [
          "The Global Marketplace (1,200+ exhibitors, 20,000 sqm)",
          "MoreFood Talks: Industry Summits",
          "Launch Pad: The Innovation Stage",
          "The Inspiration Zone",
          "Business Matching Service",
          "Chef's Table: Live Cooking Demos",
          "Creator's Hub: KOL Live Streams",
          "Halal Market Workshops",
        ],
        bundledAccess: [
          "Franchise & License Expo Indonesia (FLEI)",
          "Cafe & Brasserie Expo (CBE)",
        ],
        industryContext:
          "Indonesia halal market: IDR 1.01 Trillion projected. World's largest halal food consumption market. Strategic gateway for international companies entering Southeast Asia.",
      },
    ],
  }),

  getters: {
    getBrandBySlug: (state) => (slug) => {
      return state.brands.find((brand) => brand.slug === slug);
    },
    getBrandsByCategory: (state) => (category) => {
      return state.brands.filter((brand) => brand.category === category);
    },
    getAllCategories: (state) => {
      return [...new Set(state.brands.map((brand) => brand.category))];
    },
  },
});
