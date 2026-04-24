<template>
  <div
    class="max-h-screen-offset relative isolate aspect-square h-[100vw] w-screen shrink-0 scale-110 xl:mx-auto xl:h-full xl:w-auto xl:shrink"
  >
    <!-- <GlowCard variant="crescent" class="pointer-events-none z-50 size-full" /> -->

    <div class="absolute inset-0 z-20 scale-110">
      <Orb
        :hoverIntensity="0.5"
        :rotateOnHover="true"
        :hue="8"
        :forceHoverState="false"
      />
    </div>

    <!-- <div
      class="absolute inset-0 z-10 flex size-full scale-88 flex-col items-center justify-center overflow-clip rounded-full"
    >
      <BendingGallery
        :items="items"
        :bend="2"
        :border-radius="0.1"
        class="z-20"
      />
    </div> -->

    <div
      class="absolute inset-[6%] z-10 flex items-center justify-center overflow-hidden rounded-full"
    >
      <Carousel3d
        :items="items"
        :fade-edges="false"
        card-width="clamp(24em, 26vw, 32em)"
        perspective="42em"
        tilt="-6deg"
        duration="48s"
        class="size-full translate-y-[5%]"
      >
        <template #item="{ item, index }">
          <img
            :src="item.image"
            :alt="item.text || `Hero gallery ${index + 1}`"
            class="block size-full object-cover"
            loading="lazy"
          />
        </template>
      </Carousel3d>
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
