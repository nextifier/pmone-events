<template>
  <div class="sm:container-wider">
    <div v-if="items.length" class="gallery-container">
      <Lightbox :items="items" alt="Gallery" thumbnail-key="sm" full-key="xl">
        <template #trigger="{ openAt }">
          <!-- Masonry (CSS columns): photos keep their native aspect ratio, never cropped. -->
          <div class="columns-2 gap-1 sm:columns-3 lg:columns-4">
            <button
              v-for="(item, i) in items"
              :key="item.id ?? i"
              type="button"
              class="bg-muted mb-1 block w-full cursor-zoom-in overflow-hidden rounded break-inside-avoid"
              @click="openAt(i)"
            >
              <img
                :src="item.sm || item.url"
                :alt="item.alt || 'Gallery'"
                :width="item.width || undefined"
                :height="item.height || undefined"
                loading="lazy"
                decoding="async"
                draggable="false"
                class="h-auto w-full"
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
</script>
