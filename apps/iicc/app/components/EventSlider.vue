<template>
  <Carousel
    v-if="events?.length"
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
    <CarouselContent class="carousel-mx-wider -ml-3 *:select-none">
      <CarouselItem
        v-for="(event, index) in events.slice(0, 10)"
        :key="index"
        class="carousel-item basis-[280px] pl-3 lg:basis-[320px]"
      >
        <EventCard :event="event" />
      </CarouselItem>
    </CarouselContent>

    <div class="mt-6 h-8">
      <div
        v-if="canScrollPrev || canScrollNext"
        class="container-wider flex h-full justify-end"
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
            :to="localePath('/events')"
          >
            View all
          </Button>
        </ButtonGroup>
      </div>
    </div>
  </Carousel>
</template>

<script setup>
const localePath = useLocalePath();

const props = defineProps({
  events: Array,
});
</script>
