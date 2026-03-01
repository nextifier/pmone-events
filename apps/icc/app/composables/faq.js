import { defineStore } from "pinia";

export const useFAQStore = defineStore("faq", () => {
  const { t } = useI18n();
  const config = useAppConfig();
  const eventTitle = config.event.title;
  const eventDate = config.event.date;
  const eventTime = config.event.time;
  const eventLocation = config.event.location;
  const locationLink = config.event.locationLink;
  const whatsapp = config.contact.whatsapp;
  const whatsappLink = `https://wa.me/${whatsapp}`;
  const email = config.contact.email;
  const instagram = config.social.instagram;

  const list = computed(() => [
    {
      q: t("faq.items.0.q", { eventTitle }),
      a: t("faq.items.0.a", {
        eventTitle,
        eventDate,
        eventTime,
        eventLocation,
        locationLink,
      }),
    },
    {
      q: t("faq.items.1.q"),
      a: t("faq.items.1.a"),
    },
    {
      q: t("faq.items.2.q"),
      a: t("faq.items.2.a"),
    },
    {
      q: t("faq.items.3.q"),
      a: t("faq.items.3.a"),
    },
    {
      q: t("faq.items.4.q"),
      a: t("faq.items.4.a"),
    },
    {
      q: t("faq.items.5.q"),
      a: t("faq.items.5.a"),
    },
    {
      q: t("faq.items.6.q"),
      a: t("faq.items.6.a"),
    },
    {
      q: t("faq.items.7.q"),
      a: t("faq.items.7.a"),
    },
    {
      q: t("faq.items.8.q"),
      a: t("faq.items.8.a"),
    },
    {
      q: t("faq.items.9.q"),
      a: t("faq.items.9.a"),
    },
    {
      q: t("faq.items.10.q"),
      a: t("faq.items.10.a", { whatsappLink }),
    },
    {
      q: t("faq.items.11.q"),
      a: t("faq.items.11.a"),
    },
    {
      q: t("faq.items.12.q"),
      a: t("faq.items.12.a"),
    },
    {
      q: t("faq.items.13.q"),
      a: t("faq.items.13.a"),
    },
    {
      q: t("faq.items.14.q", { instagram }),
      a: t("faq.items.14.a", { instagram }),
    },
    {
      q: t("faq.items.15.q"),
      a: t("faq.items.15.a", { whatsappLink, email }),
    },
  ]);

  return { list };
});
