<template>
  <div class="sm:container-wider">
    <div v-if="items.length" class="gallery-container">
      <FallbackNotice v-if="fallbackSource" :source="fallbackSource" class="mb-4" />

      <Lightbox :items="items" alt="Gallery" thumbnail-key="sm" full-key="xl">
        <template #trigger="{ openAt }">
          <!-- Grid (left-to-right): each tile is cropped to the event's chosen
               aspect ratio (PM One setting, default 1:1) via object-cover. -->
          <div class="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-4">
            <button
              v-for="(item, i) in items"
              :key="item.id ?? i"
              type="button"
              class="bg-muted block w-full cursor-zoom-in overflow-hidden rounded"
              :style="{ aspectRatio }"
              @click="openAt(i)"
            >
              <BlurImage
                :src="item.sm || item.url"
                :lqip="item.lqip"
                :alt="item.alt || 'Gallery'"
                loading="lazy"
                decoding="async"
                draggable="false"
                image-class="h-full w-full object-cover"
              />
            </button>
          </div>
        </template>
      </Lightbox>
    </div>
  </div>
</template>

<script setup>
// Gallery photos are managed in PM One and fetched per active event. PM One
// resolves the active event (is_active) and falls back to a previous event's
// gallery when the active one has no photos yet.
const { data: galleryData } = await useFetch("/api/event/gallery", {
  default: () => ({ data: [] }),
});

const items = computed(() => galleryData.value?.data ?? []);

// Aspect ratio comes from PM One (event setting), e.g. "4:5" -> CSS "4 / 5".
const aspectRatio = computed(() =>
  (galleryData.value?.meta?.aspect_ratio || "1:1").replace(":", " / ")
);

// Source edition when the photos were borrowed from a previous event.
const fallbackSource = computed(() => {
  const fb = galleryData.value?.meta?.fallback;
  return fb?.is_fallback ? fb.source_event : null;
});
</script>
