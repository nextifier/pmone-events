<template>
  <!-- <ComingSoon /> -->
  <div v-if="events?.length" class="pt-8 pb-20">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <span class="tracking-tight"
          ><span class="text-gradient-accent font-mediumt bg-linear-to-r"
            >Our Works </span
          >✨</span
        >

        <h1 class="section-title mt-1">
          Discover Unforgettable
          <span class="text-gradient-accent">Moments</span>
        </h1>

        <p class="section-description mt-3 !text-balance">
          Browse the Panorama Events portfolio for inspiring team building
          events, retreats & engaging employee experiences.
        </p>
      </div>

      <div
        class="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5"
      >
        <EventCard
          v-for="(event, index) in events"
          :key="index"
          :event="event"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
usePageMeta("events");
const events = useEventStore().events;
</script>
