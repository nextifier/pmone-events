const isProduction = process.env.NODE_ENV === "production";

const app = {
  name: "Panorama Media",
  shortName: "Panorama Media",
  projectUsername: "pm",
  url: isProduction ? "https://panoramamedia.co.id" : "http://localhost:3000",
  company: {
    name: "PT Panorama Media",
    address:
      "Panorama Media Building, Jl. Tanjung Selor No.17A, RT.11/RW.6, Cideng, Kecamatan Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10150",
  },
};

const settings = {
  header: {
    logoClass: "h-8",
    cta: [{ label: "ui.contactUs", path: "/contact", variant: "primary" }],
  },
  footer: {
    logoClass: "h-12",
  },
  blog: {
    showPostCardAuthor: true,
    showPostCardExcerpt: false,
  },
  ogImage: {
    isDarkMode: false,
  },
  terms: {
    lastUpdate: "August 21, 2025",
  },
  bookSpaceForm: {
    showJobTitle: false,
    showBrandName: true,
    showProducts: false,
  },
};

const contact = {
  email: "hello@panoramamedia.co.id",
  whatsapp: "6281110529527",
};

const social = {
  instagram: "panoramamediaid",
  // facebook: "",
  linkedin: "panorama-media",
  youtube: "pmoneid",
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
  about: {
    label: "About",
    path: "/about",
  },
  brands: {
    label: "Our Brands",
    path: "/brands",
  },
  events: {
    label: "Events",
    path: "/events",
  },
  faq: {
    label: "FAQ",
    path: "/faq",
  },
  contact: {
    label: "Contact",
    path: "/contact",
  },
  news: {
    label: "News",
    path: "/news",
    rightClickLink: isProduction
      ? "https://api.pmone.id/posts"
      : "http://localhost:8000/posts",
  },
};

const event = {
  title: "",
  edition: { value: "", ordinal: "" },
  poster: "",
  status: "",
  startTime: "",
  endTime: "",
  date: "",
  dateOnly: "",
  dateFormatID: "",
  month: "",
  year: "",
  time: "",
  location: "",
  locationShort: "",
  locationLink: "",
  hall: "",
  teaserVideoId: "",
  profileImage: "",
  description: "",
  offersName: "",
  offersDescription: "",
  inConjunction: { label: "", list: [] },
  sponsoredBy: { label: "", list: [] },
};

const contactDialog = {
  title: "Let's Connect",
  description:
    "Want to know more about our brands, events, or partnerships? Leave a note and our team will be in touch.",
  submitLabel: "Send message",
  subject: "Panorama Media Inquiry",
};

export default defineAppConfig({
  app: app,
  event: event,
  settings: settings,
  contact: contact,
  contactDialog: contactDialog,
  social: social,
  contactLinks: contactLinks,
  socialLinks: socialLinks,

  routes: {
    header: [
      routes.home,
      routes.about,
      routes.brands,
      routes.events,
      routes.faq,
      routes.contact,
      routes.news,
    ],

    dialog: [
      {
        label: "Menu",
        links: [
          routes.home,
          routes.about,
          routes.brands,
          routes.events,
          routes.faq,
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
      // {
      //   label: "Resources",
      //   links: [
      //     routes.gallery,
      //     routes.faq,
      //     routes.ticketPolicy,
      //     routes.eventPolicy,
      //     routes.links,
      //   ],
      // },
    ],

    footer: [],
  },
});
