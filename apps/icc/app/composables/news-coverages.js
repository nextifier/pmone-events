import { defineStore } from "pinia";

export const useNewsCoveragesStore = defineStore("newsCoverages", {
  state: () => ({
    list: [
      {
        title:
          "INACON dan Indonesia Comic Con 2025 Usung Tema Futuristik dan Semarak Cahaya Neon",
        link: "https://www.liputan6.com/lifestyle/read/5936079/inacon-dan-indonesia-comic-con-2025-usung-tema-futuristik-dan-semarak-cahaya-neon",
        created_at: "2025-02-26T10:00:00",
      },
      {
        title:
          "LAUNCHING INDONESIA ANIME CON & INDONESIA COMIC CON 2025: Saatnya Kolaborasi dan Inovasi Pelaku Industri Kreatif ",
        link: "https://lewatlensa.com/2025/02/26/launching-indonesia-anime-con-indonesia-comic-con-2025-saatnya-kolaborasi-dan-inovasi-pelaku-industri-kreatif/",
        created_at: "2025-02-26T10:00:00",
      },
      {
        title:
          "Indonesia Anime Con dan Indonesia Comic Con 2025 Hadir Lagi, Ini Agendanya",
        link: "https://www.detik.com/pop/culture/d-7798348/indonesia-anime-con-dan-indonesia-comic-con-2025-hadir-lagi-ini-agendanya",
        created_at: "2025-02-27T10:00:00",
      },
      {
        title: "Launching Indonesia Anime Con dan Indonesia Comic Con 2025",
        link: "https://www.revivaltv.id/berita/icc-inacon-2025-83187921865",
        created_at: "2025-02-27T10:00:00",
      },
      {
        title:
          "Indonesia Anime Con dan Indonesia Comic Con 2025 Diresmikan, Siap Guncang 2025",
        link: "https://www.upstation.media/article/indonesia-anime-con-indonesia-comic-con-2025",
        created_at: "2025-02-27T10:00:00",
      },
      {
        title: "Nantikan Indonesia Anime Con dan Indonesia Comic Con 2025!",
        link: "https://www.kaorinusantara.or.id/newsline/222741/indonesia-anime-con-dan-indonesia-comic-con-2025",
        created_at: "2025-02-28T10:00:00",
      },
      {
        title: "Indonesia Anime Con dan Indonesia Comic Con 2025!",
        link: "https://unicornfantasian.com/posts/indonesia-anime-con-dan-indonesia-comic-con-2025/",
        created_at: "2025-03-02T10:00:00",
      },
      {
        title:
          "INACON dan ICC Dilangsungkan pada Tahun Ini, Hadirkan Konsep Futuristik dan Semarak Cahaya Neon",
        link: "https://inforemaja.id/posts/512394/inacon-dan-icc-dilangsungkan-pada-tahun-ini-hadirkan-konsep-futuristik-dan-semarak-cahaya-neon",
        created_at: "2025-03-05T10:00:00",
      },
    ],
  }),

  // getters: {
  //   getPublishedNews: (state) => () => {
  //     return state.news.filter((item) => item.isPublished);
  //   },
  // },
});
