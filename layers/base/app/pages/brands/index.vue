<template>
  <div class="min-h-screen-offset pt-4">
    <BrandList />
  </div>
</template>

<script setup>
usePageMeta("brands");
defineOptions({
  name: "brands",
});
</script>
