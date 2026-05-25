<template>
  <Lightbox
    :items="lightboxItems"
    :show-thumbnails="lightboxItems.length > 1"
    :alt="''"
  >
    <template #caption>
      <AdCaptionWithLink />
    </template>
    <template #trigger="{ openAt }">
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
            delay: 4000,
            // stopOnInteraction: false,
            // stopOnMouseEnter: true,
          }),
          $wheelGesturesPlugin(),
        ]"
      >
        <CarouselContent class="-ml-2 *:select-none">
          <CarouselItem
            v-for="(item, index) in visibleItems"
            :key="index"
            class="basis-full pl-2"
          >
            <nuxt-link
              v-if="!item.adImage"
              :to="lp(item.cta?.link ?? '')"
              :target="item.cta?.link?.startsWith('http') ? '_blank' : ''"
              class="text-foreground outline-inside flex h-full items-center rounded-2xl bg-white/3 backdrop-blur-lg"
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
                  class="line-clamp-1 font-semibold tracking-tighter"
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

            <div
              v-else
              class="outline-inside bg-muted/70 relative isolate overflow-hidden rounded-2xl"
            >
              <button
                type="button"
                class="block aspect-[1920/480] w-full cursor-zoom-in"
                :aria-label="item.adImage.alt || 'Open banner'"
                @click="openAt(adIndexFor(index))"
              >
                <NuxtImg
                  :src="item.adImage.src"
                  :alt="item.adImage.alt ?? ''"
                  sizes="sm:100vw md:50vw lg:480px"
                  loading="lazy"
                  format="webp"
                  class="size-full object-cover"
                />
              </button>

              <a
                v-if="item.link"
                :href="item.link"
                target="_blank"
                rel="noopener noreferrer"
                @click.stop
                class="absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-md bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 active:scale-95"
                aria-label="Open link in new tab"
              >
                <Icon name="lucide:external-link" class="size-4" />
              </a>
            </div>
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
  </Lightbox>
</template>

<script setup>
import { defineComponent, h, resolveComponent } from "vue";
import Autoplay from "embla-carousel-autoplay";
import { Lightbox, useLightbox } from "./ui/lightbox";

const AdCaptionWithLink = defineComponent({
  name: "AdCaptionWithLink",
  setup() {
    const { current } = useLightbox();
    return () => {
      const item = current.value;
      if (!item) return null;
      const caption = item.caption || "";
      const link = item.link || "";
      if (!caption && !link) return null;
      const IconCmp = resolveComponent("Icon");
      return h(
        "div",
        {
          class:
            "mx-auto flex max-w-3xl flex-col items-center gap-2 px-4 text-center text-sm tracking-tight text-white/85 sm:text-base",
        },
        [
          caption ? h("p", { class: "pointer-events-none" }, caption) : null,
          link
            ? h(
                "a",
                {
                  href: link,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  class:
                    "inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium tracking-tight text-white backdrop-blur-md transition hover:bg-white/20 sm:text-sm",
                },
                [
                  h("span", "Visit link"),
                  h(IconCmp, {
                    name: "lucide:external-link",
                    class: "size-3.5",
                  }),
                ],
              )
            : null,
        ].filter(Boolean),
      );
    };
  },
});

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

const localePath = useLocalePath();
const lp = (path) => (path?.startsWith("http") ? path : localePath(path));

const items = computed(() => useContentStore().components.hero.bannerHero);

const { now } = useCurrentTime();

const isWithinWindow = (item) => {
  if (!item) return false;
  const start = item.startTime ? new Date(item.startTime) : null;
  const end = item.endTime ? new Date(item.endTime) : null;
  const t = now.value;
  if (start && t < start) return false;
  if (end && t > end) return false;
  return true;
};

const visibleItems = computed(() => items.value.filter(isWithinWindow));

const lightboxItems = computed(() =>
  visibleItems.value
    .filter((item) => item.adImage)
    .map((item) => {
      const full = item.adImage.srcFull ?? item.adImage.src;
      return {
        url: full,
        xl: full,
        lg: full,
        md: item.adImage.src,
        sm: item.adImage.src,
        alt: item.adImage.alt ?? "",
        caption: item.adImage.caption ?? "",
        link: item.link ?? "",
      };
    }),
);

const adIndexFor = (index) => {
  let counter = 0;
  for (let i = 0; i < visibleItems.value.length; i++) {
    if (i === index) return counter;
    if (visibleItems.value[i].adImage) counter++;
  }
  return -1;
};
</script>
