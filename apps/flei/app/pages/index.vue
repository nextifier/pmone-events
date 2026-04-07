<template>
  <div class="relative space-y-16 overflow-hidden pb-10 lg:space-y-24 lg:pb-16">
    <Hero />
    <LazyAboutEvent />
    <LazyPartnerships />
    <LazyVisitorCta />
    <!-- <LazyMediaCoveragesSlider /> -->
    <LazyCredits class="container flex flex-col items-center text-center" />
    <LazyBlogPostSlider
      :headline="useContentStore().components.postSlider.title.default"
    />
    <FAQ tag="h2" />
    <FAB />
  </div>
</template>

<script setup>
usePageMeta("home");
useEventSchema();
</script>
