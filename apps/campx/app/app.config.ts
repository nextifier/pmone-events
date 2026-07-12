const app = {
  name: "CampX Holiday Park Jatiluhur",
  shortName: "CampX",
  // Binds to PM One project "campx" (CampX). Folder name may differ. See root CLAUDE.md "App ↔ PM One Project Map".
  projectUsername: "campx",
  url: "https://campx.id",
  company: {
    name: "CampX",
    address:
      "Panorama Media Building, Jl. Tanjung Selor No.17A, RT.11/RW.6, Cideng, Kecamatan Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10150",
  },
};

const settings = {
  ogImage: {
    isDarkMode: false,
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

const contactDialog = {
  title: "Tanya-tanya Dulu Aja.",
  description:
    "Mau tau soal paket outing atau mau custom acara sendiri? Tinggalin kontakmu, tim kami siap jawab semua pertanyaanmu.",
  submitLabel: "Submit",
  subject: "Outing Inquiry",
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
