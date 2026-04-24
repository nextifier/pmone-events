<template>
  <div class="relative space-y-16 overflow-hidden pb-10 lg:space-y-24 lg:pb-16">
    <Hero />
    <Experiences />
    <Outing />
    <ShortsSlider />
    <FAQ />
    <Cta />
    <TextFit
      tag="span"
      text="CampX Holiday Park"
      :animated="true"
      text-classes="text-accent text-center font-extrabold tracking-tighter italic text-accent text-center font-extrabold tracking-tighter italic"
    />
    <FAB />
  </div>
</template>

<script setup>
usePageMeta("home");

defineOptions({
  name: "index",
});
</script>
