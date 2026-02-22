<template>
  <div id="gallery-page" class="pt-6 pb-2 lg:pt-10">
    <div class="container flex flex-col items-center text-center">
      <h1 class="section-title text-center">Gallery</h1>
    </div>

    <div class="mt-3 px-0.5 lg:mt-6">
      <Gallery />
    </div>
  </div>
</template>

<script setup>
usePageMeta("gallery");
</script>
