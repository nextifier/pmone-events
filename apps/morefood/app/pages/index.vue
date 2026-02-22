<template>
  <div class="space-y-16 overflow-hidden pb-16 lg:space-y-24 lg:pb-24">
    <Hero />
    <!-- <LazyBrandPreview /> -->
    <!-- <LazyRundown /> -->
    <LazyAboutEvent />
    <LazyPartnerships />
    <LazyVisitorCta />
    <LazyMediaCoveragesSlider />
    <LazyCredits class="container flex flex-col items-center text-center" />
    <TextFit
      tag="span"
      text="Meet. Greet. Eat."
      :animated="true"
      text-classes="text-accent text-center font-extrabold tracking-tighter italic text-accent text-center font-extrabold tracking-tighter italic"
    />
    <LazyBlogPostSlider
      :headline="useContentStore().components.postSlider.title.default"
    />
    <FAB />
  </div>
</template>

<script setup>
usePageMeta("home");
</script>
