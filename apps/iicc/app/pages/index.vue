<template>
  <div class="relative space-y-16 overflow-hidden pb-10 lg:space-y-24">
    <Hero />
    <LazyAbout class="-mt-10" />
    <LazyTopics />
    <LazyPrograms />
    <LazyRundown v-if="rundownVisible" :show-search="false">
      <template #header>
        <div class="flex flex-col items-center text-center">
          <span
            class="border-primary rounded-full border px-3 py-1.5 text-base font-medium tracking-tighter sm:text-lg"
            >{{ $t("agenda.badge") }}</span
          >
          <h2 class="section-title mt-2">
            {{ $t("agenda.title")
            }}<span class="text-gradient-accent">{{
              $t("agenda.titleAccent")
            }}</span>
          </h2>
          <p class="section-description mt-3 w-full">
            {{ $t("agenda.description") }}
          </p>
          <p class="mt-2 text-sm tracking-tight italic">
            {{ $t("agenda.draftNotice") }}
          </p>
        </div>
      </template>
    </LazyRundown>
    <LazyWhyAttend />
    <LazyWhoAttends />
    <LazyWhyYogyakarta />
    <LazyTickets />
    <div v-if="hotelSectionVisible" class="container">
      <LazyHotels :show-event-header="false" />
    </div>
    <LazyFAQ />
    <LazyPastEvents />
    <LazyCredits
      v-if="creditsVisible"
      class="container flex flex-col items-center text-center"
    />
  </div>
</template>

<script setup>
const { t } = useI18n();
const config = useAppConfig();
const route = useRoute();
const { visible: rundownVisible } = useRundownVisibility();
const { visible: hotelSectionVisible } = useHotelSectionVisibility();
const { visible: creditsVisible } = useCreditsVisibility();

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
