<template>
  <div class="space-y-16 pb-16 lg:space-y-24 lg:pb-24">
    <Hero v-if="heroVisible" />
    <LazyBrandPreview v-if="brandPreviewVisible" />
    <LazyPastExhibitors v-if="pastExhibitorsVisible" />
    <LazyRundown v-if="rundownVisible" />
    <LazyHotels v-if="hotelSectionVisible" :show-event-header="false" />
    <LazyAboutEvent v-if="aboutEventVisible" />
    <!-- <LazyEventFormat v-if="eventFormatVisible" /> -->
    <LazyWhoVisits v-if="whoVisitsVisible" />
    <LazyExhibitorCategories v-if="exhibitorCategoriesVisible" />
    <LazyEventStats v-if="eventStatsVisible" />
    <LazyGalleryPreview v-if="galleryPreviewVisible" />
    <LazyWhyExhibit v-if="whyExhibitVisible" />
    <LazyPartnerships v-if="partnershipsVisible" />
    <!-- <LazyVisitorCta /> -->
    <LazyMediaCoveragesSlider v-if="mediaCoveragesSliderVisible" />
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
const { visible: heroVisible } = useHomeSection("hero", {
  defaultVisible: true,
});
const { visible: pastExhibitorsVisible } = useHomeSection("past_exhibitors", {
  defaultVisible: true,
});
const { visible: aboutEventVisible } = useHomeSection("about_event", {
  defaultVisible: true,
});
// The 4-day format section reuses the shared "theme_concept" toggle.
const { visible: eventFormatVisible } = useHomeSection("theme_concept", {
  defaultVisible: true,
});
const { visible: whoVisitsVisible } = useHomeSection("who_visits", {
  defaultVisible: true,
});
const { visible: exhibitorCategoriesVisible } = useHomeSection(
  "exhibitor_categories",
  { defaultVisible: true },
);
const { visible: eventStatsVisible } = useHomeSection("event_stats", {
  defaultVisible: true,
});
const { visible: galleryPreviewVisible } = useHomeSection("gallery_preview", {
  defaultVisible: true,
});
const { visible: whyExhibitVisible } = useHomeSection("why_exhibit", {
  defaultVisible: true,
});
const { visible: partnershipsVisible } = useHomeSection("partnerships", {
  defaultVisible: true,
});
const { visible: mediaCoveragesSliderVisible } = useHomeSection(
  "media_coverages_slider",
  { defaultVisible: true },
);
const { visible: blogPostSliderVisible } = useHomeSection("blog_post_slider", {
  defaultVisible: true,
});
const { visible: faqVisible } = useHomeSection("faq", { defaultVisible: true });
</script>
