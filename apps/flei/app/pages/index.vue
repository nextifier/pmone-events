<template>
  <div class="relative space-y-16 overflow-hidden pb-10 lg:space-y-24 lg:pb-16">
    <Hero />
    <LazyBrandPreview v-if="brandPreviewVisible" />
    <LazyRundown v-if="rundownVisible" />
    <LazyHotels v-if="hotelSectionVisible" :show-event-header="false" />
    <LazyAboutEvent />
    <LazyPartnerships />
    <LazyVisitorCta />
    <!-- <LazyMediaCoveragesSlider /> -->
    <LazyCredits class="container flex flex-col items-center text-center" />
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
const { visible: rundownVisible } = useRundownVisibility();
const { visible: brandPreviewVisible } = useBrandPreviewVisibility();
const { visible: hotelSectionVisible } = useHotelSectionVisibility();
definePageMeta({
  colorMode: "dark",
});
</script>
