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

  const params = {
    eventTitle,
    eventDate,
    eventTime,
    eventLocation,
    locationLink,
    whatsappLink,
    email,
    instagram,
  };

  const list = computed(() =>
    Array.from({ length: 16 }, (_, i) => ({
      q: t(`faq.items.${i}.q`, params),
      a: t(`faq.items.${i}.a`, params),
    })),
  );

  return { list };
});
