<template>
  <!-- Bentuk: bento foto. Satu tile besar plus empat kecil, jadi 4x2 slot
       terisi penuh tanpa sel kosong. Satu-satunya section dengan link di
       header, bukan di bawah konten. -->
  <section v-if="items.length === TILE_COUNT" id="gallery-preview">
    <div class="container">
      <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div class="max-w-2xl">
          <h2 class="section-title">{{ $t("galleryPreview.title") }}</h2>
          <p class="section-description mt-3">
            {{ $t("galleryPreview.description") }}
          </p>
        </div>

        <nuxt-link
          :to="localePath('/gallery')"
          class="text-foreground hover:text-accent flex items-center gap-x-1.5 font-semibold tracking-tight transition"
        >
          {{ $t("galleryPreview.cta") }}
          <Icon name="hugeicons:arrow-right-01" class="size-5 shrink-0" />
        </nuxt-link>
      </div>

      <div
        class="mt-10 grid aspect-[16/9] grid-cols-2 grid-rows-2 gap-1.5 sm:aspect-[16/7] sm:grid-cols-4"
      >
        <nuxt-link
          v-for="(item, i) in items"
          :key="item.id ?? i"
          :to="localePath('/gallery')"
          class="bg-muted block overflow-hidden rounded-2xl"
          :class="{ 'col-span-2 row-span-2': i === 0 }"
        >
          <BlurImage
            :src="i === 0 ? item.md || item.url : item.sm || item.url"
            :lqip="item.lqip"
            :alt="item.alt || `${eventName} ${i + 1}`"
            loading="lazy"
            decoding="async"
            draggable="false"
            image-class="h-full w-full object-cover"
          />
        </nuxt-link>
      </div>
    </div>
  </section>
</template>

<script setup>
// 1 tile besar (2x2) + 4 tile kecil = 8 slot di grid 4x2, terisi pas.
const TILE_COUNT = 5;

const localePath = useLocalePath();

// Foto dikelola di PM One per event aktif. PM One jatuh ke galeri edisi
// sebelumnya kalau event aktif belum punya foto.
const { data: galleryData } = await useFetch("/api/event/gallery", {
  default: () => ({ data: [] }),
});

const items = computed(() =>
  (galleryData.value?.data ?? []).slice(0, TILE_COUNT),
);

const event = useEvent();
const eventName = computed(() => event.title || "Event");
</script>
