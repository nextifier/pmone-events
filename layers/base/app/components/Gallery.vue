<template>
  <div class="sm:container-wider">
    <div class="gallery-container">
      <Lightbox
        :items="items"
        alt="Gallery"
        grid-class="grid grid-cols-1 gap-1 sm:grid-cols-[repeat(auto-fit,minmax(320px,1fr))]"
        item-class="aspect-auto sm:aspect-4/3"
      />
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
