import { defineStore } from "pinia";

export const useTicketStore = defineStore("tickets", {
  state: () => ({
    categories: [
      {
        title: "Entry Tickets",
        slug: "entry-tickets",
        description: `An entry ticket is required to access the ${useAppConfig().app.name}.`,
        tickets: [
          {
            title: "Regular Entry Ticket",
            slug: "regular-ticket",
            image: "/img/tickets/entry-tickets/regular-ticket.jpg",
            starts_in: "Oct 1, 2025 12:00:00",
            ends_in: "Nov 16, 2025 21:00:00",
            showStartCountdownLabel: false,
            showEndCountdownLabel: false,
            status: "", // empty string, Coming Soon, Available, Sold out
            disableLink: true,
            button_label: "Get Ticket",
            button_url: "https://panorama.undangin.com/tickets/26288",
            price: "FREE",
            label: "Registration",
            is_vip: false,
            day_pass: "One-day pass",
            entrance: "Regular entrance",
            benefits: [],
          },
          // {
          //   title: "VIP Entry Ticket",
          //   slug: "vip-ticket",
          //   image: "/img/tickets/entry-tickets/vip-ticket.jpg",
          //   starts_in: "Oct 1, 2025 12:00:00",
          //   ends_in: "Nov 16, 2025 21:00:00",
          //   showStartCountdownLabel: false,
          //   showEndCountdownLabel: false,
          //   status: "",
          //   disableLink: true,
          //   button_label: "Get Ticket",
          //   button_url: "https://panorama.undangin.com/tickets/vip/26288",
          //   price: "Invitation only",
          //   label: "Registration",
          //   is_vip: true,
          //   day_pass: "All-day pass",
          //   entrance: "VIP entrance",
          //   benefits: [],
          // },
        ],
      },
    ],
  }),

  getters: {
    getTicketCategoryBySlug: (state) => (slug) => {
      return state.categories.find((item) => item.slug === slug);
    },
  },
});
