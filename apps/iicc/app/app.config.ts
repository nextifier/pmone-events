const app = {
  name: "The 9th Indonesia International Cocoa Conference & Dinner",
  shortName: "The 9th IICC",
  // Binds to PM One project "askindo" (ASKINDO). Folder name may differ. See root CLAUDE.md "App ↔ PM One Project Map".
  projectUsername: "askindo",
  url: "https://iicc.askindo.id",
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

const ticket = {
  status: "available" as "available" | "not_available", // Ubah ke "available" ketika tiket sudah tersedia
};

const settings = {
  ogImage: {
    isDarkMode: false,
  },
  // Reverted from the PM One dashboard — see docs/website-settings-export.json.
  blog: { showPostCardAuthor: true },
  terms: { lastUpdate: "2026-01-09" },
  rundown: { showSearch: false, showAllDetails: true },
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
    path: "/#rundown",
  },
  hotels: {
    label: "Hotels",
    path: "/hotels",
  },
  tickets: {
    label: "Tickets",
    path: "/#tickets",
  },
  faq: {
    label: "FAQs",
    path: "/#faq",
  },
  whyYogyakarta: {
    label: "Visit Yogyakarta",
    path: "/#why-yogyakarta",
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
  // Per-project design tokens — OPT-IN (see layers/base/app/app.config.ts).
  // Default OFF → this app keeps its native palette from app/assets/css/app.css.
  // For custom brand colors edit app.css; for a shadcn palette set enabled:true,
  // e.g. { enabled: true, baseColor: "zinc", theme: "blue", chartColor: "blue" }.
  appearance: {
    enabled: false,
    baseColor: "neutral",
    theme: "neutral",
    chartColor: "neutral",
    radius: "default",
  },

  app: app,
  ticket: ticket,
  settings: settings,
  contactDialog: contactDialog,

  routes: {
    header: [
      routes.home,
      routes.about,
      // routes.whyAttend,
      routes.topics,
      routes.agenda,
      // Was injected at runtime from the `home_sections.hotels` toggle; iicc is
      // the only app that ever had it on, so it is a plain nav entry now.
      routes.hotels,
      routes.whyYogyakarta,
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
          routes.hotels,
          routes.whyYogyakarta,
          routes.tickets,
          routes.faq,
          routes.contact,
        ],
      },
    ],

    visitorRegistration: routes.visitorRegistration,
  },
});
