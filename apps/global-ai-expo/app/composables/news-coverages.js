import { defineStore } from "pinia";

export const useNewsCoveragesStore = defineStore("newsCoverages", {
  state: () => ({
    list: [
      {
        title:
          "Global AI Expo 2026 to bring 100+ AI startups and a USD 100K prize pool to Jakarta",
        link: "https://techcrunch.com/2025/12/15/global-ai-expo-2026-jakarta-startups-prize-pool/",
        isPublished: true,
        created_at: "2025-12-15T10:00:00",
      },
      {
        title:
          "Inside Global AI Expo 2026: four conference tracks, sixty sessions, one roof",
        link: "https://www.theverge.com/2026/01/22/global-ai-expo-2026-conference-tracks-sentul-city",
        isPublished: true,
        created_at: "2026-01-22T09:30:00",
      },
      {
        title:
          "Indonesia targets 30+ countries for first Global AI Expo at Sentul City",
        link: "https://www.reuters.com/technology/indonesia-targets-30-countries-first-global-ai-expo-sentul-city-2026-02-04/",
        isPublished: true,
        created_at: "2026-02-04T14:15:00",
      },
      {
        title:
          "Global AI Expo 2026 siap digelar di Sentul City pada November",
        link: "https://www.antaranews.com/berita/5388112/global-ai-expo-2026-siap-digelar-di-sentul-city-pada-november",
        isPublished: true,
        created_at: "2025-12-09T08:45:00",
      },
      {
        title:
          "Global AI Expo 2026 dorong adopsi AI di sektor enterprise dan kesehatan",
        link: "https://tekno.kompas.com/read/2026/01/14/global-ai-expo-2026-dorong-adopsi-ai-enterprise-kesehatan",
        isPublished: true,
        created_at: "2026-01-14T11:20:00",
      },
      {
        title:
          "Pameran AI berskala internasional pertama di Indonesia hadir 20-22 November 2026",
        link: "https://www.liputan6.com/tekno/read/6312587/pameran-ai-berskala-internasional-pertama-di-indonesia-hadir-20-22-november-2026",
        isPublished: true,
        created_at: "2025-12-19T13:00:00",
      },
      {
        title:
          "100 startup AI siap unjuk gigi di Global AI Expo 2026, total hadiah USD 100 ribu",
        link: "https://www.cnbcindonesia.com/tech/20260208104530-37-512903/100-startup-ai-siap-unjuk-gigi-di-global-ai-expo-2026-hadiah-usd-100-ribu",
        isPublished: true,
        created_at: "2026-02-08T10:45:00",
      },
      {
        title:
          "Global AI Expo 2026 targetkan 50 ribu pengunjung dari 30 negara",
        link: "https://inet.detik.com/cyberlife/d-7892341/global-ai-expo-2026-targetkan-50-ribu-pengunjung-dari-30-negara",
        isPublished: true,
        created_at: "2026-02-26T15:10:00",
      },
      {
        title:
          "Sentul City jadi tuan rumah Global AI Expo 2026, hadirkan business matching lintas industri",
        link: "https://www.republika.co.id/berita/t91k2x778/sentul-city-jadi-tuan-rumah-global-ai-expo-2026-business-matching-lintas-industri",
        isPublished: true,
        created_at: "2026-03-04T09:00:00",
      },
      {
        title:
          "Global AI Expo 2026 unveils robotics, healthcare AI, and policy tracks",
        link: "https://venturebeat.com/ai/global-ai-expo-2026-unveils-robotics-healthcare-ai-policy-tracks/",
        isPublished: true,
        created_at: "2026-03-12T16:40:00",
      },
      {
        title: "2026年全球人工智能博览会将于11月在印尼茂物举行",
        link: "https://huanqiuribao.com/?p=21458",
        isPublished: true,
        created_at: "2025-12-22T10:00:00",
      },
    ],
  }),

  getters: {
    getPublishedNews: (state) => () => {
      return state.list.filter((item) => item.isPublished);
    },
  },
});
