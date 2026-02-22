<template>
  <div class="space-y-16 pb-16 lg:space-y-24 lg:pb-24">
    <Hero />
    <!-- <LazyGuestList /> -->
    <!-- <LazyBrandPreview /> -->
    <!-- <LazyRundown /> -->
    <LazyAboutEvent />
    <LazyPartnerships />
    <!-- <LazyVisitorCta /> -->
    <!-- <LazyMediaCoveragesSlider /> -->
    <!-- <LazyCredits class="container flex flex-col items-center text-center" /> -->
    <LazyBlogPostSlider
      :headline="useContentStore().components.postSlider.title.default"
    />
    <FAB />
  </div>
</template>

<script setup>
usePageMeta("home");
</script>
