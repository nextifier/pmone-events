<template>
  <Carousel
    v-if="allPhotos?.length"
    v-slot="{ scrollPrev, scrollNext, canScrollPrev, canScrollNext }"
    class="focus-outline group relative isolate overflow-hidden"
    :opts="{
      loop: true,
      align: 'start',
      dragFree: false,
    }"
    :plugins="[$wheelGesturesPlugin()]"
    @init-api="setApi"
  >
    <CarouselContent class="relative z-10 -ml-0 *:select-none">
      <CarouselItem
        v-for="(item, index) in allPhotos"
        :key="index"
        class="carousel-item pl-0"
      >
        <NuxtLink
          :to="`/experiences/${experience.slug}`"
          class="bg-muted block aspect-[4/5] w-full overflow-hidden"
        >
          <NuxtImg
            :src="item"
            alt=""
            width="1080"
            height="1350"
            class="h-full w-full object-cover"
            sizes="400px lg:600px"
            format="webp"
            loading="lazy"
          />
        </NuxtLink>
      </CarouselItem>
    </CarouselContent>

    <div v-if="allPhotos?.length > 1">
      <!-- <div
        class="absolute bottom-4 -translate-y-6 lg:translate-y-0 left-1/2 z-20 flex -translate-x-1/2 items-center justify-center gap-1.5"
      >
        <CarouselDotButtons
          class="size-1.5 rounded-full"
          activeClass="bg-white"
          inactiveClass="bg-white/50"
        />
      </div> -->

      <div
        v-if="current && totalCount"
        class="text-primary bg-background/70 pointer-events-none absolute right-4 bottom-4 z-20 flex -translate-y-6 items-center justify-center rounded-md px-2 py-1 text-center text-xs font-medium tracking-tight backdrop-blur-sm select-none lg:translate-y-0"
      >
        {{ current }} / {{ totalCount }}
      </div>

      <button
        @click="scrollPrev"
        :disabled="!canScrollPrev"
        class="absolute top-1/2 left-0 z-20 hidden aspect-square h-8 -translate-x-full -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white text-black transition group-hover:translate-x-2 active:scale-95 lg:flex"
        aria-label="previous"
      >
        <Icon name="lucide:chevron-left" class="size-3.5" />
      </button>

      <button
        @click="scrollNext"
        :disabled="!canScrollNext"
        class="absolute top-1/2 right-0 z-20 hidden aspect-square h-8 translate-x-full -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white text-black transition group-hover:-translate-x-2 active:scale-95 lg:flex"
        aria-label="next"
      >
        <Icon name="lucide:chevron-right" class="size-3.5" />
      </button>
    </div>
  </Carousel>
</template>

<script setup>
import { watchOnce } from "@vueuse/core";

const api = ref(null);
const totalCount = ref(0);
const current = ref(0);

function setApi(val) {
  api.value = val;
}

watchOnce(api, (api) => {
  if (!api) return;

  totalCount.value = api.scrollSnapList().length;
  current.value = api.selectedScrollSnap() + 1;

  api.on("select", () => {
    current.value = api.selectedScrollSnap() + 1;
  });
});

const props = defineProps({
  experience: Object,
});

const allPhotos = computed(() => {
  const gallery = [];

  if (props.experience?.coverImage) {
    gallery.push(props.experience.coverImage);
  }

  if (props.experience?.photos?.length) {
    gallery.push(...props.experience.photos);
  }

  return gallery;
});
</script>
