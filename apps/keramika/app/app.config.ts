const isProduction = process.env.NODE_ENV === "production";

const app = {
  name: "Keramika Indonesia",
  shortName: "Keramika",
  projectUsername: "keramika",
  url: isProduction ? "https://keramika.co.id" : "http://localhost:3000",
  company: {
    name: "PT Pameran Masa Kini",
    address:
      "Panorama Media Building, Jl. Tanjung Selor No.17A, RT.11/RW.6, Cideng, Kecamatan Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10150",
  },
};

const event = {
  title: "Keramika Indonesia",
  edition: {
    value: 11,
    ordinal: "th",
  },
  poster: "/img/tickets/keramika-2026-poster.jpg",
  status: "", // Available values: "upcoming", "live", "completed"
  startTime: "Jun 4, 2026 10:00:00",
  endTime: "Jun 7, 2026 21:00:00",
  date: "June 4-7, 2026",
  dateOnly: "4-7",
  month: "June",
  year: "2026",
  time: "10 AM - 9 PM",
  location: "Nusantara International Convention Exhibition (NICE), PIK 2",
  locationShort: "NICE PiK 2",
  locationLink: "https://maps.app.goo.gl/V6N3r7vxD1BMn9pi8",
  // hall: "",
  teaserVideoId: "",
  profileImage: "/img/avatar/keramika.svg",
  description:
    "Pameran keramik dan produk finishing terlengkap di Indonesia. Jelajahi koleksi terbaik dari brand keramik, marmer, granit, dan sanitari terkemuka.",
  offersName: "Tiket Masuk Keramika",
  offersDescription:
    "Harga tiket pameran keramik berbeda-beda tergantung jenis tiket dan waktu pembeliannya. Tersedia promo early bird dan pre-sale.",
  inConjunction: {
    label: "In conjunction with",
    list: [
      {
        name: "Megabuild Indonesia",
        url: "https://megabuild.co.id",
        img: "/img/avatar/megabuild.svg",
      },
      // {
      //   name: "Cafe & Brasserie Expo Indonesia",
      //   url: "https://cafebrasserieexpo.com",
      //   img: "/img/avatar/cbe.svg",
      // },
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
    logoClass: "h-8",
  },
  footer: {
    logoClass: "h-10",
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
    showJobTitle: true,
    showBrandName: true,
    showProducts: true,
  },
  terms: {
    lastUpdate: "August 21, 2025",
  },
};

const contact = {
  email: "keramika@panoramamedia.co.id",
  whatsapp: "6281190083309",
  whatsappMarketing: "6281190083309",
};

const social = {
  instagram: "keramikaid",
  facebook: "keramikaid",
  linkedin: "keramikaindonesia",
  youtube: "megabuildindo",
  tiktok: "",
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
  // tiktok: {
  //   label: 'TikTok',
  //   path: `https://tiktok.com/@${social.tiktok}`,
  //   iconName: 'hugeicons:tiktok',
  // },
  linkedin: {
    label: "LinkedIn",
    path: `https://www.linkedin.com/company/${social.linkedin}`,
    iconName: "hugeicons:linkedin-01",
  },
  youtube: {
    label: "YouTube",
    path: `https://www.youtube.com/@${social.youtube}`,
    iconName: "hugeicons:youtube",
  },
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
    path: `https://api.whatsapp.com/send?phone=${contact.whatsapp}&text=Halo, ${app.shortName}! Saya mau tanya-tanya tentang sponsorship.`,
  },
  mediaPartner: {
    label: "Media Partner Registration",
    path: `https://api.whatsapp.com/send?phone=${contact.whatsappMarketing}&text=Halo, ${app.shortName}! Saya mau tanya-tanya tentang partnership.`,
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
        links: [routes.gallery, routes.faq, routes.partners, routes.links],
      },
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
        links: [routes.gallery, routes.faq, routes.partners, routes.links],
      },
    ],

    footer: [
      {
        label: "Discover",
        links: [routes.brands, routes.rundown, routes.programs, routes.ticket],
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
        links: [
          routes.gallery,
          routes.faq,
          routes.partners,
          routes.links,
          routes.news,
        ],
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
