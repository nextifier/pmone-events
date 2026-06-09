import { defineStore } from "pinia";

export const useContentStore = defineStore("content", {
  state: () => ({
    pages: {
      home: {
        title: `CampX Holiday Park Jatiluhur`,
        description: `Lepas penat & hirup segarnya alam di CampX Jatiluhur! 🏕️ Tempat camping dan outing kekinian di tepi danau. Cek semua paket serunya di sini!`,
        ogImage: "/og/og-home.jpg",
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
      hero: {
        // announcements: [
        //   {
        //     text: `...`,
        //     link: "/jetcar-experience",
        //   },
        // ],

      },

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

      cta: {
        banners: [
          {
            image: "/img/banners/panorama-events-poster.jpg",
            subtitle: "Panorama Events",
            title: "Outing Impian, Tanpa Ribet.",
            description:
              "Mau outing tapi pusing ngurusinnya? Serahin aja ke ahlinya! Panorama Events siap atur semua kebutuhan acaramu dari A-Z. Kamu & tim tinggal nikmatin keseruannya.",
            accentColor: {
              light: "#ea580c",
              dark: "#f97316",
            },
            cta: {
              label: "Konsultasi Outing Gratis",
              link: "https://panoramaevents.id",
              openInNewTab: true,
            },
          },
          {
            image: "/img/banners/indooutingexpo-2025-poster.jpg",
            subtitle: "Indonesia Outing Expo 2025",
            title: "Berburu Promo & Gear Impianmu.",
            description:
              "Siap-siap! Pameran outing terbesar se-Indonesia akan hadir di JICC Senayan, 14-16 Nov 2025. Dapatkan diskon gila-gilaan untuk alat camping & paket liburan. Jangan lupa mampir ke booth CampX ya!",
            accentColor: {
              light: "#0891b2",
              dark: "#06b6d4",
            },
            cta: {
              label: "Info Lengkap Expo",
              link: "https://indooutingexpo.co.id",
              openInNewTab: true,
            },
          },
        ],
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
