<template>
  <div class="space-y-16 overflow-hidden pb-16 lg:space-y-24 lg:pb-24">
    <Hero />
    <LazySpeakers class="pt-8" />
    <LazyBrandPreview v-if="brandPreviewVisible" />
    <LazyRundown v-if="rundownVisible" />
    <LazyAboutEvent />
    <LazyPartnerships />
    <LazyVisitorCta />
    <LazyCredits class="container flex flex-col items-center text-center" />
    <RollingText
      text="Global AI Expo"
      :lines="4"
      :duration="2.5"
      :stagger="0.2"
      :line-offset="1.2"
    />
    <!-- <LazyBlogPostSlider
      :headline="useContentStore().components.postSlider.title.default"
    /> -->
    <LazyFAQ tag="h2" />
    <FAB />
  </div>
</template>

<script setup>
usePageMeta("home");
useEventSchema();
const { visible: rundownVisible } = useRundownVisibility();
const { visible: brandPreviewVisible } = useBrandPreviewVisibility();
</script>
