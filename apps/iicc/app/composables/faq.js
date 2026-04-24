import { defineStore } from "pinia";

export const useFAQStore = defineStore("faq", {
  state: () => ({
    keys: [
      "whatIsIicc",
      "whenWhere",
      "whoShouldAttend",
      "ticketTypes",
      "earlyBird",
      "howToRegister",
      "language",
      "whatsIncluded",
      "accommodation",
      "dressCode",
      "sponsor",
      "refund",
    ],
  }),
  getters: {
    list() {
      const { t } = useI18n();
      return this.keys.map((key) => ({
        q: t(`faq.items.${key}.q`),
        a: t(`faq.items.${key}.a`),
      }));
    },
  },
});
