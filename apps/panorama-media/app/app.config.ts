const isProduction = process.env.NODE_ENV === "production";

const app = {
  name: "Panorama Media",
  shortName: "Panorama Media",
  // Binds to PM One project "pm" (Panorama Media). Folder name may differ. See root CLAUDE.md "App ↔ PM One Project Map".
  projectUsername: "pm",
  url: "https://panoramamedia.co.id",
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
  ogImage: {
    isDarkMode: false,
  },
  // Reverted from the PM One dashboard — see docs/website-settings-export.json.
  blog: { showPostCardAuthor: true },
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

const contactDialog = {
  title: "Let's Connect",
  description:
    "Want to know more about our brands, events, or partnerships? Leave a note and our team will be in touch.",
  submitLabel: "Send message",
  subject: "Panorama Media Inquiry",
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
  settings: settings,
  contactDialog: contactDialog,

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
