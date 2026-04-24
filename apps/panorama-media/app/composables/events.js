import { defineStore } from "pinia";

export const useEventsStore = defineStore("events", {
  state: () => ({
    events: [
      {
        title: "More Food Expo Indonesia",
        slug: "morefood-1st",
        poster: "/img/events/morefood-2026-poster.jpg",
        status: "",
        edition: {
          value: 1,
          ordinal: "st",
        },
        date: "May 7-10, 2026",
        startTime: "May 7, 2026 10:00:00",
        endTime: "May 10, 2026 21:00:00",
        time: "10 AM - 9 PM",
        location: "JIExpo Kemayoran, Jakarta",
        locationLink: "https://maps.app.goo.gl/8GEz5sDjzW6apig97",
        hall: "",
        brand: {
          name: "More Food Expo Indonesia",
          logo: "/img/avatar/morefood.svg",
          website: "https://morefoodexpo.com",
        },
        inConjunction: {
          label: "In conjunction with",
          list: [
            {
              name: "Franchise & License Expo Indonesia",
              url: "https://franchise-expo.co.id",
              img: "/img/avatar/flei.svg",
            },
            {
              name: "Cafe & Brasserie Expo Jakarta",
              url: "https://cafebrasserieexpo.com",
              img: "/img/avatar/cbe.svg",
            },
          ],
        },
      },
    ],
  }),

  getters: {
    getEventBySlug: (state) => (slug) => {
      return state.events.find((event) => event.slug === slug);
    },
  },
});
