<template>
  <div class="space-y-16 pb-16 lg:space-y-24 lg:pb-24">
    <Hero v-if="heroVisible" />
    <LazyEventStats v-if="eventStatsVisible" />
    <LazyBrandPreview v-if="brandPreviewVisible" />
    <LazyAboutEvent v-if="aboutEventVisible" />
    <LazyThemeConcept v-if="themeConceptVisible" />
    <LazyRundown v-if="rundownVisible" />
    <LazyWhoVisits v-if="whoVisitsVisible" />
    <LazyHotels v-if="hotelSectionVisible" :show-event-header="false" />
    <LazyWhyExhibit v-if="whyExhibitVisible" />
    <LazyPartnerships v-if="partnershipsVisible" />
    <LazyVisitorCta v-if="visitorCtaVisible" />
    <!-- <LazyMediaCoveragesSlider /> -->
    <LazyCredits
      v-if="creditsVisible"
      class="container flex flex-col items-center text-center"
    />
    <LazyBlogPostSlider
      v-if="blogPostSliderVisible"
      :headline="useContentStore().components.postSlider.title.default"
    />
    <LazyFAQ v-if="faqVisible" tag="h2" />
    <FAB />
  </div>
</template>

<script setup>
usePageMeta("home");
useEventSchema();
const { visible: rundownVisible } = useRundownVisibility();
const { visible: brandPreviewVisible } = useBrandPreviewVisibility();
const { visible: hotelSectionVisible } = useHotelSectionVisibility();
const { visible: creditsVisible } = useCreditsVisibility();
const { visible: heroVisible } = useHomeSection("hero", { defaultVisible: true });
const { visible: eventStatsVisible } = useHomeSection("event_stats", {
  defaultVisible: true,
});
const { visible: aboutEventVisible } = useHomeSection("about_event", {
  defaultVisible: true,
});
const { visible: themeConceptVisible } = useHomeSection("theme_concept", {
  defaultVisible: true,
});
const { visible: whoVisitsVisible } = useHomeSection("who_visits", {
  defaultVisible: true,
});
const { visible: whyExhibitVisible } = useHomeSection("why_exhibit", {
  defaultVisible: true,
});
const { visible: partnershipsVisible } = useHomeSection("partnerships", {
  defaultVisible: true,
});
const { visible: visitorCtaVisible } = useHomeSection("visitor_cta", {
  defaultVisible: true,
});
const { visible: blogPostSliderVisible } = useHomeSection("blog_post_slider", {
  defaultVisible: true,
});
const { visible: faqVisible } = useHomeSection("faq", { defaultVisible: true });
</script>
