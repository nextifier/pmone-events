<template>
  <Carousel
    @init-api="setApi"
    v-slot="{ scrollPrev, scrollNext, canScrollPrev, canScrollNext }"
    class="focusable relative overflow-hidden"
    :opts="{
      loop: true,
      align: 'start',
      dragFree: false,
    }"
    :plugins="[
      Autoplay({
        delay: 6000,
        // stopOnInteraction: false,
        // stopOnMouseEnter: true,
      }),
      $wheelGesturesPlugin(),
    ]"
  >
    <CarouselContent class="-ml-2 *:select-none">
      <CarouselItem
        v-for="(item, index) in items"
        :key="index"
        class="basis-full pl-2"
      >
        <nuxt-link
          :to="item.cta?.link ?? ''"
          :target="item.cta?.link.startsWith('http') ? '_blank' : ''"
          class="text-primary border-primary/10 flex h-full items-center rounded-2xl border bg-white/3 backdrop-blur-lg"
        >
          <div
            v-if="item.img"
            class="flex h-full w-24 shrink-0 items-center justify-center overflow-hidden rounded-l-2xl bg-white/6"
          >
            <NuxtImg
              :src="item.img.src"
              sizes="200px"
              :width="item.img.w"
              :height="item.img.h"
              loading="lazy"
              format="webp"
              class="size-full object-cover"
            />
          </div>

          <div
            class="flex flex-col items-start py-2.5 text-[13px] xl:text-sm"
            :class="item.img ? 'px-2.5' : 'px-4'"
          >
            <span
              v-if="item.subHeadline"
              class="line-clamp-1 font-bold tracking-tighter"
              >{{ item.subHeadline }}</span
            >
            <div
              v-if="item.content"
              v-html="item.content"
              class="text-primary/80 mt-1 line-clamp-4 !leading-[1.4] font-medium tracking-tight"
            />

            <button
              v-if="item.cta"
              class="text-primary mt-1 flex items-center gap-1 rounded-md font-semibold tracking-tighter transition hover:underline"
            >
              <span>{{ item.cta.label }}</span>
              <Icon name="lucide:arrow-right" class="size-3.5" />
            </button>
          </div>
        </nuxt-link>
      </CarouselItem>
    </CarouselContent>

    <div class="mt-2.5 flex items-center justify-end gap-1.5">
      <button
        @click="scrollPrev"
        :disabled="!canScrollPrev"
        class="dark:bg-primary/5 border-primary/8 hover:bg-background/40 dark:hover:bg-primary/10 text-primary flex size-8 items-center justify-center rounded-md border backdrop-blur-md transition active:scale-95"
        aria-label="previous"
      >
        <Icon name="lucide:arrow-left" class="size-4" />
      </button>

      <button
        @click="scrollNext"
        :disabled="!canScrollNext"
        class="dark:bg-primary/5 border-primary/8 hover:bg-background/40 dark:hover:bg-primary/10 text-primary flex size-8 items-center justify-center rounded-md border backdrop-blur-md transition active:scale-95"
        aria-label="next"
      >
        <Icon name="lucide:arrow-right" class="size-4" />
      </button>

      <button
        @click="toggleAutoplay"
        class="dark:bg-primary/5 border-primary/8 hover:bg-background/40 dark:hover:bg-primary/10 text-primary flex size-8 items-center justify-center rounded-md border backdrop-blur-md transition active:scale-95"
        aria-label="Toggle autoplay"
      >
        <Icon
          :name="isPlaying ? 'lucide:pause' : 'lucide:play'"
          class="size-4"
        />
      </button>
    </div>
  </Carousel>
</template>

<script setup>
import Autoplay from "embla-carousel-autoplay";

const emblaApi = ref(null);
const isPlaying = ref(false);

const setApi = (api) => {
  emblaApi.value = api;

  const autoplay = emblaApi.value.plugins().autoplay;
  if (!autoplay) return;

  isPlaying.value = autoplay.isPlaying();

  emblaApi.value.on("autoplay:play", () => {
    isPlaying.value = true;
  });
  emblaApi.value.on("autoplay:stop", () => {
    isPlaying.value = false;
  });
  emblaApi.value.on("reInit", () => {
    isPlaying.value = autoplay.isPlaying();
  });
};

const toggleAutoplay = () => {
  const autoplay = emblaApi.value?.plugins()?.autoplay;
  if (!autoplay) return;

  if (autoplay.isPlaying()) {
    autoplay.stop();
  } else {
    autoplay.play();
  }
};

onUnmounted(() => {
  if (emblaApi.value) {
    emblaApi.value.off("autoplay:play");
    emblaApi.value.off("autoplay:stop");
    emblaApi.value.off("reInit");
  }
});

const items = useContentStore().components.hero.bannerHero;
</script>
