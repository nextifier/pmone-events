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
  ogImage: {
    isDarkMode: false,
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
  ticketTerms: {
    label: "Ticket Terms and Conditions",
    path: "/ticket-terms-and-conditions",
  },
  ticketRefundPolicy: {
    label: "Ticket Refund and Return Policy",
    path: "/ticket-refund-and-return-policy",
  },
  eventPolicy: {
    label: "Event Policy",
    path: "/event-policy",
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
  settings: settings,
  contactDialog: contactDialog,

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
      {
        label: "Company",
        links: [routes.about, routes.services, routes.events],
      },
      {
        label: "Resources",
        links: [routes.faq, routes.news, routes.contact],
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
