<template>
  <Lightbox :items="lightboxItems" show-thumbnails show-counter show-caption>
    <template #trigger="{ openAt }">
      <div v-if="images.length" class="relative">
        <!-- One big frame plus four thumbnails once there is enough material.
             Below five photos the grid would leave holes, so it collapses to a
             single frame instead of padding with blanks. -->
        <div
          class="grid gap-2"
          :class="hasGrid ? 'sm:grid-cols-4 sm:grid-rows-2' : 'grid-cols-1'"
        >
          <button
            type="button"
            :aria-label="`Buka foto: ${images[0]!.alt}`"
            class="focusable bg-muted relative overflow-hidden rounded-xl"
            :class="hasGrid ? 'aspect-4/3 sm:col-span-2 sm:row-span-2 sm:aspect-auto' : 'aspect-4/3'"
            @click="openAt(0)"
          >
            <NuxtImg
              :src="images[0]!.src"
              :alt="images[0]!.alt"
              :width="images[0]!.width"
              :height="images[0]!.height"
              format="webp"
              preload
              sizes="100vw sm:50vw lg:640px"
              class="size-full object-cover"
            />
          </button>

          <button
            v-for="(image, index) in gridThumbs"
            :key="image.src"
            type="button"
            :aria-label="`Buka foto: ${image.alt}`"
            class="focusable bg-muted relative hidden overflow-hidden rounded-xl sm:block"
            @click="openAt(index + 1)"
          >
            <NuxtImg
              :src="image.src"
              :alt="image.alt"
              :width="image.width"
              :height="image.height"
              format="webp"
              loading="lazy"
              sizes="25vw lg:320px"
              class="size-full object-cover"
            />
          </button>
        </div>

        <Button
          v-if="images.length > 1"
          variant="secondary"
          size="sm"
          class="border-border absolute right-3 bottom-3 border"
          @click="openAt(0)"
        >
          <Icon name="hugeicons:image-01" class="size-4 shrink-0" />
          <span>Lihat {{ images.length }} foto</span>
        </Button>
      </div>

      <!-- Nothing photographed yet. Says so, instead of showing a broken frame. -->
      <div
        v-else
        class="bg-muted text-muted-foreground flex aspect-4/3 items-center justify-center rounded-xl"
      >
        <div class="space-y-2 text-center">
          <Icon :name="placeholderIcon" class="mx-auto size-8" />
          <p class="text-sm tracking-tight">Fotonya lagi kami siapkan</p>
        </div>
      </div>
    </template>
  </Lightbox>
</template>

<script setup lang="ts">
import { getCategory } from "~/data/categories";
import type { Package } from "~/data/types";

const props = defineProps<{ pkg: Package }>();

const images = computed(() =>
  [props.pkg.coverImage, ...props.pkg.photos].filter(
    (image): image is NonNullable<typeof image> => image !== null,
  ),
);

const hasGrid = computed(() => images.value.length >= 5);
const gridThumbs = computed(() => (hasGrid.value ? images.value.slice(1, 5) : []));

const placeholderIcon = computed(
  () => getCategory(props.pkg.categorySlugs[0] ?? "")?.icon ?? "hugeicons:tent",
);

const lightboxItems = computed(() =>
  images.value.map((image) => ({
    url: image.src,
    sm: image.src,
    alt: image.alt,
    caption: image.caption ?? image.alt,
  })),
);
</script>
