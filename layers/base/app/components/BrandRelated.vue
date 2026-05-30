<template>
  <section v-if="brands?.length" class="space-y-4 sm:space-y-6">
    <div class="container">
      <h2 class="section-title">{{ $t("ui.relatedBrands") }}</h2>
    </div>

    <Carousel
      v-slot="{ scrollPrev, scrollNext, canScrollPrev, canScrollNext }"
      class="focusable relative overflow-hidden"
      :opts="{
        loop: false,
        align: 'center',
        dragFree: false,
        skipSnaps: true,
      }"
      :plugins="[$wheelGesturesPlugin()]"
    >
      <CarouselContent
        class="carousel-px ml-0 grid auto-cols-[220px] grid-flow-col grid-rows-[repeat(4,auto)] gap-x-2 *:select-none sm:auto-cols-[240px]"
      >
        <CarouselItem
          v-for="brand in brands"
          :key="brand.slug"
          class="row-span-4 grid grid-rows-subgrid pl-0"
        >
          <BrandGridItem
            :brand="brand"
            variant="card"
            brand-base-path="/brands"
          />
        </CarouselItem>

        <!-- Trailing spacer slide: leaves the last card the same gutter the
             first card gets from `carousel-px` (embla bounds scroll to the last
             slide, so the track's trailing padding alone never shows). -->
        <div
          aria-hidden="true"
          class="row-span-4 justify-self-start"
          :style="{ width: `${edgeInset}px` }"
        />
      </CarouselContent>

      <div class="mt-6 h-8">
        <div
          v-if="canScrollPrev || canScrollNext"
          class="container flex h-full justify-end"
        >
          <ButtonGroup>
            <Button
              variant="outline"
              size="iconSm"
              :disabled="!canScrollPrev"
              aria-label="previous"
              @click="scrollPrev"
            >
              <Icon name="lucide:arrow-left" class="size-4" />
            </Button>
            <Button
              variant="outline"
              size="iconSm"
              :disabled="!canScrollNext"
              aria-label="next"
              @click="scrollNext"
            >
              <Icon name="lucide:arrow-right" class="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              class="font-medium"
              :to="localePath('/brands')"
            >
              {{ $t("ui.viewAllBrands") }}
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </Carousel>
  </section>
</template>

<script setup>
defineProps({
  brands: {
    type: Array,
    default: () => [],
  },
});

const localePath = useLocalePath();

// Width of the trailing spacer slide, mirroring `.container`'s responsive left
// inset (Tailwind breakpoints, px-4 gutter) — the same value `carousel-px` adds
// on the left. Embla bounds its scroll to the last slide's edge and ignores the
// track's trailing padding, so a real slide is the only way to leave the last
// card the same gutter the first one gets. `clientWidth` excludes the scrollbar,
// matching the `100%` that `carousel-px` resolves against.
const edgeInset = ref(16);

const updateEdgeInset = () => {
  const w = document.documentElement.clientWidth;
  const maxWidth = [1600, 1500, 1280, 1024, 768, 640, 540].find((bp) => w >= bp);
  const inset = maxWidth ? (w - maxWidth) / 2 + 16 : 16;
  // Subtract the `gap-x-2` (8px) that sits between the last card and the spacer,
  // so the trailing gutter matches the leading inset exactly.
  edgeInset.value = Math.max(0, inset - 8);
};

onMounted(() => {
  updateEdgeInset();
  window.addEventListener("resize", updateEdgeInset, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateEdgeInset);
});
</script>
