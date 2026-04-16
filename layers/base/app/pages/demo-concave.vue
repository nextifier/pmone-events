<template>
  <div class="min-h-screen-offset pt-6 pb-16">
    <div class="container-wider">
      <h2 class="section-title mb-8">Brand List Concave Demo</h2>
      <BrandListConcave :count="16" />
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "demo-concave" });
</script>
