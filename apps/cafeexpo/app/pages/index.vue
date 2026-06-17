<template>
  <div class="space-y-16 pb-16 lg:space-y-24 lg:pb-24">
    <Hero />
    <LazyBrandPreview v-if="brandPreviewVisible" />
    <LazyRundown v-if="rundownVisible" />
    <LazyHotels v-if="hotelSectionVisible" :show-event-header="false" />
    <LazyAboutEvent />
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
