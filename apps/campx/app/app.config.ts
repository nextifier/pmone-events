const app = {
  // Two branches since Aug 2026 (Jatiluhur and Cikidang), so the brand name
  // can no longer carry one of them.
  name: "CampX Holiday Park",
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


/**
 * Nav labels are written in Indonesian and used verbatim. HeaderNav, HeaderMenu
 * and Footer all resolve a label as `te('nav.' + label) ? t(...) : label`, so a
 * label with no translation key renders as written — which is what we want when
 * the site has exactly one locale.
 */
const routes = {
  home: { label: "Beranda", path: "/" },
  jatiluhur: { label: "Jatiluhur", path: "/jatiluhur" },
  cikidang: { label: "Cikidang", path: "/cikidang" },
  packages: { label: "Paket", path: "/paket" },
  outing: { label: "Outing", path: "/outing" },
  gallery: { label: "Galeri", path: "/galeri" },
  news: { label: "Artikel", path: "/news" },
  faq: { label: "FAQ", path: "/faq" },
  contact: { label: "Kontak", path: "/kontak" },
  about: { label: "Tentang", path: "/tentang" },
  links: { label: "Links", path: "/links" },
  terms: { label: "Syarat & Ketentuan", path: "/syarat-ketentuan" },
  privacy: { label: "Kebijakan Privasi", path: "/kebijakan-privasi" },
};

const contactDialog = {
  title: "Tanya dulu boleh",
  description:
    "Mau tahu isi paket outing, atau mau susun acara sendiri? Tinggalkan kontakmu di sini, tim kami yang menghubungi.",
  submitLabel: "Kirim",
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
    // Kept short on purpose: the two branches are the decision a visitor
    // actually has to make, and everything else hangs off the menu.
    header: [routes.jatiluhur, routes.cikidang, routes.packages, routes.outing],

    dialog: [
      {
        label: "Menu",
        links: [
          routes.home,
          routes.jatiluhur,
          routes.cikidang,
          routes.packages,
          routes.outing,
        ],
      },
      {
        label: "Info",
        links: [
          routes.gallery,
          routes.news,
          routes.faq,
          routes.about,
          routes.contact,
          routes.links,
        ],
      },
    ],

    footer: [
      {
        label: "Jelajah",
        links: [routes.jatiluhur, routes.cikidang, routes.packages, routes.gallery],
      },
      {
        label: "Untuk perusahaan",
        links: [routes.outing, routes.contact],
      },
      {
        label: "Info",
        links: [routes.about, routes.faq, routes.news, routes.terms, routes.privacy],
      },
    ],
  },
});
