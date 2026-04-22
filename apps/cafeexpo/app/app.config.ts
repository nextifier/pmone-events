const isProduction = process.env.NODE_ENV === "production";

const app = {
  name: "Cafe n' Brasserie Expo Jakarta (CBE)",
  shortName: "CBE",
  projectUsername: "cbe",
  url: isProduction ? "https://cafebrasserieexpo.com" : "http://localhost:3000",
  company: {
    name: "PT Panorama Media",
    address:
      "Panorama Media Building, Jl. Tanjung Selor No.17A, RT.11/RW.6, Cideng, Kecamatan Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10150",
  },
};

const event = {
  title: "Cafe n' Brasserie Expo Jakarta",
  edition: {
    value: 8,
    ordinal: "th",
  },
  poster: "/img/tickets/cbe-8th-poster.jpg",
  status: "", // Available values: "upcoming", "live", "completed"
  startTime: "May 7, 2026 10:00:00",
  endTime: "May 10, 2026 21:00:00",
  date: "May 7-10, 2026",
  dateOnly: "7-10",
  month: "May",
  year: "2026",
  time: "10 AM - 9 PM",
  location: "JIExpo Kemayoran, Jakarta",
  locationShort: "JIExpo Kemayoran, Jakarta",
  locationLink: "https://maps.app.goo.gl/8GEz5sDjzW6apig97",
  // hall: "",
  // teaserVideoId: "",
  profileImage: "/img/avatar/cbe.svg",
  description:
    "Pameran industri kafe dan restoran terbesar di Indonesia. Temukan peralatan, bahan baku, dan peluang bisnis F&B dari brand-brand terkemuka.",
  offersName: "Tiket Masuk CBE",
  offersDescription:
    "Harga tiket pameran kafe dan restoran berbeda-beda tergantung jenis tiket dan waktu pembeliannya. Tersedia promo early bird dan pre-sale.",
  inConjunction: {
    label: "In conjunction with",
    list: [
      {
        name: "Franchise & License Expo Indonesia",
        url: "https://franchise-expo.co.id",
        img: "/img/avatar/flei.svg",
        projectUsername: "flei",
      },
      {
        name: "More Food Expo Indonesia",
        url: "https://morefoodexpo.com",
        img: "/img/avatar/more-food.svg",
        projectUsername: "morefood",
      },
    ],
  },
  // sponsoredBy: {
  //   label: "Presented by",
  //   list: [
  //     {
  //       name: "BCA",
  //       url: "https://www.bca.co.id/",
  //       img: "/img/credits/sponsor/BCA/BCA-1-1.svg",
  //     },
  //   ],
  // },
};

const settings = {
  header: {
    logoClass: "h-9",
  },
  footer: {
    logoClass: "h-12",
  },
  ticket: {
    tabs: {
      showTickets: true,
      showGuests: false,
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
    showProducts: false,
  },
  terms: {
    lastUpdate: "August 21, 2025",
  },
};

const contact = {
  email: "cafe@panoramamedia.co.id",
  whatsapp: "6285180646401",
  whatsappMarketing: "6289633446848",
};

const social = {
  instagram: "cafebrasserieexpo",
  facebook: "cafebrasserieexpo",
  linkedin: "",
  youtube: "",
  tiktok: "cafebrasserieexpo",
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
  facebook: {
    label: "Facebook",
    path: `https://www.facebook.com/${social.facebook}`,
    iconName: "hugeicons:facebook-01",
  },
  tiktok: {
    label: "TikTok",
    path: `https://tiktok.com/@${social.tiktok}`,
    iconName: "hugeicons:tiktok",
  },
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
    label: "Exhibitor Registration",
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
      routes.brands,
      routes.rundown,
      routes.programs,
      {
        label: "Resources",
        links: [routes.gallery, routes.faq, routes.links],
      },
      routes.partners,
      routes.contact,
      routes.news,
    ],

    dialog: [
      {
        label: "Menu",
        links: [
          routes.home,
          routes.brands,
          routes.rundown,
          routes.programs,
          routes.ticket,
          routes.bookSpace,
          routes.contact,
          routes.news,
          routes.partners,
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
        links: [routes.gallery, routes.faq, routes.links],
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
});
