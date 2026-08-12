<template>
  <!-- Bentuk: bento foto. Satu tile besar plus empat kecil, jadi 4x2 slot
       terisi penuh tanpa sel kosong. Satu-satunya section dengan link di
       header, bukan di bawah konten. -->
  <section v-if="visible" id="gallery-preview">
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

      <!-- Satu link untuk seluruh bento. Lima link dengan tujuan identik berarti
           lima tab stop bernama sama, dan namanya cuma diambil dari fallback
           alt. Tinggi tile diatur per tile di mobile: container yang dikunci
           aspect-ratio membuat BlurImage jatuh ke tinggi natural gambar dan
           tumpah keluar section. -->
      <nuxt-link
        :to="localePath('/gallery')"
        :aria-label="$t('galleryPreview.cta')"
        class="focus-visible:outline-ring mt-10 grid grid-cols-2 gap-1.5 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 sm:aspect-[16/7] sm:grid-cols-4 sm:grid-rows-2"
      >
        <div
          v-for="(item, i) in items"
          :key="item.id ?? i"
          class="bg-muted overflow-hidden rounded-2xl"
          :class="
            i === 0
              ? 'col-span-2 aspect-[16/9] sm:row-span-2 sm:aspect-auto'
              : 'aspect-[4/3] sm:aspect-auto'
          "
        >
          <!-- alt sengaja kosong. Tile-nya dekoratif di dalam link yang sudah
               punya nama, dan alt dari PM One isinya nama file kamera
               ("DSC03488"), yang cuma jadi kebisingan buat screen reader. -->
          <BlurImage
            :src="i === 0 ? item.md || item.url : item.sm || item.url"
            :lqip="item.lqip"
            alt=""
            loading="lazy"
            decoding="async"
            draggable="false"
            image-class="h-full w-full object-cover"
          />
        </div>
      </nuxt-link>
    </div>
  </section>
</template>

<script setup>
// 1 tile besar (2x2) + 4 tile kecil = 8 slot di grid 4x2, terisi pas. Bento-nya
// butuh tepat lima foto, jadi section-nya diam kalau galerinya lebih tipis;
// pola yang sama dipakai BrandPreview (minimum 10 logo, plus ?show-brands).
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

const forced = useForceShow("show-gallery");
const visible = computed(
  () => forced.value || items.value.length === TILE_COUNT,
);
</script>
