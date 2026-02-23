import { defineStore } from "pinia";

export const usePartnerStore = defineStore("partners", {
  state: () => ({
    partnerCategories: [
      {
        category: "Organized by",
        noContainer: true,
        directory: "/img/credits/",
        list: [
          {
            img: "huamo-expo.png",
            link: "https://www.huamogroup.com",
          },
          {
            img: "worldex-china.png",
          },
        ],
      },
      {
        category: "In conjunction with",
        noContainer: true,
        directory: "/img/credits/organized-by/",
        list: [
          {
            img: "panorama-media.svg",
            link: "https://panoramamedia.co.id",
          },
        ],
      },
    ],
  }),
});
