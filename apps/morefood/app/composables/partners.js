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
      // {
      //   category: "In conjunction with",
      //   noContainer: true,
      //   directory: "/img/credits/organized-by/",
      //   list: [
      //     {
      //       img: "panorama-media.svg",
      //       link: "https://panoramamedia.co.id",
      //     },
      //   ],
      // },

      {
        category: "In conjunction with",
        directory: "/img/credits/etc/",
        list: [
          {
            img: "flei.svg",
          },
          {
            img: "cbe.svg",
          },
          // {
          //   img: "morefood.svg",
          // },
        ],
      },

      {
        category: "Supported by",
        directory: "/img/credits/endorsed-by/",
        list: [
          {
            img: "wonderful-indonesia.svg",
          },
        ],
      },

      {
        category: "Supporting Associations & Communities",
        directory: "/img/credits/associations/",
        list: [
          {
            img: "ali.png",
          },
          {
            img: "hipmi.png",
          },
          {
            img: "ipbbi.png",
          },
          {
            img: "appmbgi.png",
          },
          {
            img: "gapmmi.png",
          },
          {
            img: "gphri.png",
          },
          {
            img: "ipa.png",
          },
          {
            img: "ppji.png",
          },
          {
            img: "brin.png",
          },
          {
            img: "mui.png",
          },
          {
            img: "pdf.png",
          },
        ],
      },

      {
        category: "Official Ticketing Partner",
        directory: "/img/credits/etc/",
        list: [
          {
            img: "undangin.png",
          },
        ],
      },

      {
        category: "Media Partners",
        directory: "/img/credits/media-partners/",
        list: [
          {
            img: "bisnis-indonesia.png",
          },
          {
            img: "bisnis-muda.png",
          },
          {
            img: "bisnis.com.png",
          },
          {
            img: "bisnis-market.png",
          },
          {
            img: "dunia-mice.png",
          },
          {
            img: "gac-media.png",
          },
          {
            img: "jakarta-story.png",
          },
          {
            img: "liputan6.png",
          },
          {
            img: "eventfest.png",
          },
          {
            img: "event-guide.png",
          },
          {
            img: "holopis.png",
          },
          {
            img: "indonetwork.png",
          },
          {
            img: "indotrading.png",
          },
          {
            img: "info-umkm.png",
          },
          {
            img: "katadata.png",
          },
          {
            img: "katalog-promosi.png",
          },
          {
            img: "media-event.png",
          },
          {
            img: "sisi.png",
          },
          {
            img: "the-phrase.png",
          },
          {
            img: "wartausaha.png",
          },
          {
            img: "infobrand.png",
          },
          {
            img: "jejakini.png",
          },
          {
            img: "kreen.png",
          },
          {
            img: "soul-of-jakarta.png",
          },
          {
            img: "urbanvibes.png",
          },
          {
            img: "whats-new-indonesia.png",
          },
        ],
      },
    ],
  }),
});
