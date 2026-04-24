<template>
  <section id="past-events">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <span
          class="border-primary rounded-full border px-3 py-1.5 text-base font-medium tracking-tighter sm:text-lg"
          >{{ $t("pastEvents.badge") }}</span
        >
        <h2 class="section-title mt-2">
          {{ $t("pastEvents.title") }}
          <span class="text-gradient-accent">{{
            $t("pastEvents.titleAccent")
          }}</span>
        </h2>

        <p class="section-description mt-3 w-full">
          {{ $t("pastEvents.description") }}
        </p>
      </div>
    </div>

    <GalleryCarouselAutoScroll :gallery="gallery" class="mt-6 lg:mt-10" />
  </section>
</template>

<script setup>
const { t } = useI18n();

const gallery = [
  {
    src: "/img/gallery/01.jpg",
    w: 1080,
    h: 720,
    alt: "",
  },
  {
    src: "/img/gallery/02.jpg",
    w: 1080,
    h: 720,
    alt: "",
  },
  {
    src: "/img/gallery/03.jpg",
    w: 1080,
    h: 720,
    alt: "",
  },
  {
    src: "/img/gallery/04.jpg",
    w: 1080,
    h: 720,
    alt: "",
  },
  {
    src: "/img/gallery/05.jpg",
    w: 1080,
    h: 720,
    alt: "",
  },
  {
    src: "/img/gallery/06.jpg",
    w: 1080,
    h: 720,
    alt: "",
  },
  {
    src: "/img/gallery/07.jpg",
    w: 1080,
    h: 720,
    alt: "",
  },
  {
    src: "/img/gallery/08.jpg",
    w: 1080,
    h: 720,
    alt: "",
  },
  {
    src: "/img/gallery/09.jpg",
    w: 1080,
    h: 720,
    alt: "",
  },
  {
    src: "/img/gallery/10.jpg",
    w: 1080,
    h: 720,
    alt: "",
  },
  {
    src: "/img/gallery/11.jpg",
    w: 1080,
    h: 720,
    alt: "",
  },
];
</script>
