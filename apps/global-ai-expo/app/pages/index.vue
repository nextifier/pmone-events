<template>
  <div class="space-y-16 overflow-hidden pb-16 lg:space-y-24 lg:pb-24">
    <Hero />
    <!-- <LazyRundown v-if="rundownVisible" /> -->
    <!-- <LazyAboutEvent /> -->
    <!-- <LazyPartnerships /> -->
    <!-- <LazyVisitorCta /> -->
    <!-- <LazyCredits class="container flex flex-col items-center text-center" /> -->
    <!-- <TextFit
      tag="span"
      text="Meet. Greet. Eat."
      :animated="true"
      text-classes="text-accent text-center font-extrabold tracking-tighter italic text-accent text-center font-extrabold tracking-tighter italic"
    /> -->
    <!-- <LazyBlogPostSlider
      :headline="useContentStore().components.postSlider.title.default"
    /> -->
    <!-- <LazyFAQ tag="h2" /> -->
    <FAB />
  </div>
</template>

<script setup>
usePageMeta("home");
useEventSchema();
const { visible: rundownVisible } = useRundownVisibility();
</script>
