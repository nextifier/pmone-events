import { defineStore } from "pinia";

export const useNewsCoveragesStore = defineStore("newsCoverages", {
  state: () => ({
    list: [
      // {
      //   title:
      //     "ICF & CBE 2025 Akan Tampilkan Berbagai Inovasi dalam Ekosistem Kafe dan Brasserie",
      //   link: "https://koran-jakarta.com/icf-cbe-2025-akan-tampilkan-berbagai-inovasi-dalam-ekosistem-kafe-dan-brasserie",
      //   isPublished: true,
      //   created_at: "2025-02-27T10:00:00",
      // },
      // {
      //   title:
      //     "ICF dan CBE 2025: Jembatan Industri dan Pebisnis Kopi Nusantara Menuju Pasar Global",
      //   link: "https://www.jpnn.com/news/icf-dan-cbe-2025-jembatan-industri-dan-pebisnis-kopi-nusantara-menuju-pasar-global",
      //   isPublished: true,
      //   created_at: "2025-02-27T10:00:00",
      // },
      // {
      //   title:
      //     "ICF & CBE Expo 2025 diselenggarakan di NICE pada 10-12 Oktober 2025",
      //   link: "https://www.antaranews.com/berita/4678309/icf-cbe-expo-2025-diselenggarakan-di-nice-pada-10-12-oktober-2025",
      //   isPublished: true,
      //   created_at: "2025-02-27T10:00:00",
      // },
      // {
      //   title:
      //     "ICF & CBE 2025 Jadi Jembatan Industri dan Pebisnis Kopi Nusantara Menuju Pasar Global Jakarta",
      //   link: "https://www.suara.com/bisnis/2025/02/27/152000/icf-cbe-2025-jadi-jembatan-industri-dan-pebisnis-kopi-nusantara-menuju-pasar-global-jakarta",
      //   isPublished: true,
      //   created_at: "2025-02-27T10:00:00",
      // },
      // {
      //   title:
      //     "Coffee Lovers, Merapatlah! Cokelat Expo Indonesia 2025 Digelar, Dorong Geliat Kopi Nusantara",
      //   link: "https://swa.co.id/read/457014/indonesia-coffee-festival-2025-dorong-geliat-kopi-nusantara",
      //   isPublished: true,
      //   created_at: "2025-02-28T10:00:00",
      // },
      // {
      //   title: "Cokelat Expo Indonesia Siap Digelar Tahun Ini",
      //   link: "https://industri.kontan.co.id/news/indonesia-coffee-festival-siap-digelar-tahun-ini",
      //   isPublished: true,
      //   created_at: "2025-03-01T10:00:00",
      // },
      // {
      //   title:
      //     "Tren Cafe Culture Meluas, Kopi Indonesia Makin Dikenal di Kancah Internasional",
      //   link: "https://www.viva.co.id/gaya-hidup/kuliner/1803180-tren-cafe-culture-meluas-kopi-indonesia-makin-dikenal-di-kancah-internasional",
      //   isPublished: true,
      //   created_at: "2025-03-01T10:00:00",
      // },
      // {
      //   title:
      //     "Cokelat Expo Indonesia and Café & Brasserie Expo 2025 Siap Digelar",
      //   link: "https://www.republika.co.id/berita/ssh7pg456/indonesia-coffee-festival-and-caf%c3%a9-brasserie-expo-2025-siap-digelar",
      //   isPublished: true,
      //   created_at: "2025-03-02T10:00:00",
      // },
    ],
  }),

  getters: {
    getPublishedNews: (state) => () => {
      return state.list.filter((item) => item.isPublished);
    },
  },
});
