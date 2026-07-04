import { defineStore } from "pinia";

export const useContentStore = defineStore("content", {
  state: () => ({
    pages: {
      home: {
        title: `CampX Holiday Park Jatiluhur`,
        description: `Lepas penat & hirup segarnya alam di CampX Jatiluhur! 🏕️ Tempat camping dan outing kekinian di tepi danau. Cek semua paket serunya di sini!`,
        withoutTitleTemplate: true,
      },
      contact: {
        title: `Contact us`,
        description: `Ada rencana outing atau butuh info lebih lanjut? Hubungi tim CampX di sini! Dapatkan penawaran untuk acara grup, gathering, atau sekadar tanya-tanya.`,
      },
      terms: {
        title: `Terms of Service`,
        description: `Baca Syarat & Ketentuan penggunaan layanan dan website CampX Holiday Park Jatiluhur.`,
      },
      privacy: {
        title: `Privacy Policy`,
        description: `Pelajari cara CampX Holiday Park Jatiluhur mengumpulkan, menggunakan, dan melindungi data pribadi Anda.`,
      },
    },

    components: {
      hero: {},

      postSlider: {
        title: {
          default: "Latest Updates",
          morePosts: "You might also like",
        },
      },

      faq: {
        title: "Mungkin Kamu Nanya Ini?",
        emptyStateDescription:
          "We are gathering commonly asked questions. Please come back later 😉",
        contactTitle: "Punya pertanyaan lain? Hubungi kami aja!",
      },

      contact: {
        title: "Contact us",
        description:
          "Ada rencana outing atau butuh info lebih lanjut? Hubungi tim CampX di sini! Dapatkan penawaran untuk acara grup, gathering, atau sekadar tanya-tanya.",
      },

      socialProof: [
        {
          name: "Google",
          rating: "4.6",
          totalReviews: 195,
          iconName: "devicon:google",
          link: "https://maps.app.goo.gl/YsxHzezAu8Vpnrvx5",
          ctaLabel: "Cek Google Reviews",
        },
        {
          name: "TikTok",
          rating: "4.9",
          totalReviews: 226,
          iconName: "simple-icons:tiktok",
          link: "https://www.tiktok.com/place/CAMPX-JATILUHUR-21568226297381925",
          ctaLabel: "Lihat Konten TikTok",
        },
      ],
    },
  }),

  getters: {
    /**
     * Mengambil metadata untuk halaman tertentu berdasarkan kuncinya.
     * @param {object} state - State store.
     * @returns {function(string): object | null}
     */
    getMetaByKey: (state) => (key) => {
      return state.pages[key] || null;
    },
  },
});
