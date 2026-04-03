<template>
  <div class="min-h-screen-offset pt-6 pb-16">
    <BrandList :edition="edition" />
  </div>
</template>

<script setup>
const route = useRoute();
const edition = computed(() => route.params.edition);

usePageMeta("brands");
defineOptions({
  name: "edition-brands",
});
</script>
