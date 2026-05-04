import { defineStore } from "pinia";

export const usePartnerStore = defineStore("partners", {
  state: () => ({
    partnerCategories: [
      {
        category: "Organized by",
        // noContainer: true,
        directory: "/img/credits/organized-by/",
        list: [
          {
            img: "global-ai-expo.svg",
            // link: "https://panoramamedia.co.id",
          },
        ],
      },

      {
        category: "Co-organized by",
        // noContainer: true,
        directory: "/img/credits/organized-by/",
        list: [
          {
            img: "panorama-media.svg",
            link: "https://panoramamedia.co.id",
          },
        ],
      },

      {
        category: "Endorsed by",
        directory: "/img/credits/endorsed-by/",
        list: [
          {
            img: "kemendag.png",
          },
          {
            img: "kementerian-umkm.png",
          },
          {
            img: "kemenpar.png",
          },
          {
            img: "wonderful-indonesia.png",
          },
        ],
      },

      {
        category: "Strategic Media Partners",
        directory: "/img/credits/strategic-media/",
        list: [
          {
            img: "asiawide-franchise.png",
          },
          {
            img: "wfa.png",
          },
          {
            img: "infobrand.png",
          },
          {
            img: "franchise-global.png",
          },
          {
            img: "info-opportunity.png",
          },
        ],
      },

      {
        category: "Supporting Associations & Communities",
        directory: "/img/credits/associations/",
        list: [
          {
            img: "hippindo.png",
          },
          {
            img: "apindo.png",
          },
          {
            img: "asli.png",
          },
          {
            img: "tes.png",
          },
          {
            img: "twdc.png",
          },
          {
            img: "femalepreneur.png",
          },
          {
            img: "sahabat-umkm.png",
          },
          {
            img: "tda.png",
          },
          {
            img: "acteavist-indonesia.png",
          },
        ],
      },

      {
        category: "Official Bank Partner",
        directory: "/img/credits/etc/",
        list: [
          {
            img: "BCA-3-2.svg",
          },
        ],
      },

      {
        category: "Official Audiovisual Partner",
        directory: "/img/credits/etc/",
        list: [
          {
            img: "sda.png",
          },
        ],
      },

      {
        category: "Official Freight Forwarders",
        directory: "/img/credits/etc/",
        list: [
          // {
          //   img: "dsv-and-rogers-asia.png",
          //   link: "",
          // },
          {
            img: "maximos.png",
            link: "",
          },
          {
            img: "rogers-asia.png",
            link: "",
          },
        ],
      },

      {
        category: "Official Internet Partner",
        directory: "/img/credits/etc/",
        list: [
          {
            img: "iforte.png",
          },
        ],
      },

      {
        category: "Official Contractor",
        directory: "/img/credits/etc/",
        list: [
          {
            img: "cityneon.png",
          },
        ],
      },

      {
        category: "Co-working Space Partner",
        directory: "/img/credits/etc/",
        list: [
          {
            img: "gowork.png",
          },
        ],
      },

      {
        category: "Official Hotel Partner",
        directory: "/img/credits/etc/",
        list: [
          {
            img: "the1o1.png",
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
        category: "Brand Partners",
        directory: "/img/credits/etc/",
        list: [
          {
            img: "bca-insurance.png",
          },
          {
            img: "smart-legal.png",
          },
        ],
      },

      {
        category: "Media Partners",
        directory: "/img/credits/media-partners/",
        list: [
          {
            img: "eventfest.png",
          },
          {
            img: "hype-event.png",
          },
          {
            img: "info-musik-kita.png",
          },
          {
            img: "gac-media.png",
          },
          {
            img: "waralabaku.png",
          },
          {
            img: "gpriority.png",
          },
          {
            img: "katalog-promosi.png",
          },
          {
            img: "event-guide.png",
          },
          {
            img: "bisnis-indonesia.png",
          },
          {
            img: "bisnis.com.png",
          },
          {
            img: "bisnis-muda.png",
          },
          {
            img: "holopiscom.png",
          },
          {
            img: "jejakini.png",
          },
          {
            img: "media-event.png",
          },
          {
            img: "jakarta-story.png",
          },
          {
            img: "soul-of-jakarta.png",
          },
          {
            img: "gac-media.png",
          },
          {
            img: "wartausaha.png",
          },
          {
            img: "whats-new-indonesia.png",
          },
          {
            img: "infobrand.png",
          },
          {
            img: "info-umkm.png",
          },
          {
            img: "urbanvibes.png",
          },
          {
            img: "indonetwork.png",
          },
          {
            img: "katadata.png",
          },
          {
            img: "sisi.png",
          },
          {
            img: "indotrading.png",
          },
          {
            img: "kreen.png",
          },
          {
            img: "geti-media.png",
          },
          {
            img: "the-phrase.png",
          },
          {
            img: "liputan6.png",
          },
          {
            img: "bisnis-market.png",
          },
          {
            img: "dunia-mice.png",
          },
          {
            img: "waralabakan.png",
          },
          {
            img: "start-franchise.png",
          },
          {
            img: "b-universe.png",
          },
          {
            img: "b-tv.png",
          },
          {
            img: "berita-satu.png",
          },
          {
            img: "berita-satu-com.png",
          },
          {
            img: "investor-daily-indonesia.png",
          },
          {
            img: "investor-id.png",
          },
          {
            img: "jakarta-globe.png",
          },
          {
            img: "tempo.png",
          },
          {
            img: "stapo.png",
          },
        ],
      },
    ],
  }),
});
