<template>
  <div class="container space-y-10 py-10 lg:space-y-14 lg:py-16">
    <header class="max-w-3xl space-y-3">
      <h1 class="text-4xl font-medium tracking-tighter text-balance sm:text-5xl">
        Galeri CampX
      </h1>
      <p class="text-muted-foreground max-w-3xl text-base tracking-tight text-pretty sm:text-lg">
        Suasana camping di tepi Waduk Jatiluhur dan di tepi sungai Cikidang, apa adanya.
      </p>
    </header>

    <div class="flex flex-wrap gap-2">
      <Button
        v-for="option in filterOptions"
        :key="option.value"
        :variant="activeFilter === option.value ? 'default' : 'outline'"
        size="sm"
        @click="activeFilter = option.value"
      >
        {{ option.label }}
        <span class="text-xs tabular-nums opacity-70">{{ option.count }}</span>
      </Button>
    </div>

    <Lightbox :items="lightboxItems" show-thumbnails show-counter show-caption>
      <template #trigger="{ openAt }">
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          <button
            v-for="(item, index) in visibleMedia"
            :key="item.src"
            type="button"
            :aria-label="`Buka foto: ${item.alt}`"
            class="focusable bg-muted relative aspect-4/5 overflow-hidden rounded-lg"
            @click="openAt(index)"
          >
            <NuxtImg
              :src="item.src"
              :alt="item.alt"
              :width="item.width"
              :height="item.height"
              format="webp"
              loading="lazy"
              sizes="200px sm:260px lg:320px"
              class="size-full object-cover"
            />
          </button>
        </div>
      </template>
    </Lightbox>

    <Empty v-if="!visibleMedia.length" class="border-dashed">
      <EmptyMedia>
        <Icon name="hugeicons:image-01" class="size-6" />
      </EmptyMedia>
      <EmptyHeader>Belum ada foto di sini</EmptyHeader>
      <EmptyContent>Coba pilih cabang yang lain.</EmptyContent>
    </Empty>
  </div>
</template>

<script setup lang="ts">
import { LOCATIONS } from "~/data/locations";
import { PUBLIC_PACKAGES } from "~/data/packages";
import type { LocationSlug, MediaRef } from "~/data/types";

usePageMeta("galeri");

defineOptions({ name: "galeri" });

type GalleryItem = MediaRef & { locationSlug: LocationSlug };

/**
 * Branch galleries first, then whatever the packages add. Deduped by `src`,
 * because a package cover and a branch gallery often point at the same file.
 */
const allMedia = computed<GalleryItem[]>(() => {
  const seen = new Set<string>();
  const out: GalleryItem[] = [];

  const push = (media: MediaRef | null, locationSlug: LocationSlug) => {
    if (!media || seen.has(media.src)) return;
    seen.add(media.src);
    out.push({ ...media, locationSlug });
  };

  for (const location of LOCATIONS) {
    push(location.heroMedia, location.slug);
    location.gallery.forEach((media) => push(media, location.slug));
  }

  for (const pkg of PUBLIC_PACKAGES) {
    push(pkg.coverImage, pkg.locationSlug);
    pkg.photos.forEach((media) => push(media, pkg.locationSlug));
  }

  return out;
});

const activeFilter = ref<"all" | LocationSlug>("all");

const filterOptions = computed(() => [
  { value: "all" as const, label: "Semua", count: allMedia.value.length },
  ...LOCATIONS.map((location) => ({
    value: location.slug,
    label: location.shortName,
    count: allMedia.value.filter((media) => media.locationSlug === location.slug).length,
  })),
]);

const visibleMedia = computed(() =>
  activeFilter.value === "all"
    ? allMedia.value
    : allMedia.value.filter((media) => media.locationSlug === activeFilter.value),
);

const lightboxItems = computed(() =>
  visibleMedia.value.map((media) => ({
    url: media.src,
    sm: media.src,
    alt: media.alt,
    caption: media.caption ?? media.alt,
  })),
);
</script>
