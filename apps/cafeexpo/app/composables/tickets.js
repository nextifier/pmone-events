import { defineStore } from "pinia";

export const useTicketStore = defineStore("tickets", {
  state: () => ({
    categories: [
      {
        title: "Entry Tickets",
        slug: "entry-tickets",
        description: `An entry ticket is required to access the ${useAppConfig().event.title}.`,
        tickets: [
          {
            title: "Regular Ticket",
            slug: "regular-pass",
            image: "/img/tickets/entry-tickets/regular-ticket.jpg",
            starts_in: "Apr 16, 2026 00:00:00",
            ends_in: "May 10, 2026 21:00:00",
            showStartCountdownLabel: false,
            showEndCountdownLabel: false,
            status: "", // empty string, Coming Soon, Available, Sold out
            disableLink: true,
            button_label: "Get ticket",
            button_url: "https://panorama.undangin.com/ticket/26297",
            price: "Rp60,000",
            // price_before_discounted: "Rp60,000",
            is_vip: false,
            day_pass: "All-day pass",
            entrance: "Regular entrance",
            benefits: [
              "Access to Cafe Brasserie Expo Jakarta",
              "Access to Franchise & License Expo Indonesia",
              "Access to More Food Expo Indonesia",
            ],
          },

          {
            title: "VIP Entry Ticket",
            slug: "vip-ticket",
            image: "/img/tickets/entry-tickets/vip-ticket.jpg",
            starts_in: "Feb 12, 2026 10:00:00",
            ends_in: "May 10, 2026 21:00:00",
            showStartCountdownLabel: false,
            showEndCountdownLabel: false,
            status: "", // empty string, Coming Soon, Available, Sold out
            disableLink: true,
            button_label: "Get ticket",
            button_url: "https://panorama.undangin.com/ticket/vip/26297",
            price: "Invitation only",
            label: "Registration",
            is_vip: true,
            day_pass: "All-day pass",
            entrance: "VIP entrance",
            benefits: [
              "Access to Cafe Brasserie Expo Jakarta",
              "Access to Franchise & License Expo Indonesia",
              "Access to More Food Expo Indonesia",
            ],
          },
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
