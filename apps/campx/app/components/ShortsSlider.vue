<template>
  <DialogShorts />
  <Carousel
    v-if="shorts?.length"
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
        v-for="(short, index) in shorts"
        :key="index"
        class="carousel-item basis-[160px] pl-2 lg:basis-[240px]"
      >
        <button
          class="group flex w-full flex-col gap-y-2 text-left transition active:scale-95"
          @click="
            uiStore.openShortsDialog(
              `https://www.youtube.com/embed/${short.videoId}`,
            )
          "
        >
          <div
            class="bg-muted relative isolate aspect-[9/16] w-full overflow-hidden rounded-xl"
          >
            <NuxtImg
              v-if="short.thumb || short.thumbGenerated"
              :src="
                short.thumb && short.thumb != ''
                  ? short.thumb
                  : short.thumbGenerated
              "
              :alt="short.caption ?? ''"
              class="relative z-10 h-full w-full object-cover"
              sizes="240px lg:360px"
              format="webp"
              loading="lazy"
            />

            <div
              class="absolute inset-0 z-20 hidden items-center justify-center bg-black/40 group-hover:flex"
            >
              <div
                class="flex size-12 items-center justify-center rounded-full bg-white/30 text-white outline -outline-offset-6 outline-white transition hover:bg-white/60 active:scale-95"
              >
                <Icon
                  name="hugeicons:play"
                  class="size-6"
                />
              </div>
            </div>
          </div>

          <p
            v-if="short.caption"
            class="text-sm font-medium tracking-tight text-black sm:text-base dark:text-white"
          >
            {{ short.caption }}
          </p>
        </button>
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
        </ButtonGroup>
      </div>
    </div>
  </Carousel>
</template>

<script setup>
const uiStore = useUiStore();
const shorts = useShortStore().list;
</script>
