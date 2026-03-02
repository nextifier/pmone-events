<template>
  <section id="why-visit">
    <div class="container">
      <div class="flex flex-col items-start text-left">
        <span class="text-gradient-accent">{{ $t('whyVisit.heading') }}</span>
        <h2 class="section-title mt-2">{{ $t('whyVisit.subheading') }}</h2>
      </div>

      <div
        class="mt-4 grid grid-cols-1 gap-x-8 gap-y-8 sm:mt-6 sm:grid-cols-2 xl:grid-cols-4"
      >
        <div
          v-for="(item, index) in items"
          :key="index"
          class="flex flex-col items-start gap-y-2"
        >
          <div
            class="border-border flex size-12 items-center justify-center rounded-2xl border"
          >
            <Icon
              v-if="item.iconName"
              :name="item.iconName"
              class="text-accent size-6"
            />
          </div>
          <span
            v-if="item.title"
            class="text-primary text-base font-semibold tracking-tighter sm:text-lg"
            >{{ item.title }}</span
          >
          <span v-if="item.description" class="tracking-tight">{{
            item.description
          }}</span>
        </div>
      </div>
    </div>

    <!-- <Carousel
      v-if="items?.length"
      v-slot="{ scrollPrev, scrollNext, canScrollPrev, canScrollNext }"
      class="focusable relative mt-8 overflow-hidden lg:mt-10"
      :opts="{
        loop: false,
        align: 'start',
        dragFree: true,
      }"
      :plugins="[$wheelGesturesPlugin()]"
    >
      <CarouselContent class="carousel-mx -ml-3 *:select-none">
        <CarouselItem
          v-for="(item, index) in items"
          :key="index"
          class="carousel-item basis-[280px] pl-3 sm:basis-[320px] 2xl:basis-[400px]"
        >
          <div
            class="bg-muted relative aspect-[2/3] overflow-hidden rounded-2xl"
          >
            <NuxtImg
              :src="item.image"
              :alt="item.title"
              class="pointer-events-none size-full object-cover select-none"
              sizes="600px"
              width="600"
              height="900"
              loading="lazy"
              format="webp"
            />

            <div
              class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-black/0 mask-t-from-20% mask-t-to-100% backdrop-blur-xl"
            ></div>

            <div
              class="absolute inset-x-0 bottom-0 flex h-1/2 flex-col justify-end px-4 pb-8 text-2xl font-semibold tracking-tighter text-white text-shadow-lg sm:px-6"
            >
              <span class="text-balance">{{ item.title }}</span>
            </div>
          </div>
        </CarouselItem>
      </CarouselContent>

      <div class="container mt-6">
        <div class="flex items-center justify-end gap-x-2">
          <button
            @click="scrollPrev"
            :disabled="!canScrollPrev"
            class="flex aspect-square h-14 items-center justify-center rounded-full bg-gray-100 transition active:scale-98 dark:bg-gray-900"
            aria-label="previous"
            v-tippy="'Previous'"
          >
            <IconChevronLeft class="h-4" />
          </button>

          <button
            @click="scrollNext"
            :disabled="!canScrollNext"
            class="flex aspect-square h-14 items-center justify-center rounded-full bg-gray-100 transition active:scale-98 dark:bg-gray-900"
            aria-label="next"
            v-tippy="'Next'"
          >
            <IconChevronRight class="h-4" />
          </button>
        </div>
      </div>
    </Carousel> -->
  </section>
</template>

<script setup>
const { t } = useI18n();

const icons = [
  "hugeicons:agreement-01",
  "hugeicons:ai-idea",
  "hugeicons:halal",
  "hugeicons:ticket-star",
];

const items = computed(() =>
  icons.map((iconName, i) => ({
    iconName,
    title: t(`whyVisit.items.${i}.title`),
    description: t(`whyVisit.items.${i}.description`),
  })),
);
</script>
