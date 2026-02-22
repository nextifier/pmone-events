<template>
  <div class="sm:container-wider">
    <div class="gallery-container">
      <client-only>
        <vue-picture-swipe
          :items="imageObjects"
          @open="hideScrollbar"
          @close="showScrollbar"
        ></vue-picture-swipe>
      </client-only>
    </div>
  </div>
</template>

<script setup>
const gallery = new useGalleryStore();

const imageObjects = gallery.images.map((image) => ({
  src: `/img/gallery/${image}`,
  thumbnail: `/img/gallery/thumb/${image}`,
  filename: image,
  w: 1600,
  h: 900,
}));

const hideScrollbar = () => {
  document.querySelector("html").classList.add("no-scrollbar");
};

const showScrollbar = () => {
  document.querySelector("html").classList.remove("no-scrollbar");
};
</script>
