<template>
  <Carousel
    v-if="gallery?.length"
    v-slot="{ scrollPrev, scrollNext, canScrollPrev, canScrollNext }"
    class="focus-outline relative overflow-hidden"
    :opts="{
      loop: true,
      align: 'start',
      dragFree: true,
    }"
    :plugins="[
      AutoScroll({
        speed: 0.8,
        startDelay: 200,
        stopOnInteraction: false,
      }),
      $wheelGesturesPlugin(),
    ]"
  >
    <CarouselContent class="carousel-mx -ml-2 *:select-none">
      <CarouselItem
        v-for="(item, index) in gallery"
        :key="index"
        class="carousel-item basis-[90%] pl-2 sm:basis-[400px] xl:basis-[600px]"
      >
        <div class="bg-muted overflow-hidden rounded-xl">
          <NuxtImg
            :src="`${item.src}`"
            :alt="item.alt"
            :width="item.w"
            :height="item.h"
            class="size-full object-cover"
            sizes="400px xl:600px"
            format="webp"
            loading="lazy"
          />
        </div>
      </CarouselItem>
    </CarouselContent>
  </Carousel>
</template>

<script setup>
import AutoScroll from "embla-carousel-auto-scroll";

defineProps({
  gallery: {
    type: Array,
    required: true,
  },
});
</script>
