<template>
  <div class="sm:container-wider">
    <div class="gallery-container">
      <Lightbox :items="items" alt="Gallery" />
    </div>
  </div>
</template>

<script setup>
const gallery = useGalleryStore();

const items = gallery.images.map((image) => ({
  sm: `/img/gallery/thumb/${image}`,
  md: `/img/gallery/${image}`,
  lg: `/img/gallery/${image}`,
  url: `/img/gallery/${image}`,
}));
</script>
