const isProduction = process.env.NODE_ENV === "production";

const app = {
  name: "CampX Holiday Park Jatiluhur",
  shortName: "CampX",
  projectUsername: "campx",
  url: isProduction ? "https://campx.id" : "http://localhost:3000",
  company: {
    name: "CampX",
    address:
      "Panorama Media Building, Jl. Tanjung Selor No.17A, RT.11/RW.6, Cideng, Kecamatan Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10150",
  },
};

const settings = {
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
  email: "hello@campx.id",
  emailOuting: "hello@campx.id",
  whatsapp: "6281398885402",
  whatsappOuting: "6281398885402",
  // whatsappMarketing: "628118805638",
};

const social = {
  instagram: "campx.id",
  tiktok: "campx.id",
  youtube: "campx-jatiluhur",
  facebook: "",
  linkedin: "",
};

const contactLinks = {
  email: {
    label: "Email",
    path: `mailto:${contact.email}`,
    iconName: "hugeicons:mail-02",
  },
  whatsapp: {
    label: "WhatsApp",
    path: `https://api.whatsapp.com/send?phone=${contact.whatsapp}&text=Halo, ${app.shortName}!`,
    iconName: "hugeicons:whatsapp",
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
  experiences: {
    label: "Experiences",
    path: "/experiences",
  },
  contact: {
    label: "Contact",
    path: "/contact",
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
  title: "Tanya-tanya Dulu Aja.",
  description:
    "Mau tau soal paket outing atau mau custom acara sendiri? Tinggalin kontakmu, tim kami siap jawab semua pertanyaanmu.",
  submitLabel: "Submit",
  subject: "Outing Inquiry",
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
      //   routes.home,
      //   routes.brands,
      //   routes.rundown,
      //   routes.programs,
      //   {
      //     label: "Resources",
      //     links: [
      //       routes.gallery,
      //       routes.faq,
      //       routes.ticketPolicy,
      //       routes.eventPolicy,
      //       routes.links,
      //     ],
      //   },
      //   routes.partners,
      //   routes.contact,
      //   routes.news,
    ],

    dialog: [
      // {
      //   label: "Menu",
      //   links: [
      //     routes.home,
      //     routes.brands,
      //     routes.rundown,
      //     routes.programs,
      //     routes.ticket,
      //     routes.bookSpace,
      //     routes.contact,
      //     routes.news,
      //     routes.partners,
      //   ],
      // },
      // {
      //   label: "Get in touch",
      //   links: Object.values(contactLinks),
      // },
      // {
      //   label: "Social",
      //   links: Object.values(socialLinks),
      // },
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

    footer: [
      // {
      //   label: "Discover",
      //   links: [
      //     routes.brands,
      //     routes.rundown,
      //     routes.programs,
      //     routes.ticket,
      //     routes.partners,
      //     routes.news,
      //   ],
      // },
      // {
      //   label: "For Businesses",
      //   links: [
      //     routes.bookSpace,
      //     routes.sponsorship,
      //     routes.mediaPartner,
      //     routes.contact,
      //   ],
      // },
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
  },
});
