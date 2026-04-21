import { defineStore } from "pinia";

export const usePartnerStore = defineStore("partners", {
  state: () => ({
    partnerCategories: [
      {
        category: "Organized by",
        noContainer: true,
        directory: "/img/credits/organized-by/",
        list: [
          { img: "panorama-media.svg", link: "https://panoramamedia.co.id" },
        ],
      },

      {
        category: "In conjunction with",
        directory: "/img/credits/etc/",
        list: [
          {
            img: "flei.svg",
          },
          // {
          //   img: "cbe.svg",
          // },
          {
            img: "morefood.svg",
          },
        ],
      },

      {
        category: "In association with",
        directory: "/img/credits/in-association-with/",
        list: [
          { img: "acbi.png" },
          { img: "aistea.png" },
          { img: "gapmmi.png" },
          { img: "isa.png" },
          // { img: "scai.png" },
        ],
      },
      {
        category: "Endorsed by",
        directory: "/img/credits/endorsed-by/",
        list: [
          { img: "ekraf.svg", isVector: true },
          // { img: "kemenperin.png" }
        ],
      },
      // {
      //   category: "Event Partners",
      //   directory: "/img/credits/etc/",
      //   list: [
      //     { img: "4goodthings.png" },
      //     { img: "BCA-3-2.svg" },
      //     { img: "bca-insurance.png" },
      //     { img: "biznet.png" },
      //     { img: "circleone.png" },
      //     { img: "cityneon.png" },
      //     { img: "daytrans.png" },
      //     { img: "dsv-and-rogers-asia.png" },
      //     { img: "fermenusa.png" },
      //     { img: "fleibisnis.png" },
      //     { img: "gowork.png" },
      //     { img: "gratyo.png" },
      //     { img: "hairnerds.png" },
      //     { img: "hotel-osaka.png" },
      //     { img: "iforte.png" },
      //     { img: "jadiprint.png" },
      //     { img: "kopinako.png" },
      //     { img: "lalamove.png" },
      //     { img: "maxim.png" },
      //     { img: "maximos.png" },
      //     { img: "nice.png" },
      //     { img: "nogula.png" },
      //     { img: "oakwood.png" },
      //     { img: "pieoneer.png" },
      //     { img: "plenty-see-u-suparma.png" },
      //     { img: "rogers-asia.png" },
      //     { img: "sda.png" },
      //     { img: "smart-legal.png" },
      //     { img: "sneakerdept.png" },
      //     { img: "the1o1.png" },
      //     { img: "tzu-chi-hospital.png" },
      //     { img: "undangin.png" },
      //   ],
      // },

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
        category: "Official Internet Partner",
        directory: "/img/credits/etc/",
        list: [
          {
            img: "iforte.png",
          },
        ],
      },

      {
        category: "Official Logistic Partner",
        directory: "/img/credits/etc/",
        list: [
          {
            img: "jne.png",
          },
        ],
      },

      {
        category: "Official Sustainability Partner",
        directory: "/img/credits/etc/",
        list: [{ img: "4goodthings.png" }],
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
        category: "Official Audiovisual Partner",
        directory: "/img/credits/etc/",
        list: [
          {
            img: "sda.png",
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
        category: "Official Contractor",
        directory: "/img/credits/etc/",
        list: [
          {
            img: "cityneon.png",
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
        category: "Brand Partners",
        directory: "/img/credits/etc/",
        list: [
          {
            img: "bca-insurance.png",
          },
          {
            img: "ubox.png",
          },
        ],
      },

      {
        category: "Media Partners",
        directory: "/img/credits/media-partners/",
        list: [
          {
            img: "gastronusa.png",
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
            img: "liputan6.png",
          },
          {
            img: "mra.png",
          },
          {
            img: "tempo.png",
          },
          {
            img: "media-indonesia.png",
          },
          {
            img: "kontan.png",
          },
          {
            img: "iswara.png",
          },
          {
            img: "katadata.png",
          },
          {
            img: "the-rockin-life.png",
          },
          {
            img: "hype-event.png",
          },
          {
            img: "jakarta-story.png",
          },
          {
            img: "dunia-mice.png",
          },
          {
            img: "katalog-promosi.png",
          },
          {
            img: "sisi.png",
          },
          {
            img: "whats-new-indonesia.png",
          },
          {
            img: "eventfest.png",
          },
          {
            img: "event-guide.png",
          },
          {
            img: "indonetwork.png",
          },
          {
            img: "indotrading.png",
          },
          {
            img: "gpriority.png",
          },
          {
            img: "infobrand.png",
          },
          {
            img: "geti-media.png",
          },
          {
            img: "info-umkm.png",
          },
          {
            img: "the-phrase.png",
          },
          {
            img: "soul-of-jakarta.png",
          },
          {
            img: "kreen.png",
          },
          {
            img: "urbanvibes.png",
          },
          {
            img: "jejakini.png",
          },
          {
            img: "media-event.png",
          },
          {
            img: "wartausaha.png",
          },
          {
            img: "info-musik-kita.png",
          },
          {
            img: "holopiscom.png",
          },
          {
            img: "bisnis-market.png",
          },
          {
            img: "gac-media.png",
          },

          /// ###

          // {
          //   img: "waralabaku.png",
          // },

          // {
          //   img: "gac-media.png",
          // },

          // {
          //   img: "waralabakan.png",
          // },
          // {
          //   img: "b-universe.png",
          // },
          // {
          //   img: "b-tv.png",
          // },
          // {
          //   img: "b-universe.png",
          // },
          // {
          //   img: "berita-satu.png",
          // },
          // {
          //   img: "investor-daily-indonesia.png",
          // },
          // {
          //   img: "jakarta-globe.png",
          // },
        ],
      },
    ],
  }),
});
