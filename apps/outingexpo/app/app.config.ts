const isProduction = process.env.NODE_ENV === "production";

const app = {
  name: "Indonesia Outing & Incentive Travel Expo (IOITE)",
  shortName: "IOITE",
  projectUsername: "ioe",
  url: isProduction ? "https://indooutingexpo.co.id" : "http://localhost:3000",
  company: {
    name: "PT Panorama Media",
    address:
      "Panorama Media Building, Jl. Tanjung Selor No.17A, RT.11/RW.6, Cideng, Kecamatan Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10150",
  },
};

const event = {
  title: "Indonesia Outing & Incentive Travel Expo 2026",
  // edition: {
  //   value: 22,
  //   ordinal: "nd",
  // },
  poster: "/img/tickets/indooutingexpo-2026-poster.jpg",
  status: "", // Available values: "upcoming", "live", "completed"
  startTime: "Aug 27, 2026 10:00:00",
  endTime: "Aug 30, 2026 21:00:00",
  date: "Aug 27-30, 2026",
  dateOnly: "27-30",
  month: "Aug",
  year: "2026",
  time: "10 AM - 9 PM",
  location: "Nusantara International Convention Exhibition (NICE), PIK 2",
  locationShort: "NICE, PIK 2",
  locationLink: "https://maps.app.goo.gl/MYU5ZFfNoxUzZdjm8",
  hall: "Hall 10 & 11",
  teaserVideoId: "",
  profileImage: "/img/avatar/ioe.svg",
  description:
    "Platform bisnis untuk corporate engagement dan incentive travel. 100+ brand, konferensi HR, business matching. 27-30 Agustus 2026, NICE PIK 2.",
  offersName: "Tiket Masuk IOITE",
  offersDescription:
    "Harga tiket pameran corporate engagement dan incentive travel berbeda-beda tergantung jenis tiket dan waktu pembeliannya.",
  // inConjunction: {
  //   label: "In conjunction with",
  //   list: [
  //     {
  //       name: "Franchise & License Expo Indonesia",
  //       url: "https://franchise-expo.co.id",
  //       img: "/img/avatar/flei.svg",
  //     },
  //     {
  //       name: "Cafe & Brasserie Expo Indonesia",
  //       url: "https://cafebrasserieexpo.com",
  //       img: "/img/avatar/cbe.svg",
  //     },
  //   ],
  // },
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
    logoClass: "h-10 text-primary",
  },
  footer: {
    logoClass: "h-14 text-primary",
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
  email: "ioe@panoramamedia.co.id",
  whatsapp: "6281293235557",
  whatsappMarketing: "6281119220015",
};

const social = {
  instagram: "indooutingexpo",
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
