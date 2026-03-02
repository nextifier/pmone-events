const isProduction = process.env.NODE_ENV === "production";

const app = {
  name: "Megabuild Indonesia",
  shortName: "Megabuild",
  projectUsername: "megabuild",
  url: isProduction ? "https://megabuild.co.id" : "http://localhost:3000",
  company: {
    name: "PT Pameran Masa Kini",
    address:
      "Panorama Media Building, Jl. Tanjung Selor No.17A, RT.11/RW.6, Cideng, Kecamatan Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10150",
  },
};

const event = {
  title: "Megabuild Indonesia",
  edition: {
    value: 23,
    ordinal: "rd",
  },
  poster: "/img/tickets/megabuild-2026-poster.jpg",
  status: "", // Available values: "upcoming", "live", "completed"
  startTime: "Jun 4, 2026 10:00:00",
  endTime: "Jun 7, 2026 21:00:00",
  date: "Jun 4-7, 2026",
  dateOnly: "4-7",
  month: "June",
  year: "2026",
  time: "10 AM - 9 PM",
  location: "Nusantara International Convention Exhibition (NICE), PIK 2",
  locationShort: "NICE PiK 2",
  locationLink: "https://maps.app.goo.gl/V6N3r7vxD1BMn9pi8",
  // hall: "Hall B",
  teaserVideoId: "",
  profileImage: "/img/avatar/megabuild.svg",
  description:
    "Pameran bahan bangunan dan interior terbesar di Indonesia. Temukan produk-produk unggulan untuk proyek konstruksi, renovasi, dan desain interior Anda.",
  offersName: "Tiket Masuk Megabuild",
  offersDescription:
    "Harga tiket pameran bahan bangunan berbeda-beda tergantung jenis tiket dan waktu pembeliannya. Tersedia promo early bird dan pre-sale.",
  inConjunction: {
    label: "In conjunction with",
    list: [
      {
        name: "Keramika Indonesia",
        url: "https://keramika.co.id",
        img: "/img/avatar/keramika.svg",
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
    logoClass: "h-5 text-primary",
  },
  footer: {
    logoClass: "h-8 text-primary",
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
  email: "megabuild@panoramamedia.co.id",
  whatsapp: "628118805638",
  whatsappMarketing: "628118805638",
};

const social = {
  instagram: "megabuildindo",
  facebook: "megabuildindo",
  linkedin: "megabuildid",
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
  megaProperty: {
    label: "Mega Property",
    path: "/megaproperty",
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
      routes.megaProperty,
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
          routes.megaProperty,
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
        links: [
          routes.megaProperty,
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
