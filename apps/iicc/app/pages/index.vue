<template>
  <div class="relative space-y-16 overflow-hidden pb-10 lg:space-y-24">
    <Hero v-if="heroVisible" />
    <LazyAbout v-if="aboutVisible" class="-mt-10" />
    <LazyTopics v-if="topicsVisible" />
    <LazyPrograms v-if="programsVisible" />
    <LazyRundown v-if="rundownVisible" :show-search="false">
      <template #header>
        <div class="flex flex-col items-center text-center">
          <span
            class="border-foreground rounded-full border px-3 py-1.5 text-base font-medium tracking-tighter sm:text-lg"
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
    <LazyWhyAttend v-if="whyAttendVisible" />
    <LazyWhoAttends v-if="whoAttendsVisible" />
    <LazyWhyYogyakarta v-if="whyYogyakartaVisible" />
    <LazyTickets v-if="ticketsVisible" />
    <div v-if="hotelSectionVisible" class="container">
      <LazyHotels :show-event-header="false" />
    </div>
    <LazyFAQ v-if="faqVisible" />
    <LazyPastEvents v-if="pastEventsVisible" />
    <LazyCredits
      v-if="creditsVisible"
      class="container flex flex-col items-center text-center"
    />

    <!-- app.vue skips ScrollToTop on `index` routes, so the home page opts in
         here explicitly. -->
    <ScrollToTop />
  </div>
</template>

<script setup>
const { t } = useI18n();
const { visible: rundownVisible } = useRundownVisibility();
const { visible: hotelSectionVisible } = useHotelSectionVisibility();
const { visible: creditsVisible } = useCreditsVisibility();
const { visible: heroVisible } = useHomeSection("hero", { defaultVisible: true });
const { visible: aboutVisible } = useHomeSection("about", { defaultVisible: true });
const { visible: topicsVisible } = useHomeSection("topics", {
  defaultVisible: true,
});
const { visible: programsVisible } = useHomeSection("programs", {
  defaultVisible: true,
});
const { visible: whyAttendVisible } = useHomeSection("why_attend", {
  defaultVisible: true,
});
const { visible: whoAttendsVisible } = useHomeSection("who_attends", {
  defaultVisible: true,
});
const { visible: whyYogyakartaVisible } = useHomeSection("why_yogyakarta", {
  defaultVisible: true,
});
const { visible: ticketsVisible } = useHomeSection("tickets", {
  defaultVisible: true,
});
const { visible: faqVisible } = useHomeSection("faq", { defaultVisible: true });
const { visible: pastEventsVisible } = useHomeSection("past_events", {
  defaultVisible: true,
});

// SEO meta + structured data, aligned with the other event apps. iicc keeps its
// own i18n copy and OG image as explicit per-call overrides, while usePageMeta
// layers on the shared title-template / canonical (ogUrl) / OG / WebSite JSON-LD
// handling plus the dashboard SEO-copy plumbing; useEventSchema adds the
// Organization + Event structured data iicc previously lacked.
usePageMeta("home", {
  title: t("meta.title"),
  description: t("meta.description"),
  ogImage: "/og/og-home.jpg",
});
useEventSchema();
</script>
