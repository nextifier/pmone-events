import { defineStore } from 'pinia'

export const useGuestStore = defineStore("guests", {
  state: () => ({
    list: [
      {
        name: "Azulacan",
        slug: "azulacan",
        photos: ["/img/guests/azulacan.png"],
        categories: ["Cosplayer"],
        appearanceDate: {
          date: "25-26",
          month: "Oct",
        },
        description: ``,
        social: {
          instagram: "azulacann",
        },
        isPublished: true,
        transparentBackground: true,
      },
      {
        name: "Kameaam",
        slug: "kameaam",
        photos: ["/img/guests/kameaam.png"],
        categories: ["Cosplayer"],
        appearanceDate: {
          date: "25-26",
          month: "Oct",
        },
        description: ``,
        social: {
          instagram: "kameaam",
        },
        isPublished: true,
        transparentBackground: true,
      },
      {
        name: "Katto",
        slug: "katto",
        photos: ["/img/guests/katto.png"],
        categories: ["International Cosplayer"],
        appearanceDate: {
          date: "25-26",
          month: "Oct",
        },
        description: ``,
        social: {
          instagram: "katto_cosplay",
        },
        isPublished: true,
        transparentBackground: true,
      },
      {
        name: "Kohi Sekai",
        slug: "kohi-sekai",
        photos: ["/img/guests/kohi-sekai.png"],
        categories: ["Idol Group"],
        appearanceDate: {
          date: "25",
          month: "Oct",
        },
        description: ``,
        social: {
          instagram: "kohisekai",
        },
        isPublished: true,
        transparentBackground: true,
      },
      {
        name: "UPGIRLS",
        slug: "upgirls",
        photos: ["/img/guests/upgirls.png"],
        categories: ["Idol Group"],
        appearanceDate: {
          date: "26",
          month: "Oct",
        },
        description: ``,
        social: {
          instagram: "theupgirls",
        },
        isPublished: true,
        transparentBackground: true,
      },
      {
        name: "Nextanative",
        slug: "nextanative",
        photos: ["/img/guests/nextanative.png"],
        categories: ["Idol Group"],
        appearanceDate: {
          date: "26",
          month: "Oct",
        },
        description: ``,
        social: {
          instagram: "nextanative",
        },
        isPublished: true,
        transparentBackground: true,
      },
      {
        name: "Andthrix's",
        slug: "andthrixs",
        photos: ["/img/guests/andthrix.png"],
        categories: ["Idol Group"],
        appearanceDate: {
          date: "26",
          month: "Oct",
        },
        description: ``,
        social: {
          instagram: "andthrixs",
        },
        isPublished: true,
        transparentBackground: true,
      },
      {
        name: "Daruma Rollin'",
        slug: "daruma-rollin",
        photos: ["/img/guests/daruma-rollin.png"],
        categories: ["Girl Band"],
        appearanceDate: {
          date: "25",
          month: "Oct",
        },
        description: ``,
        social: {
          instagram: "",
        },
        isPublished: true,
        transparentBackground: false,
      },
      {
        name: "Acky Bright",
        slug: "acky-bright",
        photos: ["/img/guests/acky-brights.png"],
        categories: ["Comic Artist"],
        appearanceDate: {
          date: "25-26",
          month: "Oct",
        },
        description: ``,
        social: {
          instagram: "acky_bright",
        },
        isPublished: true,
        transparentBackground: false,
      },
      {
        name: "Bryan Valenza",
        slug: "bryan-valenza",
        photos: ["/img/guests/bryan-valenza.png"],
        categories: ["Comic Artist"],
        appearanceDate: {
          date: "25-26",
          month: "Oct",
        },
        description: ``,
        social: {
          instagram: "bryan_valenza",
        },
        isPublished: true,
        transparentBackground: true,
      },
      {
        name: "Redshift",
        slug: "redshift",
        photos: ["/img/guests/redshift.png"],
        categories: ["DJ Performance"],
        description: ``,
        social: {
          instagram: "",
        },
        isPublished: true,
        transparentBackground: true,
      },
      {
        name: "Feel Koplo",
        slug: "feelkoplo",
        photos: ["/img/guests/feelkoplo.png"],
        categories: ["DJ Performance"],
        appearanceDate: {
          date: "26",
          month: "Oct",
        },
        description: ``,
        social: {
          instagram: "feelkoplo",
        },
        isPublished: true,
        transparentBackground: true,
      },
      {
        name: "Syncro Wotagei",
        slug: "wotagei",
        photos: ["/img/guests/wotagei.png"],
        categories: ["Performer"],
        appearanceDate: {
          date: "25",
          month: "Oct",
        },
        description: ``,
        social: {
          instagram: "syncro_jkt",
        },
        isPublished: true,
        transparentBackground: true,
      },
    ],
  }),

  getters: {
    getGuestBySlug: (state) => (slug) => {
      return state.list.find((item) => item.slug === slug);
    },

    getGuestsByCategories: (state) => (category) => {
      return state.list.filter((item) => item.categories?.includes(category));
    },
  },
});
