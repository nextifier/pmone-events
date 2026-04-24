const isProduction = process.env.NODE_ENV === "production";

const app = {
  name: "The 9th Indonesia International Cocoa Conference & Dinner",
  shortName: "The 9th IICC",
  projectUsername: "askindo",
  url: isProduction ? "https://iicc.askindo.id" : "http://localhost:3000",
  company: {
    name: "Indonesian Cocoa Association",
    nameId: "Asosiasi Kakao Indonesia",
    shortName: "INCA",
    shortNameId: "ASKINDO",
    established: 1989,
    address:
      "Thamrin City Cosmo Mansion 11-CC, Kebon Kacang Raya, Jakarta, 10340, Indonesia",
  },
};

const event = {
  title: "The 9th Indonesia International Cocoa Conference & Dinner",
  edition: {
    value: 9,
    ordinal: "th",
  },
  // poster: "/img/tickets/megabuild-2026-poster.jpg",
  // status: "", // Available values: "upcoming", "live", "completed"
  startTime: "Jul 22, 2026 10:00:00",
  endTime: "Jul 24, 2026 21:00:00",
  date: "Jul 22-24, 2026",
  dateOnly: "22-24",
  month: "July",
  year: "2026",
  time: "10 AM - 9 PM",
  location: "Hotel Tentrem Yogyakarta",
  locationShort: "Hotel Tentrem Yogyakarta",
  hall: "Ballroom 3",
  locationLink: "https://maps.app.goo.gl/mgEFte2gyMYJwu8S9",
  locationAddress:
    "Jl. P. Mangkubumi No.72A, Cokrodiningratan, Kec. Jetis, Kota Yogyakarta, Daerah Istimewa Yogyakarta 55233",
};

const ticket = {
  status: "available" as "available" | "not_available", // Ubah ke "available" ketika tiket sudah tersedia
};

const settings = {
  blog: {
    showPostCardAuthor: true,
    showPostCardExcerpt: false,
  },
  ogImage: {
    isDarkMode: false,
  },
  terms: {
    lastUpdate: "January 9, 2026",
  },
};

const contact = {
  email: "iicc@askindo.id",
  whatsapp: "6287781235071",
  phones: [
    { name: "Dewi", number: "+62 877 8123 5071" },
    { name: "Alma", number: "+62 859 2124 3547" },
  ],
};

const social = {
  instagram: "askindo.secretariat",
  facebook: "askindo.secretariat",
};

const contactLinks = {
  email: {
    label: "Email",
    path: `mailto:${contact.email}`,
  },
  whatsapp: {
    label: "WhatsApp",
    path: `https://api.whatsapp.com/send?phone=${contact.whatsapp}&text=Hello, I'd like to know more about the 9th IICC!`,
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
};

const routes = {
  home: {
    label: "Home",
    path: "/",
  },
  about: {
    label: "About",
    path: "/#about",
  },
  whyAttend: {
    label: "Why Attend",
    path: "/#why-attend",
  },
  topics: {
    label: "Topics",
    path: "/#topics",
  },
  agenda: {
    label: "Agenda",
    path: "/#agenda",
  },
  tickets: {
    label: "Tickets",
    path: "/#tickets",
  },
  faq: {
    label: "FAQs",
    path: "/#faq",
  },
  contact: {
    label: "Contact",
    path: "/contact",
  },
  visitorRegistration: {
    label: "Register",
    path: "https://event.undangin.com/ticket/26420",
  },
};

const contactDialog = {
  title: "Get in Touch",
  description:
    "Interested in attending or learning more about the 9th IICC? Leave your details and our team will reach out soon.",
  submitLabel: "Submit",
  subject: "IICC Inquiry",
};

export default defineAppConfig({
  app: app,
  event: event,
  ticket: ticket,
  settings: settings,
  contact: contact,
  contactDialog: contactDialog,
  social: social,
  contactLinks: contactLinks,
  socialLinks: socialLinks,

  routes: {
    header: [
      // routes.home,
      routes.about,
      // routes.whyAttend,
      routes.topics,
      routes.agenda,
      routes.tickets,
      routes.faq,
      routes.contact,
    ],

    dialog: [
      {
        label: "Menu",
        links: [
          routes.home,
          routes.about,
          routes.topics,
          routes.agenda,
          routes.tickets,
          routes.faq,
          routes.contact,
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
    ],

    visitorRegistration: routes.visitorRegistration,
  },
});
