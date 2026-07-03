const app = {
  name: "Indonesia Coffee Festival (ICF)",
  shortName: "ICF",
  projectUsername: "icf",
  dataSourceUsername: "cbe",
  url: "https://indocoffeefestival.com",
  company: {
    name: "PT Panorama Media",
    address:
      "Panorama Media Building, Jl. Tanjung Selor No.17A, RT.11/RW.6, Cideng, Kecamatan Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10150",
  },
};

const settings = {
  header: {
    logoClass: "h-9",
  },
  footer: {
    logoClass: "h-12",
  },
  ogImage: {
    isDarkMode: true,
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
    path: "/tickets",
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
