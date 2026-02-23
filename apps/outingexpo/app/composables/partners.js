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
        category: "Association Partners",
        directory: "/img/credits/2025/",
        list: [
          {
            img: "AELI.png",
          },
          {
            img: "PUTRI.png",
          },
          {
            img: "ivendo.png",
          },
        ],
      },

      {
        category: "Strategic HR Partner",
        directory: "/img/credits/2025/",
        list: [
          {
            img: "jobstreet.png",
          },
        ],
      },

      {
        category: "Official Hotel Partner",
        directory: "/img/credits/2025/",
        list: [
          {
            img: "best-western-senayan.png",
          },
          // {
          //   img: "phmhotels.png",
          // },
        ],
      },

      {
        category: "CSR Partners",
        directory: "/img/credits/2025/",
        list: [
          {
            img: "bumi-journey.png",
          },
          {
            img: "kertabumi.png",
          },
          {
            img: "atourin.png",
          },
        ],
      },

      {
        category: "Creative Activation Partners",
        directory: "/img/credits/2025/",
        list: [
          {
            img: "rumah-batik-palbatu.png",
          },
          {
            img: "lit-house.png",
          },
          {
            img: "arei.png",
          },
        ],
      },

      {
        category: "Official Photobooth Partner",
        directory: "/img/credits/2025/",
        list: [
          {
            img: "holograil.png",
          },
        ],
      },

      {
        category: "Official Drink Partner",
        directory: "/img/credits/2025/",
        list: [
          {
            img: "cleo.png",
          },
        ],
      },

      {
        category: "Official Sustainability Partner",
        directory: "/img/credits/2025/",
        list: [
          {
            img: "4goodthings.png",
          },
        ],
      },

      {
        category: "Official Ticketing Partner",
        directory: "/img/credits/2025/",
        list: [
          {
            img: "undangin.png",
          },
        ],
      },

      {
        category: "Official Internet Partner",
        directory: "/img/credits/2025/",
        list: [
          {
            img: "biznet.png",
          },
        ],
      },

      {
        category: "Official Contractor",
        directory: "/img/credits/2025/",
        list: [
          {
            img: "cityneon.png",
          },
        ],
      },

      {
        category: "Official Audio & Visual",
        directory: "/img/credits/2025/",
        list: [
          {
            img: "sda.png",
          },
        ],
      },

      {
        category: "Official Brand Partners",
        directory: "/img/credits/2025/",
        list: [
          {
            img: "superpark.png",
          },
          {
            img: "chef-vincenzo.png",
          },
          {
            img: "beanbagjkt.png",
          },
          {
            img: "kopi-gans.png",
          },
        ],
      },

      {
        category: "Media Partners",
        directory: "/img/credits/media-partners/",
        list: [
          // Tier 1
          {
            img: "cnn.png",
          },
          {
            img: "liputan6.png",
          },
          {
            img: "kompas.id.png",
          },
          {
            img: "kompas.png",
          },
          {
            img: "detik.png",
          },
          {
            img: "tempo.png",
          },
          {
            img: "bisnis.com.png",
          },
          {
            img: "katalog-promosi.png",
          },
          {
            img: "media-indonesia.png",
          },
          {
            img: "kontan.png",
          },

          // Tier 2
          {
            img: "haluan-network.png",
          },
          {
            img: "kuatbaca.png",
          },
          {
            img: "event-jakarta.png",
          },
          {
            img: "unfrmd.png",
          },
          {
            img: "iswara-jakarta.png",
          },
          {
            img: "times-indonesia.png",
          },
          {
            img: "holopiscom.png",
          },
          {
            img: "media-event.png",
          },
          {
            img: "bisnis-indonesia.png",
          },
          {
            img: "kreen.png",
          },
          {
            img: "soul-of-jakarta.png",
          },
          {
            img: "talenta.png",
          },

          // Tier 3
          {
            img: "bisnis-market.png",
          },
          {
            img: "dunia-mice.png",
          },
          {
            img: "hifella.png",
          },
          {
            img: "indopos.png",
          },
          {
            img: "infotren.png",
          },
          {
            img: "jkt-news.png",
          },
          {
            img: "kbr-media.png",
          },
          {
            img: "eventguide.png",
          },
          {
            img: "eventfest.png",
          },
          {
            img: "hangout.png",
          },
          {
            img: "my-trip.png",
          },
          {
            img: "nusantara-info.png",
          },
          {
            img: "radio-untar.png",
          },
          {
            img: "sisi.png",
          },
          {
            img: "travelexplore.png",
          },
          {
            img: "infobrand.png",
          },
          {
            img: "mra.png",
          },
          {
            img: "pvk-group.png",
          },
          {
            img: "the-phrase.png",
          },
          {
            img: "urban-vibes.png",
          },
          {
            img: "wartausaha.png",
          },
          // {
          //   img: "ecohomes.png",
          // },
          {
            img: "sosok-bisnis.png",
          },

          // ######## ######## ######## ######## ######## ######## ######## ######## ######## ########
          // {
          //   img: "merdeka.png",
          // },
          // {
          //   img: "marketeers.png",
          // },
          // {
          //   img: "whats-new-indonesia.png",
          // },

          // {
          //   img: "inews.png",
          // },
          // {
          //   img: "v-radio.png",
          // },
          // {
          //   img: "okezone.png",
          // },
          // {
          //   img: "mnc-trijaya.png",
          // },
          // {
          //   img: "bisnis-indonesia.png",
          // },
          // {
          //   img: "bisnis-muda.png",
          // },
          // {
          //   img: "bisnis.com.png",
          // },

          // {
          //   img: "detik-finance.png",
          // },

          // {
          //   img: "indonetwork.png",
          // },
          // {
          //   img: "info-umkm.png",
          // },
          // {
          //   img: "obsession-news.png",
          // },
          // {
          //   img: "mens-obsession.png",
          // },

          // {
          //   img: "womens-obsession.png",
          // },
          // {
          //   img: "waralabaku.png",
          // },
          // {
          //   img: "franchise-global.png",
          // },

          // {
          //   img: "inilah.png",
          // },
          // {
          //   img: "oppal.png",
          // },
          // {
          //   img: "jejakini.png",
          // },

          // {
          //   img: "higo.png",
          // },

          // {
          //   img: "indotrading.png",
          // },

          // {
          //   img: "gpriority.png",
          // },
          // {
          //   img: "beranda.png",
          // },

          // {
          //   img: "binus-tv.png",
          // },
          // {
          //   img: "tfr-media.png",
          // },

          // {
          //   img: "berita-unggulan.png",
          // },
          // {
          //   img: "a-radio.png",
          // },
          // {
          //   img: "info-filantropi.png",
          // },

          // {
          //   img: "hypeabis.png",
          // },
          // {
          //   img: "rtc-ui-fm.png",
          // },

          // {
          //   img: "katadata.png",
          // },
          // {
          //   img: "gac-media.png",
          // },

          // {
          //   img: "idn-times.png",
          // },
          // {
          //   img: "yummy.png",
          // },
        ],
      },
    ],
  }),
});
