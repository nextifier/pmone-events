<template>
  <div
    ref="containerRef"
    :class="!isCard && 'mx-[calc(50%_-_50vw)] sm:mx-0'"
  >
    <div
      :style="{ height: `${totalSize}px`, width: '100%', position: 'relative' }"
    >
      <div
        v-for="item in visibleRows"
        :key="item.v.key"
        :data-index="item.v.index"
        :ref="measureElement"
        :style="{
          position: 'absolute',
          top: '0px',
          left: '0px',
          width: '100%',
          transform: `translateY(${item.v.start - scrollMargin}px)`,
        }"
      >
        <!-- Separator antar group (conjunction) -->
        <div v-if="item.row?.kind === 'separator'" class="pt-10 pb-5">
          <BrandConjunctionSeparator
            :group="item.row.group"
            :get-img="getConjunctionImg"
          />
        </div>

        <!-- Footer "and many more" -->
        <div v-else-if="item.row?.kind === 'footer'" class="pt-10">
          <BrandAndManyMore />
        </div>

        <!-- Baris brand: GRID variant (frame hairline ala GridFill) -->
        <div
          v-else-if="item.row?.kind === 'brandRow' && variant === 'grid'"
          class="border-border overflow-hidden border-r border-l"
          :class="[
            item.row.isFirstRow && 'border-t sm:rounded-t-lg',
            item.row.isLastRow && 'border-b sm:rounded-b-lg',
          ]"
        >
          <div
            class="grid grid-rows-[repeat(4,auto)] gap-y-2"
            :style="{
              gridTemplateColumns: `repeat(${item.row.cols}, minmax(0, 1fr))`,
            }"
          >
            <BrandGridItem
              v-for="(brand, c) in item.row.brands"
              :key="brand.slug"
              v-memo="[brand.slug, item.row.cols]"
              variant="grid"
              :brand="brand"
              :brand-base-path="brandBasePath"
              :cell-class="[
                c > 0 && 'border-l border-border',
                !item.row.isFirstRow && 'border-t border-border',
              ]"
            />
            <div
              v-for="f in item.row.fillerCount"
              :key="`f-${f}`"
              class="bg-pattern-diagonal border-border row-span-4"
              :class="['border-l', !item.row.isFirstRow && 'border-t']"
            />
          </div>
        </div>

        <!-- Baris brand: CARD variant (kartu bordered + gap) -->
        <div
          v-else-if="item.row?.kind === 'brandRow'"
          class="grid grid-rows-[repeat(4,auto)] gap-x-2 gap-y-2"
          :class="item.row.isLastRow ? '' : 'pb-4'"
          :style="{
            gridTemplateColumns: `repeat(${item.row.cols}, minmax(0, 1fr))`,
          }"
        >
          <BrandGridItem
            v-for="brand in item.row.brands"
            :key="brand.slug"
            v-memo="[brand.slug, item.row.cols]"
            variant="card"
            :brand="brand"
            :brand-base-path="brandBasePath"
          />
        </div>
      </div>
    </div>

    <!-- One shared lightbox for all promos; cards open it at their index -->
    <Lightbox
      v-model:open="lbOpen"
      v-model:index="lbIndex"
      :items="promoLightbox.items"
      show-download
    >
      <!-- non-empty so Lightbox doesn't fall back to its default thumbnail grid -->
      <template #trigger><span class="hidden" aria-hidden="true" /></template>
    </Lightbox>
  </div>
</template>

<script setup>
import {
  computed,
  ref,
  onMounted,
  onActivated,
  onBeforeUnmount,
  provide,
  watch,
  nextTick,
} from "vue";
import { useWindowVirtualizer } from "@tanstack/vue-virtual";
import { Lightbox } from "./ui/lightbox";

const props = defineProps({
  variant: { type: String, default: "grid" }, // 'grid' | 'card'
  brandGroups: { type: Array, default: () => [] },
  groupedFilteredSorted: { type: Map, default: () => new Map() },
  filteredBrands: { type: Array, default: () => [] },
  debouncedSearchInput: { type: String, default: "" },
  brandBasePath: { type: String, default: "/brands" },
  getConjunctionImg: { type: Function, required: true },
});

const isCard = computed(() => props.variant === "card");

const containerRef = ref(null);
const { columnCount } = useGridColumns(containerRef, {
  minColWidth: computed(() => (isCard.value ? 280 : 260)),
  gap: computed(() => (isCard.value ? 8 : 1)),
});

// ----- Shared promo lightbox -----
// Flatten every displayed brand's promotions into one list (in display order)
// so the lightbox can swipe across all of them. Each card opens it at the
// index where its own promos start, via the injected `brandPromoOpen`.
const displayedBrands = computed(() => {
  if (props.debouncedSearchInput) return props.filteredBrands || [];
  const out = [];
  (props.brandGroups || []).forEach((_, idx) => {
    out.push(...(props.groupedFilteredSorted.get(idx) || []));
  });
  return out;
});

const promoLightbox = computed(() => {
  const items = [];
  const startBySlug = new Map();
  for (const brand of displayedBrands.value) {
    const promos = (brand.promotions || []).filter(
      (p) => p && (p.sm || p.md || p.lg || p.xl || p.url),
    );
    if (!promos.length) continue;
    startBySlug.set(brand.slug, items.length);
    for (const p of promos) {
      items.push({
        sm: p.sm || p.md || p.lg || p.xl || p.url,
        md: p.md || p.sm || p.lg || p.xl || p.url,
        lg: p.lg || p.xl || p.md || p.sm || p.url,
        xl: p.xl || p.lg || p.md || p.sm || p.url,
        url: p.url || p.xl || p.lg || p.md || p.sm,
        alt: p.alt || brand.brand_name,
        caption: brand.brand_name,
      });
    }
  }
  return { items, startBySlug };
});

const lbOpen = ref(false);
const lbIndex = ref(0);
const openPromo = (slug) => {
  const start = promoLightbox.value.startBySlug.get(slug);
  if (start == null) return;
  lbIndex.value = start;
  lbOpen.value = true;
};
provide("brandPromoOpen", openPromo);

// ----- Bangun flat rows heterogen -----
const flatRows = computed(() => {
  const cols = columnCount.value || 2;
  const rows = [];

  const pushBrandRows = (brands, groupIndex) => {
    const total = Math.ceil(brands.length / cols);
    for (let r = 0; r < total; r++) {
      const slice = brands.slice(r * cols, r * cols + cols);
      rows.push({
        kind: "brandRow",
        brands: slice,
        groupIndex,
        rowInGroup: r,
        isFirstRow: r === 0,
        isLastRow: r === total - 1,
        fillerCount: r === total - 1 ? cols - slice.length : 0,
        cols,
      });
    }
  };

  if (props.debouncedSearchInput) {
    pushBrandRows(props.filteredBrands || [], -1);
  } else {
    (props.brandGroups || []).forEach((group, idx) => {
      const brands = props.groupedFilteredSorted.get(idx) || [];
      if (!brands.length) return;
      if (!group.is_primary)
        rows.push({ kind: "separator", group, groupIndex: idx });
      pushBrandRows(brands, idx);
    });
    rows.push({ kind: "footer" });
  }
  return rows;
});

const estimateRow = (row) => {
  if (!row) return 220;
  if (row.kind === "separator") return 96;
  if (row.kind === "footer") return 160;
  return isCard.value ? 248 : 216;
};

const rowKey = (row, i) => {
  if (!row) return `r-${i}`;
  if (row.kind === "brandRow") return `b-${row.groupIndex}-${row.rowInGroup}`;
  if (row.kind === "separator") return `sep-${row.groupIndex}`;
  return `${row.kind}-${i}`;
};

// ----- Window virtualizer -----
const scrollMargin = ref(0);
const measureScrollMargin = () => {
  if (!containerRef.value || typeof window === "undefined") return;
  scrollMargin.value =
    containerRef.value.getBoundingClientRect().top + window.scrollY;
};

const virtualizerOptions = computed(() => ({
  count: flatRows.value.length,
  estimateSize: (i) => estimateRow(flatRows.value[i]),
  overscan: 6,
  scrollMargin: scrollMargin.value,
  getItemKey: (i) => rowKey(flatRows.value[i], i),
}));

const rowVirtualizer = useWindowVirtualizer(virtualizerOptions);
const totalSize = computed(() => rowVirtualizer.value.getTotalSize());
const visibleRows = computed(() =>
  rowVirtualizer.value
    .getVirtualItems()
    .map((v) => ({ v, row: flatRows.value[v.index] })),
);

const measureElement = (el) => {
  if (el) rowVirtualizer.value?.measureElement(el);
};

// Variant berubah (grid<->card) tanpa remount: paksa virtualizer hitung ulang
// estimasi tinggi baris (216 vs 248) supaya totalSize & layout akurat.
watch(
  () => props.variant,
  () => rowVirtualizer.value?.measure(),
);

let onResize = null;
onMounted(() => {
  measureScrollMargin();
  onResize = () => measureScrollMargin();
  window.addEventListener("resize", onResize, { passive: true });
});

// Halaman /brands ada di keepalive: saat balik dari detail, komponen
// di-reaktivasi (bukan mount ulang). DOM sempat dilepas -> ukuran elemen
// virtualizer jadi 0 -> totalSize 0 -> semua baris menumpuk di translateY(0).
// Ukur ulang scrollMargin + reset cache pengukuran supaya layout pulih.
onActivated(() => {
  measureScrollMargin();
  rowVirtualizer.value?.measure();
  nextTick(() => {
    measureScrollMargin();
    rowVirtualizer.value?.measure();
  });
});

onBeforeUnmount(() => {
  if (onResize) window.removeEventListener("resize", onResize);
  onResize = null;
});
</script>
