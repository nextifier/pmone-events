<template>
  <section v-if="events?.length">
    <div class="container flex flex-col items-start">
      <span class="tracking-tight"
        ><span class="text-gradient-accent font-mediumt bg-linear-to-r"
          >Our Works </span
        >✨</span
      >

      <h1 class="section-title mt-1">
        Discover Unforgettable
        <span class="text-gradient-accent">Moments</span>
      </h1>
    </div>

    <LazyEventSlider :events="events" class="mt-6" />
  </section>
</template>

<script setup>
const events = useEventStore().events;
</script>
