<template>
  <Carousel
    v-if="items?.length"
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
    <CarouselContent class="carousel-mx -ml-2 *:select-none">
      <CarouselItem
        v-for="(item, index) in items"
        :key="index"
        class="carousel-item max-w-[400px] basis-[280px] pl-2 lg:basis-[320px] 2xl:basis-[20%]"
      >
        <ExperienceCard :item="item" />
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

          <!-- <Button variant="outline" size="sm" class="font-medium" to="/experiences">
            View all
          </Button> -->
        </ButtonGroup>
      </div>
    </div>
  </Carousel>
</template>

<script setup>
const props = defineProps({
  items: Array,
});
</script>
