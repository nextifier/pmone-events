const isProduction = process.env.NODE_ENV === "production";

const app = {
  name: "Panorama Events",
  shortName: "Panorama Events",
  projectUsername: "pe",
  url: isProduction ? "https://panoramaevents.id" : "http://localhost:3000",
  company: {
    name: "PT Panorama Evenindo",
    address:
      "Panorama Media Building, Jl. Tanjung Selor No.17A, RT.11/RW.6, Cideng, Kecamatan Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10150",
  },
};

const settings = {
  header: {
    logoClass: "h-8 text-primary",
    cta: [{ label: "ui.contactUs", path: "/contact", variant: "primary" }],
  },
  footer: {
    logoClass: "h-12 text-primary",
  },
  blog: {
    showPostCardAuthor: false,
    showPostCardExcerpt: false,
  },
  ogImage: {
    isDarkMode: false,
  },
  terms: {
    lastUpdate: "August 21, 2025",
  },
};

const contact = {
  email: "events@panoramamedia.co.id",
  whatsapp: "6281110529527",
};

const social = {
  instagram: "panoramaevents.id",
  facebook: "hellopanoramaevents",
  // linkedin: "",
  youtube: "panoramaevents",
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
  // linkedin: {
  //   label: "LinkedIn",
  //   path: `https://www.linkedin.com/company/${social.linkedin}`,
  //   iconName: "hugeicons:linkedin-01",
  // },
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
  services: {
    label: "Services",
    path: "/services",
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
  title: "Let's Plan Together",
  description:
    "Tell us about your team and what you want to achieve. Our outing designers will reach out with ideas tailored to your goals.",
  submitLabel: "Send inquiry",
  subject: "Corporate Outing Inquiry",
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
      routes.services,
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
          routes.services,
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
