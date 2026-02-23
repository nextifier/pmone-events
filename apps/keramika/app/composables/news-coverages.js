import { defineStore } from "pinia";

export const useNewsCoveragesStore = defineStore("newsCoverages", {
  state: () => ({
    list: [
      {
        title: "Daya Saing Keramik Nasional Kian Menguat di Pasar Dunia",
        link: "https://www.detik.com/properti/berita/d-8231653/daya-saing-keramik-nasional-kian-menguat-di-pasar-dunia",
        created_at: "2025-11-27T10:00:00",
      },
      {
        title: "Keramika Indonesia 2026 Resmi Diluncurkan",
        link: "https://mediaindonesia.com/humaniora/834580/keramika-indonesia-2026-resmi-diluncurkan",
        created_at: "2025-11-27T10:00:00",
      },
      {
        title: "Pameran Keramika Indonesia 2026 Hadir NICE PIK2",
        link: "https://www.jpnn.com/news/pameran-keramika-indonesia-2026-hadir-nice-pik2",
        created_at: "2025-11-27T10:00:00",
      },
      {
        title:
          "Pameran Industri Keramik Regional akan Digelar Tahun Depan di NICE PIK 2",
        link: "https://www.jawapos.com/jabodetabek/016887781/pameran-industri-keramik-regional-akan-digelar-tahun-depan-di-nice-pik-2",
        created_at: "2025-11-27T10:00:00",
      },
      {
        title: "Pameran Keramik 2026 Bakal Digelar di Jakarta",
        link: "https://www.medcom.id/properti/news-properti/Gbm0RPPN-pameran-keramik-2026-bakal-digelar-di-jakarta",
        created_at: "2025-11-27T10:00:00",
      },
      {
        title:
          "Industri Keramik Kian Menguat, Pameran KERAMIKA Indonesia Siap Digelar Tahun Depan",
        link: "https://industri.kontan.co.id/news/industri-keramik-kian-menguat-pameran-keramika-indonesia-siap-digelar-tahun-depan",
        created_at: "2025-11-28T10:00:00",
      },
      {
        title:
          "Ekspor Terus Menggeliat, Ini Strategi ASAKI Genjot Industri Keramik Nasional",
        link: "https://www.tribunnews.com/bisnis/7760841/ekspor-terus-menggeliat-ini-strategi-asaki-genjot-industri-keramik-nasional",
        created_at: "2025-11-29T10:00:00",
      },
      {
        title: "2026年KERAMIKA Indonesia展览会 成为东盟陶瓷业务战略交汇点",
        link: "https://www.shangbaoindonesia.com/read/2025/11/28/economy-1764343634",
        created_at: "2025-11-28T10:00:00",
      },
      {
        title:
          "Keramika Indonesia Siap Jadi Titik Temu Strategis Bisnis Keramik di ASEAN",
        link: "https://swa.co.id/read/466703/keramika-indonesia-siap-jadi-titik-temu-strategis-bisnis-keramik-di-asean",
        created_at: "2025-11-29T10:00:00",
      },
      {
        title: "Industri Keramik RI Bidik Momentum Ekspansi Regional",
        link: "https://money.kompas.com/read/2025/12/01/121845526/industri-keramik-ri-bidik-momentum-ekspansi-regional",
        created_at: "2025-12-01T10:00:00",
      },
      {
        title: "2026年6月印尼陶瓷展览会 将在NICE PIK 2举办",
        link: "https://huanqiuribao.com/?p=17687",
        created_at: "2025-11-27T10:00:00",
      },
    ],
  }),

  getters: {
    getPublishedNews: (state) => () => {
      return state.list.filter((item) => item.isPublished);
    },
  },
});
