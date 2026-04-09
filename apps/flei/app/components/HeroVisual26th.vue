<template>
  <div class="max-h-screen-offset relative isolate h-full">
    <!-- <CircularGradientBorder class="pointer-events-none z-50 size-full" /> -->
    <GlowCard variant="crescent" class="pointer-events-none z-50 size-full" />

    <div
      class="absolute inset-0 z-10 flex size-full flex-col items-center justify-center overflow-clip rounded-full"
    >
      <BendingGallery
        :items="items"
        :bend="2"
        :border-radius="0.1"
        class="z-20"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
const items = ref<Array<{ image: string; text: string }>>([
  {
    image: "/img/hero-gallery/0.jpg",
    text: "",
  },
  {
    image: "/img/hero-gallery/1.jpg",
    text: "",
  },
  {
    image: "/img/hero-gallery/2.jpg",
    text: "",
  },
  {
    image: "/img/hero-gallery/3.jpg",
    text: "",
  },
  {
    image: "/img/hero-gallery/4.jpg",
    text: "",
  },
  {
    image: "/img/hero-gallery/5.jpg",
    text: "",
  },
  {
    image: "/img/hero-gallery/6.jpg",
    text: "",
  },
  {
    image: "/img/hero-gallery/7.jpg",
    text: "",
  },
  {
    image: "/img/hero-gallery/8.jpg",
    text: "",
  },
  {
    image: "/img/hero-gallery/9.jpg",
    text: "",
  },
  {
    image: "/img/hero-gallery/10.jpg",
    text: "",
  },
  {
    image: "/img/hero-gallery/11.jpg",
    text: "",
  },
  {
    image: "/img/hero-gallery/12.jpg",
    text: "",
  },
  {
    image: "/img/hero-gallery/13.jpg",
    text: "",
  },
  {
    image: "/img/hero-gallery/14.jpg",
    text: "",
  },
  {
    image: "/img/hero-gallery/15.jpg",
    text: "",
  },
  {
    image: "/img/hero-gallery/16.jpg",
    text: "",
  },
]);
</script>
