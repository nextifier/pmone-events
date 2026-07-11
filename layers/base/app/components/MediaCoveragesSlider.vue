<template>
  <section v-if="content" class="media-coverages">
    <div class="container">
      <h2 class="section-title">{{ content.title }}</h2>

      <p class="mt-3 text-base tracking-tight text-pretty sm:text-lg">
        {{ content.description }}
      </p>

      <FallbackNotice v-if="fallbackSource" :source="fallbackSource" class="mt-6 mr-auto" />
    </div>
    <Carousel
      v-if="news?.length"
      v-slot="{ scrollPrev, scrollNext, canScrollPrev, canScrollNext }"
      class="focusable relative mt-8 overflow-hidden"
      :opts="{
        loop: false,
        align: 'center',
        dragFree: false,
        skipSnaps: true,
      }"
      :plugins="[$wheelGesturesPlugin()]"
    >
      <CarouselContent class="carousel-mx -ml-2 *:select-none">
        <CarouselItem
          v-for="(item, index) in news"
          :key="index"
          class="carousel-item basis-[280px] pl-2 lg:basis-[320px]"
        >
          <MediaCard :item="item" />
        </CarouselItem>
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
              :to="localePath('/partners') + '#media'"
              external
            >
              {{ $t('ui.viewAll') }}
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </Carousel>
  </section>
</template>

<script setup>
const localePath = useLocalePath();
const { data: mediaCoverageData } = await useMediaCoverages();
const news = computed(() => mediaCoverageData.value?.data ?? []);
const content = computed(() => useContentStore().components.mediaCoverage ?? null);

// Source edition when the press items were borrowed from a previous event.
const fallbackSource = computed(() => {
  const fb = mediaCoverageData.value?.meta?.fallback;
  return fb?.is_fallback ? fb.source_event : null;
});
</script>
