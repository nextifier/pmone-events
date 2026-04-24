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
        description: ``,
      },
      privacy: {
        title: `Privacy Policy`,
        description: ``,
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

        bannerHero: [
          {
            subHeadline: "BARU! Jetcar Experience",
            content: `
      <p>Bukan jetski biasa! Rasakan sensasi nyetir mobil sport keren yang meluncur di atas Danau Jatiluhur. Muat sampai 4 orang, udah include dokumentasi drone!</p>
    `,
            img: {
              src: "/img/experiences/cover-jetcar.jpg",
              w: 400,
              h: 500,
            },
            cta: {
              label: "Cobain Jetcar Sekarang",
              link: "/experiences/jetcar-experience",
            },
          },
          {
            subHeadline: "BARU! Camping di Cabin X",
            content: `
      <p>Nikmatin nyamannya staycation dengan vibe alam yang maksimal. Kabin baru kami udah siap kamu booking. Kapan lagi coba?</p>
    `,
            img: {
              src: "/img/banners/banner-cabin.jpg",
              w: 400,
              h: 500,
            },
            cta: {
              label: "Cek Detail Kabin",
              link: "/experiences/cabin",
            },
          },
          {
            subHeadline: "Outing Kantor Anti Mainstream",
            content: `
      <p>Bosen sama outing yang gitu-gitu aja? Ajak tim kamu ke CampX! Fasilitas lengkap, aktivitas seru, dijamin bikin tim makin solid.</p>
    `,
            img: {
              src: "/img/banners/banner-outing.jpg",
              w: 400,
              h: 500,
            },
            cta: {
              label: "Tanya Paket Grup",
              link: "/contact",
            },
          },
          {
            subHeadline: "Udah Tau Belum?",
            content: `
      <p>CampX berada di tepi Waduk Jatiluhur, lho! Yang ternyata adalah waduk terbesar se-Indonesia. Pemandangannya? Juara!</p>
    `,
            img: {
              src: "/img/banners/banner-waduk.jpg",
              w: 400,
              h: 500,
            },
            cta: {
              label: "Lihat Lokasi di Peta",
              link: "https://maps.app.goo.gl/1uhAWnpqFdcH6Au66",
            },
          },
          {
            subHeadline: "Taklukkan Danau dengan SUP!",
            content: `
      <p>Udah pernah coba Stand-Up Paddle Board? Tamu yang nginap di CampX bisa main gratis, lho. Uji keseimbanganmu sambil nikmatin view terbaik!</p>
    `,
            img: {
              src: "/img/banners/banner-sup.jpg",
              w: 400,
              h: 500,
            },
            cta: {
              label: "Cobain Stand-Up Paddle",
              link: "/experiences/stand-up-paddle",
            },
          },
          {
            subHeadline: "Share Momen Kerenmu!",
            content: `
      <p>Jangan lupa tag @campx.id di Instagram & TikTok saat kamu posting keseruanmu! Pasti di-repost sama mimin. 😉</p>
    `,
            img: {
              src: "/img/banners/banner-socmed.jpg",
              w: 400,
              h: 500,
            },
            cta: {
              label: "Follow Instagram CampX",
              link: "https://instagram.com/campx.id",
            },
          },
        ],
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
