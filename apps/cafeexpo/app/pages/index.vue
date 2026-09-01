<template>
  <div class="space-y-16 pb-16 lg:space-y-24 lg:pb-24">
    <Hero />
    <LazyEventStats />
    <LazyBrandPreview />
    <LazyRundown />
    <LazyAboutEvent />
    <LazyThemeConcept />
    <LazyWhoVisits />
    <!-- <LazyHotels :show-event-header="false" /> -->
    <LazyWhyExhibit />
    <LazyPartnerships />
    <LazyVisitorCta />
    <!-- <LazyMediaCoveragesSlider /> -->
    <!-- <LazyCredits
           class="container flex flex-col items-center text-center"
         /> -->
    <LazyBlogPostSlider
      :headline="useContentStore().components.postSlider.title.default"
    />
    <LazyFAQ tag="h2" />
    <FAB />
  </div>
</template>

<script setup>
// The home description is built from the live event (edition, dates, venue), and
// usePageMeta reads it while this setup runs. Without the await the tokens
// resolve against the empty defaults and the tag ships with "{n}{ordinal} run"
// in it. Shares the single `active-event` asyncData entry, so this costs no
// extra request.
await useEventData();

usePageMeta("home");
useEventSchema();
</script>
