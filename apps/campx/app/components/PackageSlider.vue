<template>
  <section v-if="packages.length" class="space-y-4">
    <div class="container flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div class="max-w-2xl space-y-1">
        <NuxtLink
          v-if="moreHref"
          :to="moreHref"
          class="focusable group inline-flex items-center gap-x-2"
        >
          <h2 class="text-2xl font-semibold tracking-tighter sm:text-3xl">{{ title }}</h2>
          <Icon
            name="hugeicons:arrow-right-01"
            class="text-muted-foreground group-hover:text-foreground size-6 shrink-0 transition-colors"
          />
        </NuxtLink>
        <h2 v-else class="text-2xl font-semibold tracking-tighter sm:text-3xl">{{ title }}</h2>

        <p v-if="description" class="text-muted-foreground text-base tracking-tight text-pretty">
          {{ description }}
        </p>
      </div>
    </div>

    <Carousel
      v-slot="{ scrollPrev, scrollNext, canScrollPrev, canScrollNext }"
      class="focusable relative overflow-hidden"
      :opts="{ loop: false, align: 'start', dragFree: false, skipSnaps: true }"
      :plugins="[wheelGestures()]"
    >
      <CarouselContent class="carousel-mx -ml-3 *:select-none">
        <CarouselItem
          v-for="pkg in packages"
          :key="pkg.id"
          class="carousel-item basis-[280px] pl-3 lg:basis-[320px]"
        >
          <PackageCard :pkg="pkg" />
        </CarouselItem>
      </CarouselContent>

      <div class="mt-6 h-8">
        <div v-if="canScrollPrev || canScrollNext" class="container flex h-full justify-end">
          <ButtonGroup>
            <Button
              variant="outline"
              size="iconSm"
              :disabled="!canScrollPrev"
              aria-label="Sebelumnya"
              @click="scrollPrev"
            >
              <Icon name="lucide:arrow-left" class="size-4" />
            </Button>
            <Button
              variant="outline"
              size="iconSm"
              :disabled="!canScrollNext"
              aria-label="Berikutnya"
              @click="scrollNext"
            >
              <Icon name="lucide:arrow-right" class="size-4" />
            </Button>
            <Button v-if="moreHref" variant="outline" size="sm" class="font-medium" :to="moreHref">
              Lihat semua
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </Carousel>
  </section>
</template>

<script setup lang="ts">
import type { Package } from "~/data/types";

/**
 * The repo's established carousel shape (see EventSlider in panorama-events):
 * same Embla options, same `carousel-mx -ml-3` gutter math, same ButtonGroup
 * with prev/next plus a "view all" tail.
 */
defineProps<{
  title: string;
  packages: Package[];
  description?: string;
  moreHref?: string;
}>();

// The plugin is registered as a template global by the base layer, but that
// global is untyped, so a `lang="ts"` component has to pull it off the app.
const { $wheelGesturesPlugin } = useNuxtApp() as unknown as {
  $wheelGesturesPlugin: () => never;
};
const wheelGestures = $wheelGesturesPlugin;
</script>
