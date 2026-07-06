<template>
  <div class="space-y-16 pb-16 lg:space-y-24 lg:pb-24">
    <Hero v-if="heroVisible" />
    <LazyBrandPreview v-if="brandPreviewVisible" />
    <!-- <LazyGuestList /> -->
    <LazyRundown v-if="rundownVisible" />
    <LazyHotels v-if="hotelSectionVisible" :show-event-header="false" />
    <LazyAboutEvent v-if="aboutEventVisible" />
    <LazyPartnerships v-if="partnershipsVisible" />
    <!-- <LazyVisitorCta /> -->
    <!-- <LazyMediaCoveragesSlider /> -->
    <!-- <LazyCredits class="container flex flex-col items-center text-center" /> -->
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
const { visible: heroVisible } = useHomeSection("hero", { defaultVisible: true });
const { visible: aboutEventVisible } = useHomeSection("about_event", {
  defaultVisible: true,
});
const { visible: partnershipsVisible } = useHomeSection("partnerships", {
  defaultVisible: true,
});
const { visible: blogPostSliderVisible } = useHomeSection("blog_post_slider", {
  defaultVisible: true,
});
const { visible: faqVisible } = useHomeSection("faq", { defaultVisible: true });
</script>
