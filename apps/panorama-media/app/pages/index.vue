<template>
  <div class="space-y-16 pb-10 lg:space-y-24 lg:pb-16">
    <Hero />
    <!-- <LazyEventSlider :events="events" /> -->
    <AboutSection />
    <OurBrandsSection />
    <CtaSection />
    <LazyBlogPostSlider headline="News & Insights" />
    <FAB />
  </div>
</template>

<script setup>
usePageMeta("home");

const events = useEventsStore().events;
</script>
