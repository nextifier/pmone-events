import { defineStore } from "pinia";

export const usePartnerStore = defineStore("partners", {
  state: () => ({
    partnerCategories: [
      {
        category: "Organized by",
        noContainer: true,
        directory: "/img/credits/organized-by/",
        list: [
          {
            img: "panorama-media.svg",
            link: "https://panoramamedia.co.id",
          },
        ],
      },
      {
        category: "Supported by",
        directory: "/img/credits/supported-by/",
        list: [
          {
            img: "wali.png",
          },
          {
            img: "kadin.png",
          },
        ],
      },
      {
        category: "Franchise Consultant",
        directory: "/img/credits/supported-by/",
        list: [
          {
            img: "fai.png",
            link: "",
          },
        ],
      },
    ],
  }),
});
