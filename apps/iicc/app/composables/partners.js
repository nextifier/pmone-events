import { defineStore } from "pinia";

export const usePartnerStore = defineStore("partners", {
  state: () => ({
    partnerCategories: [
      {
        category: "Organized by",
        noContainer: true,
        directory: "/img/credits/",
        fullWidth: true,
        list: [
          {
            img: "askindo.svg",
            link: "https://askindo.id",
          },
        ],
      },

      {
        category: "Supporting Partners",
        directory: "/img/credits/",
        list: [
          {
            img: "kementerian-koordinator-bidang-pangan.png",
          },
          {
            img: "kementerian-pertanian.png",
          },
          {
            img: "kementerian-perindustrian.png",
          },
          {
            img: "kementerian-perdagangan.png",
          },
          {
            img: "kementerian-pariwisata.png",
          },
          {
            img: "bpdp.png",
          },
        ],
      },

      {
        category: "Partners",
        directory: "/img/credits/",
        list: [
          {
            img: "icco.png",
          },
          {
            img: "csp.png",
          },
          {
            img: "dekaindo.png",
          },
        ],
      },
    ],
  }),
});
