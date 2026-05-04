const isProduction = process.env.NODE_ENV === "production";

const app = {
  name: "Global AI Expo",
  shortName: "Global AI Expo",
  projectUsername: "globalaiexpo",
  url: isProduction
    ? "https://global-ai-expo.pages.dev"
    : "http://localhost:3000",
  company: {
    name: "Global AI Expo",
    address:
      "Panorama Media Building, Jl. Tanjung Selor No.17A, RT.11/RW.6, Cideng, Kecamatan Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10150",
  },
};

const event = {
  title: "Global AI Expo 2026",
  edition: {
    value: 1,
    ordinal: "st",
  },
  poster: "/img/tickets/global-ai-expo-poster.jpg",
  status: "upcoming", // Available values: "upcoming", "live", "completed"
  // TODO: confirm exact dates with organizer
  startTime: "November 20, 2026 09:00:00",
  endTime: "November 22, 2026 21:00:00",
  date: "November 20-22, 2026",
  dateOnly: "20-22",
  month: "November",
  year: "2026",
  time: "10 AM - 9 PM",
  location: "Sentul City, Bogor, Indonesia",
  locationShort: "Sentul City, Bogor",
  locationLink: "https://maps.app.goo.gl/vYQ2LBQjFmCyo19L9",
  hall: "",
  teaserVideoId: "",
  profileImage: "/img/tickets/poster.jpg",
  description:
    "An AI exhibition, conference, startup pavilion, and business matching platform at Sentul City. Targeting 200 to 500 exhibitors and 20,000 to 50,000 visitors from 30+ countries.",
  offersName: "Global AI Expo Ticket",
  offersDescription:
    "Visitor passes for the three-day expo. Early-bird pricing opens later this year.",
  inConjunction: {
    label: "In conjunction with",
    list: [],
  },
};

const settings = {
  header: {
    logoClass: "h-6 text-primary",
  },
  footer: {
    logoClass: "h-12 text-primary",
  },
  ticket: {
    tabs: {
      showTickets: true,
      showGuests: false,
      showBrands: true,
      showRundown: true,
      showAbout: true,
      showPhotos: false,
    },
  },
  blog: {
    showPostCardAuthor: false,
    showPostCardExcerpt: false,
  },
  ogImage: {
    isDarkMode: false,
  },
  bookSpaceForm: {
    showJobTitle: true,
    showBrandName: true,
    showProducts: true,
  },
  terms: {
    lastUpdate: "April 30, 2026",
  },
};

const contact = {
  // TODO: replace with real channels once provisioned
  email: "globalaiexpo@panoramamedia.co.id",
  whatsapp: "6281190083305",
  whatsappMarketing: "6281190083305",
};

const social = {
  // TODO: replace with real handles
  instagram: "globalaiexpo",
  facebook: "globalaiexpo",
  tiktok: "globalaiexpo",
  linkedin: "global-ai-expo",
  youtube: "globalaiexpo",
};

const contactLinks = {
  email: {
    label: "Email",
    path: `mailto:${contact.email}`,
  },
  whatsapp: {
    label: "WhatsApp",
    path: `https://api.whatsapp.com/send?phone=${contact.whatsapp}&text=Hi, ${app.shortName}!`,
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
  speakers: {
    label: "Speakers",
    path: "/speakers",
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
      routes.speakers,
      routes.brands,
      routes.rundown,
      routes.programs,
      {
        label: "Resources",
        links: [routes.faq, routes.links],
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
          routes.speakers,
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
        links: [routes.faq, routes.links],
      },
    ],

    footer: [
      {
        label: "Discover",
        links: [
          routes.speakers,
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
