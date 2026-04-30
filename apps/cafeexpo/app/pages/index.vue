<template>
  <div class="space-y-16 pb-16 lg:space-y-24 lg:pb-24">
    <Hero />
    <ClientOnly>
      <LazyRundown v-if="rundownVisible" />
    </ClientOnly>
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
useHead({ bodyAttrs: { class: "theme-brown" } });
const { visible: rundownVisible } = useRundownVisibility();
</script>
