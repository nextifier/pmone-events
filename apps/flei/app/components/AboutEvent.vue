<template>
  <div
    class="space-y-16 overflow-hidden lg:space-y-24"
    :class="{
      'pt-6': ['ticket'].includes(route.name),
    }"
  >
    <div class="container flex flex-col lg:items-center lg:text-center">
      <h2 class="section-title-large">
        <span class="text-accent">The Starting Line</span> for Your Business
        Empire.
      </h2>

      <div
        class="text-muted-foreground mx-auto mt-4 max-w-4xl space-y-4 text-2xl !leading-[1.3] font-semibold tracking-tighter text-balance sm:mt-8 sm:text-3xl"
      >
        <p>
          Imagine hundreds of paths to success, all under one roof. That's FLEI.
          We curate the best business opportunities so you can spend less time
          searching and more time building.
        </p>
      </div>
    </div>

    <MainPrograms />

    <BusinessSegments />
  </div>
</template>

<script setup>
const route = useRoute();
</script>
