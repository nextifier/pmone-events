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

  const faqParams = {
    eventTitle,
    eventDate,
    eventTime,
    eventLocation,
    locationLink,
    whatsappLink,
    email,
    instagram,
  };

  const list = computed(() => [
    {
      q: t("faq.items.0.q", faqParams),
      a: t("faq.items.0.a", faqParams),
    },
    {
      q: t("faq.items.1.q", faqParams),
      a: t("faq.items.1.a", faqParams),
    },
    {
      q: t("faq.items.2.q", faqParams),
      a: t("faq.items.2.a", faqParams),
    },
    {
      q: t("faq.items.3.q", faqParams),
      a: t("faq.items.3.a", faqParams),
    },
    {
      q: t("faq.items.4.q", faqParams),
      a: t("faq.items.4.a", faqParams),
    },
    {
      q: t("faq.items.5.q", faqParams),
      a: t("faq.items.5.a", faqParams),
    },
    {
      q: t("faq.items.6.q", faqParams),
      a: t("faq.items.6.a", faqParams),
    },
    {
      q: t("faq.items.7.q", faqParams),
      a: t("faq.items.7.a", faqParams),
    },
    {
      q: t("faq.items.8.q", faqParams),
      a: t("faq.items.8.a", faqParams),
    },
    {
      q: t("faq.items.9.q", faqParams),
      a: t("faq.items.9.a", faqParams),
    },
    {
      q: t("faq.items.10.q", faqParams),
      a: t("faq.items.10.a", faqParams),
    },
    {
      q: t("faq.items.11.q", faqParams),
      a: t("faq.items.11.a", faqParams),
    },
    {
      q: t("faq.items.12.q", faqParams),
      a: t("faq.items.12.a", faqParams),
    },
    {
      q: t("faq.items.13.q", faqParams),
      a: t("faq.items.13.a", faqParams),
    },
    {
      q: t("faq.items.14.q", faqParams),
      a: t("faq.items.14.a", faqParams),
    },
    {
      q: t("faq.items.15.q", faqParams),
      a: t("faq.items.15.a", faqParams),
    },
  ]);

  return { list };
});
