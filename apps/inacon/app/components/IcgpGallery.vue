<template>
  <section id="icgp-gallery" class="container">
    <div class="flex flex-col items-center text-center">
      <h2 class="section-title">{{ $t("icgp.galleryTitle") }}</h2>
      <p class="section-description mx-auto mt-3">
        {{ $t("icgp.galleryDescription") }}
      </p>
    </div>

    <Lightbox :items="items" class="mt-6 lg:mt-10">
      <template #trigger="{ openAt }">
        <div
          class="mx-auto grid max-w-4xl grid-cols-2 gap-2 sm:grid-cols-4"
        >
          <button
            v-for="(item, i) in items"
            :key="i"
            type="button"
            class="block aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-gray-100 transition active:scale-[0.98] dark:bg-gray-900"
            @click="openAt(i)"
          >
            <img
              :src="item.url"
              :alt="item.alt"
              class="size-full object-cover"
              loading="lazy"
              decoding="async"
              draggable="false"
            />
          </button>
        </div>
      </template>
    </Lightbox>
  </section>
</template>

<script setup>
const items = [
  {
    url: "/img/icgp/icgp-2027-01.webp",
    alt: "Indonesia Cosplay Grand Prix 2027",
  },
  { url: "/img/icgp/icgp-2027-02.webp", alt: "What is ICGP" },
  { url: "/img/icgp/icgp-2027-03.webp", alt: "What is WCS" },
  {
    url: "/img/icgp/icgp-2027-04.webp",
    alt: "Ready to represent Indonesia",
  },
];
</script>
