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

      // {
      //   category: "Co-organized by",
      //   directory: "/img/credits/association-partners/",
      //   list: [
      //     {
      //       img: "asaki.png",
      //       link: "https://asaki.or.id/",
      //     },
      //   ],
      // },

      {
        category: "Supported by",
        directory: "/img/credits/endorsed-by/",
        list: [
          {
            img: "kemenperin.png",
          },
          {
            img: "kemenpu.png",
          },
          {
            img: "ekraf.svg",
            link: "https://ekraf.go.id/",
          },
          {
            img: "balai-besar-keramik.png",
          },
          // {
          //   img: "wonderful-indonesia.png",
          //   link: "",
          // },
        ],
      },

      {
        category: "Event Partner",
        directory: "/img/credits/etc/",
        list: [
          {
            img: "foshan-uniceramics-expo.png",
            link: "",
          },
        ],
      },

      {
        category: "Association Partners",
        directory: "/img/credits/association-partners/",
        list: [
          {
            img: "asaki.png",
            link: "https://asaki.or.id/",
          },
          {
            img: "hdii.png",
            link: "https://hdii.or.id/",
          },
          {
            img: "iai-jakarta.png",
            link: "https://iai.or.id/",
          },
          {
            img: "iai-banten.png",
            link: "https://iai.or.id/",
          },
          {
            img: "rei.png",
            link: "https://rei.or.id/",
          },
          {
            img: "gapensi.png",
          },
          {
            img: "synergy.png",
            link: "https://www.synergyhub.id/",
          },
          {
            img: "synergy-developer-indonesia.png",
            link: "https://www.synergydeveloperindonesia.com/",
          },
          {
            img: "hdmi.png",
            link: "https://hdmi.or.id/",
          },
          {
            img: "iqsi.png",
            link: "https://www.iqsi.org/",
          },
          {
            img: "aperlindo.png",
            link: "https://aperlindonesia.wordpress.com/",
          },
          {
            img: "perkindo.png",
            link: "https://perkindo.org/",
          },
          {
            img: "bcmea.svg",
          },
          {
            img: "gbci.png",
            link: "https://gbcindonesia.org/",
          },
          {
            img: "kidi.png",
            link: "https://kidi.or.id/",
          },
          {
            img: "iali.png",
            link: "",
          },
          {
            img: "aki.png",
            link: "https://aki.or.id/",
          },

          // {
          //   img: "ipbbi.png",
          //   link: "https://ipbbi.id/",
          // },

          // {
          //   img: "htii.png",
          //   link: "https://htii.or.id/",
          // },
          // {
          //   img: "aiskindo.png",
          //   link: "",
          // },
          // {
          //   img: "asaki.png",
          //   link: "https://asaki.or.id/",
          // },

          // {
          //   img: "inkindo.png",
          //   link: "https://www.inkindo.org/",
          // },
          // {
          //   img: "aptiknas.png",
          //   link: "https://www.aptiknas.id/",
          // },
          // {
          //   img: "lcii.png",
          //   link: "https://leanconstructionindonesia.com/",
          // },
          // {
          //   img: "gpci.png",
          //   link: "https://gpci.or.id/",
          // },
          // {
          //   img: "hippi.png",
          //   link: "https://www.hippi.or.id/",
          // },
        ],
      },
      // {
      //   category: "Green Haven Sponsors",
      //   directory: "/img/credits/green-haven-sponsors/",
      //   list: [
      //     {
      //       img: "bardi.png",
      //       link: "",
      //     },
      //     {
      //       img: "duma.png",
      //       link: "",
      //     },
      //     {
      //       img: "onda.png",
      //       link: "",
      //     },
      //     {
      //       img: "pureve.png",
      //       link: "",
      //     },
      //     {
      //       img: "dekkson.png",
      //       link: "",
      //     },
      //   ],
      // },
      // {
      //   category: "Retail Sponsor",
      //   fullWidth: true,
      //   directory: "/img/credits/etc/",
      //   list: [
      //     {
      //       img: "germany-brilliant.png",
      //       link: "",
      //     },
      //   ],
      // },

      {
        category: "Strategic Partners",
        directory: "/img/credits/etc/",
        list: [
          {
            img: "f-widayanto.png",
          },
          {
            img: "indonesia-design.png",
            link: "",
          },
          {
            img: "pik-tourism-board.png",
          },
          {
            img: "tender-indonesia.png",
          },

          // {
          //   img: "synergy.png",
          //   link: "https://www.synergyhub.id/",
          // },
          // {
          //   img: "synergy-developer-indonesia.png",
          //   link: "https://www.synergydeveloperindonesia.com/",
          // },
          // {
          //   img: "hiraka.png",
          //   link: "https://www.hiraka.id/",
          // },
          // {
          //   img: "viruma.png",
          //   link: "https://www.viruma.id/",
          // },
          // {
          //   img: "mitrapabrik.png",
          //   link: "https://mitrapabrik.com/",
          // },
          // {
          //   img: "undangin.png",
          //   link: "https://www.undangin.com/",
          // },
          // {
          //   img: "chop-value.png",
          //   link: "",
          // },
          // {
          //   img: "bamboo-pure.png",
          //   link: "",
          // },
          // {
          //   img: "rukita.png",
          //   link: "",
          // },
          // {
          //   img: "suka.png",
          //   link: "",
          // },
          // {
          //   img: "kopinako-daurbaur.png",
          //   link: "",
          // },
        ],
      },

      // {
      //   category: "Community Partners",
      //   fullWidth: true,
      //   directory: "/img/credits/community-partners/",
      //   list: [
      //     {
      //       img: "archilantis.png",
      //       link: "https://archilantis.com/",
      //     },
      //     {
      //       img: "koloni.png",
      //       link: "https://www.instagram.com/koloniarsitektur/",
      //     },
      //     {
      //       img: "ilumarta.png",
      //       link: "",
      //     },
      //     {
      //       img: "connext.png",
      //       link: "",
      //     },
      //   ],
      // },
      // {
      //   category: "Official Technology Partner",
      //   directory: "/img/credits/etc/",
      //   list: [
      //     {
      //       img: "v2.png",
      //       link: "",
      //     },
      //   ],
      // },
      {
        category: "Official Hotel Partner",
        directory: "/img/credits/etc/",
        list: [
          {
            img: "the1o1.png",
          },
          {
            img: "hotel-osaka.png",
          },
          {
            img: "swissotel-jakarta.png",
          },
          {
            img: "hotel-golden-tulip-essential.png",
          },
        ],
      },
      {
        category: "Official Logistic Partner",
        directory: "/img/credits/etc/",
        list: [
          {
            img: "lalamove.png",
            link: "",
          },
        ],
      },
      {
        category: "Official Transportation Partner",
        directory: "/img/credits/etc/",
        list: [
          {
            img: "grab.png",
            link: "",
          },
        ],
      },
      {
        category: "Official Hydration Partner",
        directory: "/img/credits/etc/",
        list: [
          {
            img: "cleo.png",
            link: "",
          },
        ],
      },
      {
        category: "Official Ticketing Partner",
        directory: "/img/credits/etc/",
        list: [
          {
            img: "undangin.png",
            link: "",
          },
        ],
      },
      // {
      //   category: "Official Internet Partner",
      //   directory: "/img/credits/etc/",
      //   list: [
      //     {
      //       img: "biznet.png",
      //       link: "",
      //     },
      //   ],
      // },
      // {
      //   category: "Official Furniture Partner",
      //   directory: "/img/credits/etc/",
      //   list: [
      //     {
      //       img: "furnisia.png",
      //       link: "",
      //     },
      //   ],
      // },
      // {
      //   category: "Sound System Partner",
      //   directory: "/img/credits/etc/",
      //   list: [
      //     {
      //       img: "jbl-pro.png",
      //       link: "",
      //     },
      //   ],
      // },
      {
        category: "Official Contractor Partner",
        directory: "/img/credits/etc/",
        list: [
          {
            img: "cityneon.png",
            link: "",
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
      // {
      //   category: "Official Medical Partner",
      //   directory: "/img/credits/etc/",
      //   list: [
      //     {
      //       img: "mandaya-royal-hospital.png",
      //       link: "",
      //     },
      //   ],
      // },
      // {
      //   category: "Official Multimedia Partner",
      //   directory: "/img/credits/etc/",
      //   list: [
      //     {
      //       img: "sda.png",
      //       link: "",
      //     },
      //   ],
      // },
      {
        category: "Media Partners",
        directory: "/img/credits/media-partners/",
        list: [
          {
            img: "seab.png",
            link: "https://seab.tradelinkmedia.biz/",
          },
          {
            img: "indonesia-design.png",
            link: "",
          },
          {
            img: "archibuild.png",
            link: "",
          },
          {
            img: "belirumah.png",
            link: "https://belirumah.co/",
          },
          {
            img: "bisnis-indonesia.png",
            link: "",
          },
          {
            img: "bisnis-muda.png",
            link: "",
          },
          {
            img: "bisnis.com.png",
            link: "https://bisnis.com",
          },
          {
            img: "ceramic-focus.png",
            link: "https://ceramicfocus.com/",
          },
          {
            img: "ceramic-bangladesh-magazine.png",
            link: "",
          },
          {
            img: "gac-media.png",
            link: "",
          },
          {
            img: "globy.png",
            link: "",
          },
          {
            img: "jakarta-story.png",
            link: "",
          },
          {
            img: "koloni-arsitektur.png",
            link: "https://www.instagram.com/koloniarsitektur/",
          },
          {
            img: "bang-mat.png",
            link: "https://www.bangmat.id/",
          },
          {
            img: "eventguide.png",
            link: "",
          },
          {
            img: "holopis.png",
            link: "https://holopis.com/",
          },
          {
            img: "indotrading.png",
            link: "https://www.indotrading.com/",
          },
          {
            img: "jejakini.png",
            link: "",
          },
          {
            img: "katadata.png",
            link: "https://katadata.co.id/",
          },
          {
            img: "konstruksi-media.png",
            link: "https://konstruksimedia.com/",
          },
          {
            img: "media-event.png",
            link: "",
          },
          {
            img: "property-and-the-city.png",
            link: "https://propertyandthecity.com/",
          },
          {
            img: "sisi.png",
            link: "",
          },
          {
            img: "thephrase.png",
            link: "https://thephrase.id/",
          },
          {
            img: "infobrand.png",
            link: "",
          },
          {
            img: "property-bank.png",
            link: "https://www.propertynbank.com/",
          },
          {
            img: "rentfix.png",
            link: "https://rentfix.com/",
          },
          {
            img: "soul-of-jakarta.png",
            link: "https://www.soulofjakarta.id/",
          },
          {
            img: "urbanvibes.png",
            link: "https://urbanvibes.id/",
          },
          {
            img: "wartausaha.png",
            link: "",
          },
          {
            img: "whats-new-indonesia.png",
            link: "https://whatsnewindonesia.com/",
          },
          {
            img: "bathroom-kitchen.png",
            link: "",
          },
          {
            img: "lighting-today.png",
            link: "",
          },
          {
            img: "dsign-something.png",
            link: "",
          },
          {
            img: "ceramics-vietnam.png",
            link: "",
          },
          {
            img: "inarcons.png",
            link: "",
          },
          {
            img: "arsifista.png",
            link: "",
          },
          {
            img: "tender-indonesia.png",
            link: "https://www.tender-indonesia.com/tender_home/",
          },
          {
            img: "hubexo.png",
          },
          {
            img: "homepoint.png",
          },
          {
            img: "info-sayembara.png",
          },
          {
            img: "cts-network-new.png",
          },
          {
            img: "nirsekala.png",
          },
          {
            img: "arswow.png",
          },
          {
            img: "bisnis-market.png",
          },
          {
            img: "indonetwork.png",
            link: "https://en.indonetwork.co.id/",
          },
          {
            img: "katalog-promosi.png",
            link: "",
          },
          {
            img: "ecohomes.png",
            link: "https://ecohomes.id/",
          },

          // {
          //   img: "archify.png",
          //   link: "https://www.archify.com/",
          // },
          // {
          //   img: "archinesia.png",
          //   link: "https://archinesia.com/",
          // },
          // {
          //   img: "bci-central.png",
          //   link: "https://www.bcicentral.com/id/",
          // },

          // {
          //   img: "detik.png",
          //   link: "https://detik.com/",
          // },

          // {
          //   img: "asrinesia.png",
          //   link: "https://asrinesia.com/",
          // },

          // {
          //   img: "inclover.png",
          //   link: "https://inclovermag.com/",
          // },
          // {
          //   img: "cts-network.png",
          //   link: "https://www.ctsnetwork.id/",
          // },

          // {
          //   img: "arsimedia.png",
          //   link: "",
          // },
          // {
          //   img: "eventfest.png",
          //   link: "https://eventfestid.com/",
          // },
          // {
          //   img: "homepoint.png",
          //   link: "https://homepoint.id/",
          // },

          // {
          //   img: "catalog-pro.png",
          //   link: "",
          // },
          // {
          //   img: "geti-media.png",
          //   link: "",
          // },
          // {
          //   img: "times-indonesia.png",
          //   link: "",
          // },
          // {
          //   img: "venue.png",
          //   link: "",
          // },
          // {
          //   img: "detik-property.png",
          //   link: "",
          // },
          // {
          //   img: "haluan-network.png",
          //   link: "",
          // },

          // {
          //   img: "koloni-arsitektur.png",
          //   link: "",
          // },
          // {
          //   img: "kompas.png",
          //   link: "",
          // },
          // {
          //   img: "narasi.png",
          //   link: "",
          // },
          // {
          //   img: "nusantara-info.png",
          //   link: "",
          // },
          // {
          //   img: "viva.png",
          //   link: "",
          // },

          // {
          //   img: "proporsio.png",
          //   link: "",
          // },
          // {
          //   img: "radio-untar.png",
          //   link: "https://streaming.radiountar.com/",
          // },
          // {
          //   img: "tempo.png",
          //   link: "",
          // },

          // {
          //   img: "properti1.png",
          // },
          // {
          //   img: "dunia-mice.png",
          // },

          // {
          //   img: "industri-konstruksi.png",
          // },
          // {
          //   img: "unfrmd.png",
          // },

          // {
          //   img: "seab.png",
          //   link: "https://seab.tradelinkmedia.biz/",
          // },

          // {
          //   img: "casa.png",
          //   link: "https://www.mra.co.id/alacasa.html",
          // },
          // {
          //   img: "liputan6.png",
          //   link: "https://www.liputan6.com/",
          // },
          // {
          //   img: "katadata-green.png",
          //   link: "https://green.katadata.co.id/",
          // },
          // {
          //   img: "eventbanget.png",
          //   link: "https://eventbanget.com/",
          // },
          // {
          //   img: "inilah.png",
          //   link: "https://www.inilah.com/",
          // },
          // {
          //   img: "women-obsession.png",
          //   link: "https://www.womensobsession.com/",
          // },
          // {
          //   img: "mens-obsession.png",
          //   link: "https://www.mensobsession.com/",
          // },
          // {
          //   img: "archibuild.png",
          //   link: "",
          // },
          // {
          //   img: "ican.png",
          //   link: "https://www.arsitektur.asia/",
          // },
          // {
          //   img: "ican-media.png",
          //   link: "",
          // },
          // {
          //   img: "jakarta-journey.png",
          //   link: "https://www.instagram.com/jakartajourney.media/",
          // },
          // {
          //   img: "intra.png",
          //   link: "https://majalahintra.com/",
          // },
          // {
          //   img: "media-indonesia.png",
          //   link: "https://mediaindonesia.com/",
          // },
          // {
          //   img: "sakawarta.png",
          //   link: "https://sakawarta.com/",
          // },
          // {
          //   img: "komunitas-narasi.png",
          //   link: "",
          // },
          // {
          //   img: "inarcons.png",
          //   link: "",
          // },
          // {
          //   img: "inspirasi-rumah-idaman.png",
          //   link: "",
          // },
        ],
      },
    ],
  }),
});
