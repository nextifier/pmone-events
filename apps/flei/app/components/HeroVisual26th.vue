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
      ref="galleryDom"
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
          <!-- Cloudflare provider transforms to webp on the custom domain.
               First frame is the LCP candidate: eager + high priority + preload. -->
          <NuxtImg
            :src="item.image"
            :alt="item.text || `Hero gallery ${index + 1}`"
            width="800"
            height="1000"
            sizes="320px md:400px"
            format="webp"
            class="block size-full object-cover"
            :class="revealClass(index)"
            :loading="index === 0 ? 'eager' : 'lazy'"
            :fetchpriority="index === 0 ? 'high' : 'low'"
            :preload="index === 0"
            @load="onImageSettled(index)"
            @error="onImageSettled(index)"
          />
        </template>
      </Carousel3d>
    </div>
  </div>
</template>

<script lang="ts" setup>
const galleryDom = useTemplateRef<HTMLDivElement>("galleryDom");

// Cards fade in once their image lands, mirroring the Orb's "wait for the first
// painted frame" reveal. Frame 0 is exempt: it is the eager + preloaded LCP
// candidate, and an opacity-0 element does not count as painted, so hiding it
// would push LCP out to whenever hydration finishes.
const loaded = ref(new Set<number>());

const onImageSettled = (index: number) => {
  loaded.value.add(index);
};

const revealClass = (index: number) => {
  if (index === 0) return "";
  return [
    "transition-opacity duration-1000 ease-out",
    loaded.value.has(index) ? "opacity-100" : "opacity-0",
  ];
};

onMounted(() => {
  // Cached images can finish before hydration wires up @load — sweep the DOM
  // once so those still play the fade instead of sitting invisible forever.
  // DOM order matches item order: Carousel3d renders one card per item.
  galleryDom.value?.querySelectorAll("img").forEach((img, i) => {
    if (img.complete) onImageSettled(i);
  });
});

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
