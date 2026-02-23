import { defineStore } from "pinia";

export const useTicketStore = defineStore("tickets", {
  state: () => ({
    categories: [
      {
        title: "Entry Tickets",
        slug: "entry-tickets",
        description:
          "An entry ticket is required to access the Keramika Indonesia.",
        tickets: [
          {
            title: "Regular Entry Ticket",
            slug: "regular-ticket",
            image: "/img/tickets/entry-tickets/regular-ticket.jpg",
            // starts_in: "Mar 3, 2025 00:00:00",
            // ends_in: "Apr 27, 2025 21:00:00",
            showStartCountdownLabel: false,
            showEndCountdownLabel: false,
            status: "Coming Soon", // empty string, Coming Soon, Available, Sold out
            disableLink: true,
            button_label: "Get Ticket",
            button_url: "",
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
          //   starts_in: "Mar 3, 2025 00:00:00",
          //   ends_in: "Apr 27, 2025 20:00:00",
          //   showStartCountdownLabel: false,
          //   showEndCountdownLabel: false,
          //   status: "",
          //   disableLink: true,
          //   button_label: "Get Ticket",
          //   button_url: "https://panorama.undangin.com/ticket/vip/26278",
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
