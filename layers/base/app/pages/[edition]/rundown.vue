<template>
  <!-- overflow-x-clip: see pages/rundown.vue (tilting posters). -->
  <section id="rundown" class="min-h-screen-offset overflow-x-clip pt-4 pb-16">
    <LazyRundown :edition="edition" />
  </section>
</template>

<script setup>
const route = useRoute();
const edition = computed(() => route.params.edition);

usePageMeta("rundown");
defineOptions({
  name: "edition-rundown",
});
</script>
