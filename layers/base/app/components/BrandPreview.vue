<template>
  <section id="brand-preview" class="container mx-auto">
    <div class="flex flex-col items-center text-center">
      <h2 class="section-title">{{ content.title }}</h2>
    </div>

    <!-- Grid wrapper: full-bleed di mobile (sama seperti /brands), contained + rounded di sm+ -->
    <div
      v-if="pending || brandsWithLogo.length"
      ref="wrapRef"
      class="mt-10 mx-[calc(50%_-_50vw)] sm:mx-0"
    >
      <!-- Loading: skeleton grid mengikuti bentuk final (selalu penuh, tanpa cell kosong) -->
      <GridFill
        v-if="pending"
        :count="targetCols * targetRows"
        :min-col-width="false"
        :cols="targetCols"
        class="overflow-hidden sm:rounded-2xl"
      >
        <div
          v-for="n in targetCols * targetRows"
          :key="n"
          class="flex flex-col items-center px-2 pt-6 pb-6"
        >
          <Skeleton class="size-16 rounded-full" />
          <Skeleton class="mt-3 h-4 w-24" />
          <Skeleton class="mt-2 h-3 w-16" />
        </div>
      </GridFill>

      <!-- Grid brand -->
      <template v-else>
        <GridFill
          :count="layout.brands.length"
          :min-col-width="false"
          :cols="layout.cols"
          class="overflow-hidden sm:rounded-2xl"
        >
          <NuxtLink
            v-for="brand in layout.brands"
            :key="brand.slug"
            :to="localePath(`/brands/${brand.slug}`)"
            :aria-label="brand.brand_name"
            class="group hover:bg-muted/40 flex flex-col items-center overflow-hidden px-2 pt-6 pb-6 transition-colors"
          >
            <Avatar
              :model="{
                name: brand.brand_name,
                profile_image: brand.brand_logo,
              }"
              class="size-16 transition-transform duration-300 group-hover:scale-105"
              rounded="rounded-full"
              :colorful="false"
              :gradient-frame="hasInstagram(brand)"
            />

            <p
              class="text-foreground mt-3 line-clamp-2 min-h-[2.5em] px-2 text-center leading-tight font-medium tracking-tight text-balance"
            >
              {{ brand.brand_name }}
            </p>

            <p
              v-if="brand.business_categories?.length"
              class="text-muted-foreground mt-1 line-clamp-2 px-2 text-center text-xs tracking-tight sm:text-sm"
            >
              {{ brand.business_categories.join(", ") }}
            </p>
          </NuxtLink>
        </GridFill>
      </template>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="text-muted-foreground mt-10 flex justify-center text-sm tracking-tight"
    >
      {{ $t("brandPreview.empty") }}
    </div>

    <!-- Tombol -->
    <div
      v-if="!pending && brandsWithLogo.length"
      class="mt-8 flex justify-center"
    >
      <Button :to="localePath('/brands')" size="lg" class="active:scale-95">
        <span>{{ $t("ui.viewAllBrands") }}</span>
        <Icon name="lucide:arrow-right" />
      </Button>
    </div>
  </section>
</template>

<script setup>
import { useElementSize } from "@vueuse/core";
import { hasInstagram } from "../composables/useBrandHelpers";

// Batas atas kandidat brand (cukup untuk mengisi penuh sampai layar lebar).
const PREVIEW_MAX = 36;

const contentStore = useContentStore();
const localePath = useLocalePath();

const content = computed(() => contentStore.components.brandPreview);

// Fetch the full active set (not just a page) so the score sort below picks the
// globally highest-scoring brands, not merely the highest within the first page.
const { data, pending } = await useAsyncData("brand-preview", () =>
  $fetch("/api/exhibitors", { query: { per_page: 200 } }).catch(() => null),
);

const brandsWithLogo = computed(() => {
  const list = data.value?.data ?? [];
  return list
    .filter((b) => {
      const logo = b.brand_logo;
      if (!logo) return false;
      if (Array.isArray(logo)) return logo.length > 0;
      if (typeof logo === "object") return Object.keys(logo).length > 0;
      return Boolean(logo);
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, PREVIEW_MAX);
});

// Kolom dikontrol manual (auto-fit GridFill dimatikan) supaya grid SELALU
// penuh: jumlah brand = kelipatan kolom, tanpa filler/cell kosong.
// Lebar diukur dari wrapper grid (full-bleed di mobile -> ~100vw).
const wrapRef = ref(null);
const { width } = useElementSize(wrapRef);

const targetCols = computed(() => {
  const w = width.value;
  if (!w) return 3;
  if (w < 640) return 3; // mobile: 3 kolom
  if (w < 960) return 4;
  if (w < 1200) return 5;
  return 6;
});

const targetRows = computed(() => (targetCols.value <= 4 ? 5 : 4));

// Kolom efektif + daftar brand yang tampil; panjangnya selalu kelipatan kolom
// sehingga setiap baris terisi penuh oleh brand asli (tidak ada cell kosong).
const layout = computed(() => {
  const total = brandsWithLogo.value.length;
  if (!total) return { cols: targetCols.value, brands: [] };
  // Brand lebih sedikit dari kolom: kecilkan kolom agar satu baris tetap penuh.
  const cols = Math.min(targetCols.value, total);
  const fullRows = Math.floor(total / cols); // minimal 1
  const rows = Math.max(1, Math.min(targetRows.value, fullRows));
  return { cols, brands: brandsWithLogo.value.slice(0, rows * cols) };
});
</script>
