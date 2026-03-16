import { defineStore } from "pinia";

export const useTicketStore = defineStore("tickets", {
  state: () => ({
    categories: [
      {
        title: "Entry Tickets",
        slug: "entry-tickets",
        description:
          "An entry ticket is required to access the Megabuild Indonesia.",
        tickets: [
          {
            title: "Regular Entry Ticket",
            slug: "regular-ticket",
            image: "/img/tickets/entry-tickets/regular-ticket.jpg",
            starts_in: "Mar 17, 2026 10:00:00",
            ends_in: "Jun 7, 2026 21:00:00",
            showStartCountdownLabel: false,
            showEndCountdownLabel: false,
            status: "", // empty string, Coming Soon, Available, Sold out
            disableLink: true,
            button_label: "Get Ticket",
            button_url: "https://panorama.undangin.com/ticket/26299",
            price: "FREE",
            label: "Registration",
            // price_before_discounted: "Rp60,000",
            is_vip: false,
            day_pass: "All-day pass",
            entrance: "Regular entrance",
            benefits: [
              "Access to Megabuild Indonesia",
              "Access to Mega Property Expo",
              "Access to Keramika Indonesia",
            ],
          },
          // {
          //   title: "VIP Entry Ticket",
          //   slug: "vip-ticket",
          //   image: "/img/tickets/entry-tickets/vip-ticket.jpg",
          //   starts_in: "Mar 17, 2026 10:00:00",
          //   ends_in: "Jun 7, 2026 21:00:00",
          //   showStartCountdownLabel: false,
          //   showEndCountdownLabel: false,
          //   status: "",
          //   disableLink: true,
          //   button_label: "Get Ticket",
          //   button_url: "https://panorama.undangin.com/ticket/vip/26299",
          //   price: "Invitation only",
          //   label: "Registration",
          //   is_vip: true,
          //   day_pass: "All-day pass",
          //   entrance: "VIP entrance",
          //   benefits: [
          //     "Access to Megabuild Indonesia",
          //     "Access to Mega Property Expo",
          //     "Access to Keramika Indonesia",
          //   ],
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
