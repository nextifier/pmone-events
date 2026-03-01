<template>
  <div class="relative space-y-16 overflow-hidden pb-10 lg:space-y-24 lg:pb-16">
    <Hero />
    <LazyAboutEvent />
    <LazyPartnerships />
    <!-- <LazyVisitorCta /> -->
    <LazyMediaCoveragesSlider />
    <LazyCredits class="container flex flex-col items-center text-center" />
    <!-- <TextFit
      tag="span"
      text="Connecting Businesses"
      :animated="true"
      text-classes="text-accent text-center font-extrabold tracking-tighter italic text-accent text-center font-extrabold tracking-tighter italic"
    /> -->
    <LazyBlogPostSlider
      :headline="useContentStore().components.postSlider.title.default"
    />
    <FAQ />
    <FAB />
  </div>
</template>

<script setup>
usePageMeta("home");

const config = useAppConfig();
const siteUrl = useRuntimeConfig().public.siteUrl;
const faq = useFAQStore();

useSchemaOrg([
  defineOrganization({
    name: config.app.name,
    url: siteUrl,
    logo: `${siteUrl}/icons/icon-512x512.png`,
    email: config.contact.email,
    sameAs: [
      `https://www.instagram.com/${config.social.instagram}`,
      `https://www.facebook.com/${config.social.facebook}`,
      `https://tiktok.com/@${config.social.tiktok}`,
      `https://www.linkedin.com/company/${config.social.linkedin}`,
      `https://www.youtube.com/@${config.social.youtube}`,
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: config.contact.email,
        url: siteUrl,
      },
    ],
  }),
  defineEvent({
    name: config.event.title,
    description:
      "Mulai Bisnismu di Pameran Franchise Terbesar di Indonesia. Temukan brand-brand unggulan dari sektor F&B, ritel, edukasi, dan banyak lagi.",
    startDate: "2026-05-07T10:00:00+07:00",
    endDate: "2026-05-10T21:00:00+07:00",
    eventStatus: "EventScheduled",
    eventAttendanceMode: "OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: "JIExpo Kemayoran",
      address: {
        "@type": "PostalAddress",
        streetAddress: "JIExpo Kemayoran",
        addressLocality: "Jakarta",
        addressCountry: "ID",
      },
    },
    image: [`${siteUrl}/icons/icon-512x512.png`],
    organizer: { "@id": `${siteUrl}/#identity` },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/ticket`,
      availability: "https://schema.org/InStock",
      name: "Tiket Masuk FLEI",
      description:
        "Harga tiket Pameran Franchise berbeda-beda tergantung jenis tiket dan waktu pembeliannya. Tersedia promo early bird dan pre-sale.",
    },
  }),
  ...faq.list.map((item) =>
    defineQuestion({
      name: item.q,
      acceptedAnswer: item.a.replace(/<[^>]*>/g, ""),
    }),
  ),
]);
</script>
