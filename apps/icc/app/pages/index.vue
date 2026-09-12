<template>
  <div class="space-y-16 pb-16 lg:space-y-24 lg:pb-24">
    <Hero />
    <LazyGuestList />
    <LazyBrandPreview />
    <LazyRundown />
    <!-- <LazyHotels :show-event-header="false" /> -->
    <LazyAboutEvent />
    <LazyPartnerships />
    <LazyVisitorCta>
      <template #cta="{ to, target, label }">
        <AuroraButton
          :to="to"
          :target="target"
          color-variant="yellow"
          :shadow="false"
          >{{ label }}</AuroraButton
        >
      </template>
    </LazyVisitorCta>
    <!-- <LazyMediaCoveragesSlider /> -->
    <!-- <LazyCredits class="container flex flex-col items-center text-center" /> -->
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
</script>
