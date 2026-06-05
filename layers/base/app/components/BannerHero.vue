<template>
  <div v-if="items.length" :class="$attrs.class">
    <Lightbox
      :items="lightboxItems"
      :show-thumbnails="lightboxItems.length > 1"
      :alt="''"
    >
    <template #caption>
      <AdCaption />
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
            <component
              :is="item.cta?.link ? NuxtLink : 'div'"
              v-if="!item.adImage"
              :to="item.cta?.link ? lp(item.cta.link) : undefined"
              :target="item.cta?.link?.startsWith('http') ? '_blank' : undefined"
              class="text-foreground outline-inside flex h-full items-center rounded-lg bg-white/3 backdrop-blur-lg sm:rounded-2xl"
              @click="item.cta?.link && trackClick(item.id, item.subHeadline || item.cta?.label || 'banner')"
            >
              <div
                v-if="item.img"
                class="flex h-full w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/6 sm:rounded-l-2xl"
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
            </component>

            <CardNotch
              v-else-if="item.link"
              size="2.5rem"
              gap="5px"
              radius="1rem"
              border-color="var(--color-border)"
              card-bg="var(--color-muted)"
              body-class="overflow-hidden outline-inside"
            >
              <button
                type="button"
                :class="['block w-full cursor-zoom-in', aspectClass(item)]"
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
              <template #notch>
                <a
                  :href="item.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  :aria-label="`Open ${item.adImage.alt || 'banner'} link`"
                  class="bg-muted text-foreground hover:bg-border border-border flex size-full items-center justify-center rounded-full border"
                  @click="trackClick(item.id, item.adImage.alt || 'banner')"
                >
                  <Icon name="lucide:arrow-up-right" class="size-4" />
                </a>
              </template>
            </CardNotch>

            <div
              v-else
              class="outline-inside bg-muted/70 relative isolate overflow-hidden rounded-lg sm:rounded-2xl"
            >
              <button
                type="button"
                :class="['block w-full cursor-zoom-in', aspectClass(item)]"
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
            </div>
          </CarouselItem>
        </CarouselContent>

        <div class="mt-2.5 flex justify-end">
          <ButtonGroup>
            <Button
              variant="outline"
              size="iconSm"
              aria-label="previous"
              :disabled="!canScrollPrev"
              class="text-foreground hover:bg-primary/5 active:bg-primary/10 bg-transparent"
              @click="scrollPrev"
            >
              <Icon name="lucide:arrow-left" class="size-4" />
            </Button>

            <Button
              variant="outline"
              size="iconSm"
              aria-label="next"
              :disabled="!canScrollNext"
              class="text-foreground hover:bg-primary/5 active:bg-primary/10 bg-transparent"
              @click="scrollNext"
            >
              <Icon name="lucide:arrow-right" class="size-4" />
            </Button>

            <Button
              variant="outline"
              size="iconSm"
              aria-label="Toggle autoplay"
              class="text-foreground hover:bg-primary/5 active:bg-primary/10 bg-transparent"
              @click="toggleAutoplay"
            >
              <Icon
                :name="
                  isPlaying
                    ? 'material-symbols:pause'
                    : 'material-symbols:play-arrow'
                "
                class="size-4"
              />
            </Button>
          </ButtonGroup>
        </div>
      </Carousel>
    </template>
    </Lightbox>
  </div>
</template>

<script setup>
import { defineComponent, h } from "vue";
import Autoplay from "embla-carousel-autoplay";
import { Lightbox, useLightbox } from "./ui/lightbox";

defineOptions({ inheritAttrs: false });

const NuxtLink = resolveComponent("NuxtLink");
const { trackImpression, trackClick } = useBannerTracking();

const AdCaption = defineComponent({
  name: "AdCaption",
  setup() {
    const { current } = useLightbox();
    return () => {
      const caption = current.value?.caption || "";
      if (!caption) return null;
      return h(
        "p",
        {
          class:
            "pointer-events-none mx-auto max-w-3xl px-4 text-center text-sm tracking-tight text-white/85 sm:text-base",
        },
        caption,
      );
    };
  },
});

const emblaApi = ref(null);
const isPlaying = ref(false);

const setApi = (api) => {
  emblaApi.value = api;

  // Impression tracking: count the banner shown on each slide (deduped per id).
  emblaApi.value.on("select", trackCurrentImpression);
  emblaApi.value.on("reInit", trackCurrentImpression);
  trackCurrentImpression();

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
    emblaApi.value.off("select");
  }
});

const localePath = useLocalePath();
const lp = (path) => (path?.startsWith("http") ? path : localePath(path));

// Banners are managed in PM One (project-level) and served by the public API.
// The nitro adapter at `/api/banners` injects this site's project_slug + API key.
const { data: bannerData } = await useFetch("/api/banners", {
  query: { placement: "hero" },
  key: "banner-hero-banners",
  default: () => [],
  transform: (res) => res?.data ?? [],
});
const items = computed(() => bannerData.value ?? []);

const aspectClass = (item) =>
  ({
    "1:1": "aspect-square",
    "16:9": "aspect-video",
    "9:16": "aspect-[9/16]",
    "4:5": "aspect-[4/5]",
    "2:1": "aspect-[2/1]",
    "4:1": "aspect-[1920/480]",
  })[item.aspectRatio] ?? "aspect-[1920/480]";

const { now } = useCurrentTime();

// The module-level `now` is frozen on the server (it only starts ticking on the
// client in onMounted), so filtering time-windowed banners against it during SSR
// can yield a different set than the client's first render -> Vue logs
// "Hydration completed but contains mismatches" (a console error that costs the
// Best-Practices score). Gate the time filter behind mount: SSR and the first
// client render both show every item (deterministic, identical markup), then the
// window filter kicks in after hydration.
const isMounted = ref(false);
onMounted(() => {
  isMounted.value = true;
});

const isWithinWindow = (item) => {
  if (!item) return false;
  const start = item.startTime ? new Date(item.startTime) : null;
  const end = item.endTime ? new Date(item.endTime) : null;
  const t = now.value;
  if (start && t < start) return false;
  if (end && t > end) return false;
  return true;
};

const visibleItems = computed(() =>
  isMounted.value ? items.value.filter(isWithinWindow) : items.value,
);

// Track an impression for the banner on the currently selected carousel slide.
function trackCurrentImpression() {
  const api = emblaApi.value;
  if (!api) return;
  const item = visibleItems.value[api.selectedScrollSnap()];
  if (item?.id) trackImpression(item.id);
}

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
