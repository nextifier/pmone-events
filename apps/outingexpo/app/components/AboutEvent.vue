<template>
  <div
    class="space-y-16 lg:space-y-24"
    :class="{
      'pt-6': ['ticket'].includes(route.name),
    }"
  >
    <div class="container">
      <div
        class="grid grid-cols-1 items-center gap-x-6 gap-y-6 lg:grid-cols-2 xl:gap-x-12"
      >
        <div class="bg-muted aspect-square overflow-hidden rounded-2xl">
          <NuxtImg
            src="/img/about-img.jpg"
            alt=""
            class="pointer-events-none h-full w-full object-cover select-none"
            width="1000"
            height="667"
            sizes="100vw lg:1000px"
            loading="lazy"
            format="webp"
          />
        </div>

        <div class="flex flex-col items-start text-left">
          <span class="section-subtitle"
            >Meet Indonesia Outing & Incentive Travel Expo (IOITE)</span
          >

          <h2 class="section-title mt-2">
            Your One-Stop Hub for
            <span class="">All Things Outing</span>!
          </h2>

          <p class="section-description mt-3">
            Indonesia Outing & Incentive Travel Expo is your gateway to
            discovering incredible outing opportunities across Indonesia. From
            adventure tourism and corporate retreats to family outings and
            extreme sports - we've gathered the best providers, destinations,
            and deals in one amazing three-day event. Come explore what's
            possible for your next adventure.
          </p>
        </div>
      </div>
    </div>

    <WhyVisit />

    <MainPrograms />
  </div>
</template>

<script setup>
const route = useRoute();
</script>
