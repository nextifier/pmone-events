<template>
  <section id="hero" class="overflow-hidden pt-10">
    <div class="container">
      <div
        class="grid grid-cols-1 gap-x-8 gap-y-3.5 lg:grid-cols-2 lg:items-end"
      >
        <div
          class="flex flex-col items-center gap-y-3 text-center lg:items-start lg:text-left"
        >
          <span class="section-subtitle"
            >Our success? Millions of happy faces</span
          >
          <h1
            class="text-primary text-[2.5rem] leading-[1.1]! font-normal tracking-tighter text-balance sm:text-7xl"
          >
            We set the stage for your story to shine.
          </h1>
        </div>

        <div
          class="flex flex-col items-center gap-y-5 text-center lg:ml-auto lg:max-w-xl lg:items-end lg:gap-y-6 lg:text-right"
        >
          <div v-if="trustedBy?.length" class="flex items-center gap-x-1.5">
            <div class="bg-muted flex -space-x-4 rounded-full p-1">
              <div
                v-for="(item, index) in trustedBy"
                :key="index"
                class="bg-background border-muted size-10 overflow-hidden rounded-full border-2"
                :style="{
                  'z-index': trustedBy.length - index,
                }"
              >
                <NuxtImg
                  :src="`/img/clients/${item.logo}`"
                  :alt="item.name"
                  class="size-full object-cover"
                  width="40"
                  height="40"
                  sizes="40px"
                  loading="lazy"
                  format="webp"
                />
              </div>
            </div>
            <span class="tracking-tight">Trusted by thousands of brands.</span>
          </div>

          <p class="section-description text-balance!">
            Every event tells a story. Every story needs the perfect stage. We
            create moments that matter.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-2">
            <button
              @click="openContactDialog"
              class="bg-primary hover:bg-primary/80 text-primary-foreground flex items-center justify-center gap-x-1 rounded-xl px-4 py-3 font-medium tracking-tighter transition active:scale-98"
            >
              Start your event
            </button>
            <NuxtLink
              to="/events"
              class="text-primary hover:bg-muted flex items-center justify-center gap-1 rounded-xl px-4 py-3 font-medium tracking-tighter transition active:scale-98"
              >See our signature events</NuxtLink
            >
          </div>
        </div>
      </div>
    </div>

    <GalleryCarouselAutoScroll :gallery="gallery" class="mt-10" />
  </section>
</template>

<script setup>
const uiStore = useUiStore();
const openContactDialog = () => {
  uiStore.openContactDialog();
};

const trustedBy = [
  {
    logo: "pwc.jpg",
    name: "PwC",
  },
  {
    logo: "jpm.jpg",
    name: "JPM",
  },
  {
    logo: "ksei.jpg",
    name: "KSEI",
  },
  {
    logo: "btn.jpg",
    name: "Bank BTN",
  },
];

const gallery = [
  {
    src: "/img/hero-gallery/CROWD-DSCF0665.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSC00020.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSC00028.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSC00054.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSC00072.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSC00187.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSC00317.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSC00330.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSC00905.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSC01092.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSC01151.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSC01823.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSC02439.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSC03585.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSC04495.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSC06546.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSC06725.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSC06730.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSC06734.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSC06737.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSC06779.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSC07212.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSC09462.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSC09513.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSCF0813.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSCF0819.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSCF1207.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSCF1225.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSCF1255.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSCF2072.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSCF2363.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSCF3833.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSCF4144.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSCF4166.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSCF5607.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSCF5934.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSCF8110.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSCF8413.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/DSCF9285.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/MSA03583.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/MSA03901.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/MSA03933.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/MSA04048.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/MSA04316.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
  {
    src: "/img/hero-gallery/MSA04485.jpg",
    w: 800,
    h: 600,
    alt: "",
  },
];
</script>
