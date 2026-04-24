<template>
  <div class="relative space-y-16 overflow-hidden pb-10 lg:space-y-24">
    <Hero />
    <LazyAbout class="-mt-10" />
    <LazyTopics />
    <LazyPrograms />
    <LazyAgenda />
    <LazyWhyAttend />
    <LazyWhoAttends />
    <LazyPastEvents />
    <LazyTickets />
    <LazyFAQ />
    <LazyCredits class="container flex flex-col items-center text-center" />
  </div>
</template>

<script setup>
const { t } = useI18n();
const config = useAppConfig();
const route = useRoute();

const siteUrl = config.app.url;
const pageUrl = siteUrl + route.path;

useSeoMeta({
  title: t("meta.title"),
  ogTitle: t("meta.title"),
  description: t("meta.description"),
  ogDescription: t("meta.description"),
  ogUrl: pageUrl,
  ogType: "website",
  ogSiteName: config.app.name,
  twitterCard: "summary_large_image",
  twitterTitle: t("meta.title"),
  twitterDescription: t("meta.description"),
});

useSeoMeta({
  ogImage: "/og/og-home.jpg",
});

useHead({
  link: [
    {
      rel: "canonical",
      href: pageUrl,
    },
  ],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: config.app.name,
        url: siteUrl,
        alternateName: config.app.shortName,
      }),
    },
  ],
});
</script>
