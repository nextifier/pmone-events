<template>
  <div class="space-y-16 overflow-hidden pb-16 lg:space-y-24 lg:pb-24">
    <Hero />
    <LazyEventStats />
    <LazyBrandPreview v-if="brandPreviewVisible" />
    <LazyAboutEvent />
    <LazyThemeConcept />
    <LazyRundown v-if="rundownVisible" />
    <LazyWhoVisits />
    <LazyHotels v-if="hotelSectionVisible" :show-event-header="false" />
    <LazyWhyExhibit />
    <LazyPartnerships />
    <LazyVisitorCta />
    <!-- <LazyMediaCoveragesSlider /> -->
    <LazyCredits
      v-if="creditsVisible"
      class="container flex flex-col items-center text-center"
    />
    <LazyBlogPostSlider
      :headline="useContentStore().components.postSlider.title.default"
    />
    <LazyFAQ tag="h2" />
    <FAB />
  </div>
</template>

<script setup>
usePageMeta("home");
useEventSchema();
useHead({ bodyAttrs: { class: "theme-brown" } });
const { visible: rundownVisible } = useRundownVisibility();
const { visible: brandPreviewVisible } = useBrandPreviewVisibility();
const { visible: hotelSectionVisible } = useHotelSectionVisibility();
const { visible: creditsVisible } = useCreditsVisibility();
</script>
