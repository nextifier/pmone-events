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
