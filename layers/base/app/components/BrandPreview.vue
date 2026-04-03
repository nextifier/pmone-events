<template>
  <div>
    <div class="container">
      <h2 class="section-title text-center">
        {{ content.title }}
      </h2>
    </div>

    <Carousel
      v-if="brands?.length"
      v-slot="{ scrollPrev, scrollNext, canScrollPrev, canScrollNext }"
      class="focusable relative mt-8 overflow-hidden"
      :opts="{
        loop: true,
        align: 'start',
        dragFree: true,
      }"
      :plugins="[
        $wheelGesturesPlugin(),
        AutoScroll({
          speed: 0.8,
          startDelay: 200,
          stopOnInteraction: false,
        }),
      ]"
    >
      <CarouselContent class="-ml-2 *:select-none">
        <CarouselItem
          v-for="(brand, index) in brands"
          :key="index"
          class="carousel-item basis-[160px] pl-2 lg:basis-[240px]"
        >
          <BrandCard
            :brand="brand"
            :showBoothNumber="false"
            :showCreatedAt="false"
            :showPromotionImages="false"
          />
        </CarouselItem>
      </CarouselContent>
    </Carousel>

    <div v-else class="mt-8 flex overflow-hidden">
      <div
        v-for="(_, index) in 16"
        :key="index"
        class="min-h-[240px] shrink-0 basis-[160px] pl-2 lg:min-h-[260px] lg:basis-[240px]"
      >
        <BrandCardSkeleton
          :showBoothNumber="false"
          :showCreatedAt="false"
          :showPromotionImages="false"
        />
      </div>
    </div>

    <div class="container mt-8 flex justify-center">
      <nuxt-link
        :to="localePath('/brands')"
        class="text-primary border-border hover:bg-muted flex items-center justify-center gap-1.5 rounded-full border p-4 text-sm font-medium tracking-tight transition active:scale-98"
      >
        <Icon name="hugeicons:grid-view" class="size-4" />
        <span>All Brands</span>
      </nuxt-link>
    </div>
  </div>
</template>

<script setup>
import AutoScroll from "embla-carousel-auto-scroll";
const localePath = useLocalePath();

const content = computed(() => useContentStore().components.brandPreview);
const config = useRuntimeConfig();

const {
  data: brands,
  refresh,
  pending,
  error,
} = await useFetch("/api/exhibitors", {
  server: false,
  lazy: true,
  transform: (res) => res.data,
});
</script>
