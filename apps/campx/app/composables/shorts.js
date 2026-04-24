import { defineStore } from "pinia";

// Helper function untuk mengekstrak ID dari berbagai format URL YouTube
const getYoutubeId = (url) => {
  // Regex ini akan cocok dengan ID video dari format:
  // - youtube.com/watch?v=VIDEO_ID
  // - youtu.be/VIDEO_ID
  // - youtube.com/shorts/VIDEO_ID
  // - youtube.com/embed/VIDEO_ID
  // - googleusercontent.com/youtube.com/VIDEO_ID (jika ada)
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|shorts\/|googleusercontent\.com\/youtube\.com\/)([^"&?\/ ]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export const useShortStore = defineStore("shorts", {
  state: () => {
    const rawList = [
      {
        url: "https://youtube.com/shorts/pIjq5-8OHfY?feature=share",
        caption: "CampX Jatiluhur #1",
        thumb: "",
      },
      {
        url: "https://youtube.com/shorts/sYesvEAd4g8?feature=share",
        caption: "Akses ke CampX dari Jakarta Naik Transum",
        thumb: "",
      },
      {
        url: "https://youtube.com/shorts/hUA6FOwgLX0?feature=share",
        caption: "CampX Jatiluhur #2",
        thumb: "",
      },
      {
        url: "https://youtube.com/shorts/QZizaimuADY?feature=share",
        caption: "Outing Kantor di CampX",
        thumb: "",
      },
      {
        url: "https://youtube.com/shorts/EIpa2t3FM_4?feature=share",
        caption: "CampX Jatiluhur #3",
        thumb: "",
      },
      {
        url: "https://youtube.com/shorts/4oCypfM0AFk?feature=share",
        caption: "Jalan ke CampX Jatiluhur Naik Mobil Pribadi",
        thumb: "",
      },
      {
        url: "https://youtube.com/shorts/CxZPqb_sPSM?feature=share",
        caption: "Fasilitas CampX Jatiluhur Part 1",
        thumb: "",
      },
      {
        url: "https://youtube.com/shorts/e4_A6TSHa00?feature=share",
        caption: "Fasilitas CampX Jatiluhur Part 2",
        thumb: "",
      },
      {
        url: "https://youtube.com/shorts/cnm5qZksENM?feature=share",
        caption: "CampX Jatiluhur #4",
        thumb: "",
      },
      {
        url: "https://youtube.com/shorts/Z4nYMvZpYHA?feature=share",
        caption: "Apa kata travelers tentang CampX Jatiluhur",
        thumb: "",
      },
      {
        url: "https://youtube.com/shorts/Z0Vw06yg1kY?feature=share",
        caption: "What to Expect at CampX Jatiluhur",
        thumb: "",
      },
      {
        url: "https://youtube.com/shorts/_D1jzFrnTpY?feature=share",
        caption: "Company Outing di CampX, Mendaki Tebing Boyer",
        thumb: "",
      },
      {
        url: "https://youtube.com/shorts/pj-5y-4Z9Tc?feature=share",
        caption: "Camping di Cabin X: Staycation Level Up!",
        thumb: "",
      },
    ];

    const processedList = rawList
      .map((item) => {
        const videoId = getYoutubeId(item.url);
        return {
          ...item,
          videoId: videoId,
          thumbGenerated: videoId
            ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
            : "",
        };
      })
      .reverse();

    return {
      list: processedList,
    };
  },
});
