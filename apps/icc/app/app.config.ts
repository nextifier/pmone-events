const isProduction = process.env.NODE_ENV === "production";

const app = {
  name: "Indonesia Comic Con (ICC)",
  shortName: "ICC",
  projectUsername: "icc",
  url: isProduction ? "https://indonesiacomiccon.com" : "http://localhost:3000",
  company: {
    name: "PT Ekspresi Generasi Kreatif",
    address:
      "Panorama Media Building, Jl. Tanjung Selor No.17A, RT.11/RW.6, Cideng, Kecamatan Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10150",
  },
};

const event = {
  title: "Indonesia Comic Con 2026",
  edition: {
    value: 10,
    ordinal: "th",
  },
  poster: "/img/tickets/icc-2026-poster.jpg",
  status: "", // Available values: "upcoming", "live", "completed"
  startTime: "Oct 3, 2026 10:00:00",
  endTime: "Oct 4, 2026 20:00:00",
  date: "Oct 3-4, 2026",
  dateOnly: "3-4",
  month: "Oct",
  year: "2026",
  time: "10 AM - 9 PM",
  location: "Nusantara International Convention Exhibition (NICE), PIK 2",
  locationShort: "NICE, PIK 2",
  locationLink: "https://maps.app.goo.gl/V6N3r7vxD1BMn9pi8",
  // hall: "",
  teaserVideoId: "",
  profileImage: "/img/avatar/icc.svg",
  description:
    "Ajang pop culture terbesar di Indonesia. Nikmati pengalaman seru bertemu artis internasional, cosplay, komik, merchandise eksklusif, dan banyak lagi.",
  offersName: "Tiket Masuk ICC",
  offersDescription:
    "Harga tiket Indonesia Comic Con berbeda-beda tergantung jenis tiket dan waktu pembeliannya. Tersedia promo early bird dan pre-sale.",
};

const settings = {
  header: {
    logoClass: "h-8",
  },
  footer: {
    logoClass: "h-12",
  },
  ticket: {
    tabs: {
      showTickets: true,
      showGuests: true,
      showBrands: true,
      showRundown: true,
      showAbout: true,
      showPhotos: true,
    },
  },
  blog: {
    showPostCardAuthor: false,
    showPostCardExcerpt: false,
  },
  ogImage: {
    isDarkMode: true,
  },
  bookSpaceForm: {
    showJobTitle: false,
    showBrandName: true,
    showProducts: true,
  },
  terms: {
    lastUpdate: "August 21, 2025",
  },
};

const contact = {
  email: "icc@panoramamedia.co.id",
  whatsapp: "6281119220005",
  whatsappMarketing: "6281119220018",
};

const social = {
  instagram: "indocomiccon",
  x: "indocomicconx",
  // facebook: "",
  // linkedin: "",
  // youtube: "",
  // tiktok: "",
};

const contactLinks = {
  email: {
    label: "Email",
    path: `mailto:${contact.email}`,
  },
  whatsapp: {
    label: "WhatsApp",
    path: `https://api.whatsapp.com/send?phone=${contact.whatsapp}&text=Halo, ${app.shortName}!`,
  },
};

const socialLinks = {
  instagram: {
    label: "Instagram",
    path: `https://www.instagram.com/${social.instagram}`,
    iconName: "hugeicons:instagram",
  },
  x: {
    label: "X",
    path: `https://x.com/${social.x}`,
    iconName: "hugeicons:new-twitter",
  },
  // facebook: {
  //   label: "Facebook",
  //   path: `https://www.facebook.com/${social.facebook}`,
  //   iconName: "hugeicons:facebook-01",
  // },
  // tiktok: {
  //   label: 'TikTok',
  //   path: `https://tiktok.com/@${social.tiktok}`,
  //   iconName: 'hugeicons:tiktok',
  // },
  // linkedin: {
  //   label: "LinkedIn",
  //   path: `https://www.linkedin.com/company/${social.linkedin}`,
  //   iconName: "hugeicons:linkedin-01",
  // },
  // youtube: {
  //   label: "YouTube",
  //   path: `https://www.youtube.com/@${social.youtube}`,
  //   iconName: "hugeicons:youtube",
  // },
};

const routes = {
  home: {
    label: "Home",
    path: "/",
  },
  guests: {
    label: "Guests",
    path: "/guests",
  },
  brands: {
    label: "Brands",
    path: "/brands",
  },
  rundown: {
    label: "Rundown",
    path: "/rundown",
  },
  programs: {
    label: "Programs",
    path: "/programs",
  },
  ticket: {
    label: "Ticket",
    path: "/ticket",
  },
  bookSpace: {
    label: "Tenant Registration",
    path: "/book-space",
  },
  contact: {
    label: "Contact",
    path: "/contact",
  },
  news: {
    label: "News",
    path: "/news",
  },
  partners: {
    label: "Partners",
    path: "/partners",
  },
  gallery: {
    label: "Gallery",
    path: "/gallery",
  },
  faq: {
    label: "FAQ",
    path: "/faq",
  },
  ticketTerms: {
    label: "Ticket Terms and Conditions",
    path: "/ticket-terms-and-conditions",
  },
  ticketRefundPolicy: {
    label: "Ticket Refund and Return Policy",
    path: "/ticket-refund-and-return-policy",
  },
  terms: {
    label: "Terms of Service",
    path: "/terms",
  },
  privacy: {
    label: "Privacy Policy",
    path: "/privacy",
  },
  helpCenter: {
    label: "Help Center",
    path: "/help-center",
  },
  eventPolicy: {
    label: "Event Policy",
    path: "/event-policy",
  },
  links: {
    label: "Links",
    path: "/links",
  },
  sponsorship: {
    label: "Sponsorship Registration",
    path: "/sponsorship-registration",
  },
  mediaPartner: {
    label: "Media Partner Registration",
    path: "/media-partner-registration",
  },
  specialShow: {
    label: "Special Show",
    path: "/special-show",
  },
  meetAndGreet: {
    label: "Meet & Greet",
    path: "/meet-and-greet",
  },
  workshop: {
    label: "Workshop",
    path: "/workshop",
  },
  raya: {
    label: "Raya Championship of Cosplay",
    path: "/raya-championship-of-cosplay",
  },
  portfolioReview: {
    label: "Portfolio Review",
    path: "/portfolio-review",
  },
  eventGuidelines: {
    label: "Event Guidelines",
    path: "/event-guidelines",
  },
  safetyAndWeaponPolicy: {
    label: "Safety and Weapon Policy",
    path: "/safety-and-weapon-policy",
  },
  antiHarassmentPolicy: {
    label: "Anti-Harassment Policy",
    path: "/anti-harassment-policy",
  },
};

export default defineAppConfig({
  app: app,
  event: event,
  settings: settings,
  contact: contact,
  social: social,
  contactLinks: contactLinks,
  socialLinks: socialLinks,

  routes: {
    header: [
      routes.home,
      routes.guests,
      routes.brands,
      routes.rundown,
      routes.programs,
      {
        label: "Resources",
        links: [
          routes.gallery,
          routes.faq,
          routes.eventGuidelines,
          routes.safetyAndWeaponPolicy,
          routes.antiHarassmentPolicy,
          routes.links,
        ],
      },
      // routes.partners,
      routes.contact,
      routes.news,
    ],

    dialog: [
      {
        label: "Menu",
        links: [
          routes.home,
          routes.guests,
          routes.brands,
          routes.rundown,
          routes.programs,
          routes.ticket,
          routes.bookSpace,
          routes.contact,
          routes.news,
          // routes.partners,
        ],
      },
      {
        label: "Get in touch",
        links: Object.values(contactLinks),
      },
      {
        label: "Social",
        links: Object.values(socialLinks),
      },
      {
        label: "Resources",
        links: [
          routes.gallery,
          routes.faq,
          routes.eventGuidelines,
          routes.safetyAndWeaponPolicy,
          routes.antiHarassmentPolicy,
          routes.links,
        ],
      },
    ],

    footer: [
      {
        label: "Discover",
        links: [
          routes.brands,
          routes.rundown,
          routes.programs,
          routes.ticket,
          routes.partners,
        ],
      },
      {
        label: "For Businesses",
        links: [
          routes.bookSpace,
          routes.sponsorship,
          routes.mediaPartner,
          routes.contact,
        ],
      },
      {
        label: "Resources",
        links: [routes.gallery, routes.faq, routes.links, routes.news],
      },
      {
        label: "Terms and policies",
        links: [
          routes.ticketTerms,
          routes.ticketRefundPolicy,
          routes.eventPolicy,
          routes.terms,
          routes.privacy,
          routes.helpCenter,
        ],
      },
    ],
  },

  theme: {
    accentColorOptions: [
      {
        name: "purple",
        hue: "306",
        background: "oklch(54.1% 0.281 293.009)",
        foreground: "oklch(100% 0 0)",
      },
      {
        name: "pink",
        hue: "350",
        background: "oklch(59.2% 0.249 0.584)",
        foreground: "oklch(100% 0 0)",
      },
      {
        name: "cyan",
        hue: "200",
        background: "oklch(60.9% 0.126 221.723)",
        foreground: "oklch(100% 0 0)",
      },
      {
        name: "yellow",
        hue: "106",
        background: "oklch(85.2% 0.199 91.936)",
        foreground: "oklch(0% 0 0)",
      },
    ],
  },
});
