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
            slug: "regular-ticket",
            image: "/img/tickets/entry-tickets/regular-ticket.jpg",
            // starts_in: "Nov 20, 2026 09:00:00",
            // ends_in: "Nov 22, 2026 21:00:00",
            showStartCountdownLabel: false,
            showEndCountdownLabel: false,
            status: "Coming Soon", // empty string, Coming Soon, Available, Sold out
            disableLink: true,
            button_label: "Get ticket",
            // button_url: "",
            price: "Rp350,000",
            // price_before_discounted: "",
            is_vip: false,
            day_pass: "3-day pass",
            entrance: "Regular entrance",
            benefits: [
              "Access to AI exhibition hall (200+ exhibitors)",
              "Access to startup pavilion",
              "Access to public conference stage",
              "Event tote bag and visitor lanyard",
            ],
          },

          {
            title: "VIP Ticket",
            slug: "vip-ticket",
            image: "/img/tickets/entry-tickets/vip-ticket.jpg",
            // starts_in: "Nov 20, 2026 09:00:00",
            // ends_in: "Nov 22, 2026 21:00:00",
            showStartCountdownLabel: false,
            showEndCountdownLabel: false,
            status: "Coming Soon", // empty string, Coming Soon, Available, Sold out
            disableLink: true,
            button_label: "Get ticket",
            // button_url: "",
            price: "Rp2,500,000",
            label: "Registration",
            is_vip: true,
            day_pass: "3-day pass",
            entrance: "VIP entrance",
            benefits: [
              "All Regular ticket benefits",
              "Access to all conference sessions and keynote stage",
              "Priority business matching with exhibitors",
              "VIP lounge access with refreshments",
              "Fast track entrance and dedicated registration desk",
              "Networking dinner invitation (Day 2)",
              "Conference materials and digital proceedings",
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
