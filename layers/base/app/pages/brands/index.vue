<template>
  <div class="min-h-screen-offset pt-6 pb-16">
    <BrandList />
  </div>
</template>

<script setup>
usePageMeta("brands");
defineOptions({
  name: "brands",
});
</script>
