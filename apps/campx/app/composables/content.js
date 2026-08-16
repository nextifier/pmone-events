import { defineStore } from "pinia";

/**
 * Page meta and section copy for campx.
 *
 * `pages.*` keys must match what each page passes to `usePageMeta("<key>")`.
 * A missing key is not fatal (the section falls back or renders nothing) but it
 * is always a mistake — see layers/base/app/composables/contentContract.ts.
 *
 * The dynamic pages (`/[location]` and `/[location]/[slug]`) deliberately have
 * no key here. They call `usePageMeta(null, { title, description })` and build
 * their meta from `app/data`, the same way base's `news/[slug].vue` does.
 *
 * Social proof, testimonials and press coverage are NOT here. They live in
 * `app/data/social-proof.ts` so the ratings have exactly one home.
 */
export const useContentStore = defineStore("content", {
  state: () => ({
    pages: {
      home: {
        title: `CampX Holiday Park: Camping, Rafting & Outing Jawa Barat`,
        description: `Camping tepi Waduk Jatiluhur dan arung jeram di Cikidang, Sukabumi. Paket harian, menginap, sampai outing kantor. Mulai Rp50rb per orang.`,
        withoutTitleTemplate: true,
      },
      paket: {
        title: `Semua Paket Camping, Rafting & Outing`,
        description: `24 paket di dua cabang CampX: menginap, aktivitas air, arung jeram, day trip, dan outing rombongan. Saring sesuai lokasi, harga, dan jumlah orang.`,
      },
      outing: {
        title: `Paket Outing Kantor & Team Building`,
        description: `Outing, gathering, dan team building di dua lokasi: tepi Waduk Jatiluhur dan tepi sungai Cikidang. Susunan acara dan penawaran menyesuaikan tim kamu.`,
      },
      galeri: {
        title: `Galeri Foto & Video`,
        description: `Suasana camping, cabin, arung jeram, dan outing di CampX Jatiluhur dan CampX Cikidang.`,
      },
      faq: {
        title: `Pertanyaan yang Sering Ditanyakan`,
        description: `Cara pesan, lokasi, jam check-in, fasilitas, sampai apa yang perlu dibawa untuk rafting. Jawabannya ada di sini.`,
      },
      kontak: {
        title: `Kontak & Reservasi`,
        description: `Mau reservasi, tanya paket, atau minta penawaran outing? Hubungi tim CampX lewat WhatsApp, email, atau formulir di halaman ini.`,
      },
      tentang: {
        title: `Tentang CampX Holiday Park`,
        description: `CampX mengelola dua holiday park di Jawa Barat: Jatiluhur di Purwakarta dan Cikidang di Sukabumi. Ini cerita dan cara kerjanya.`,
      },
      links: {
        title: `Links`,
        description: `Semua tautan CampX di satu tempat: paket, reservasi, dan cara menghubungi kami.`,
      },
      terms: {
        title: `Terms of Service`,
        description: `Syarat dan ketentuan penggunaan layanan serta website CampX Holiday Park.`,
      },
      privacy: {
        title: `Privacy Policy`,
        description: `Cara CampX Holiday Park mengumpulkan, memakai, dan melindungi data pribadi kamu.`,
      },
    },

    components: {
      // Kept as an empty object on purpose: campx ships its own hero, so it
      // reads nothing from here, but the content contract for the `index` route
      // still looks the key up.
      hero: {},

      postSlider: {
        title: {
          default: "Cerita dari lapangan",
          morePosts: "Baca yang lain",
        },
      },

      faq: {
        title: "Mungkin kamu nanya ini",
        emptyStateDescription:
          "Pertanyaannya lagi kami kumpulkan. Mampir lagi nanti, ya.",
        contactTitle: "Pertanyaanmu belum terjawab? Chat kami aja.",
      },

      contact: {
        title: "Kontak & reservasi",
        description:
          "Mau reservasi, tanya paket, atau minta penawaran outing? Tinggalkan kontakmu di sini, tim kami yang akan menghubungi.",
      },
    },
  }),

  getters: {
    /**
     * Page meta by key, or null when the key does not exist.
     * @param {object} state
     * @returns {function(string): object | null}
     */
    getMetaByKey: (state) => (key) => {
      return state.pages[key] || null;
    },
  },
});
