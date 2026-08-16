<template>
  <div class="space-y-6">
    <section v-for="group in groups" :key="group.id" class="space-y-2">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-medium tracking-tight">{{ group.label }}</h3>
        <Button
          v-if="group.selected.length"
          variant="link"
          size="xs"
          @click="group.clear()"
        >
          Hapus
        </Button>
      </div>

      <div class="space-y-1">
        <label
          v-for="facet in group.facets"
          :key="facet.value"
          class="hover:bg-muted flex cursor-pointer items-center gap-x-2.5 rounded-md px-2 py-1.5 transition-colors"
        >
          <Checkbox
            :model-value="group.selected.includes(facet.value)"
            @update:model-value="group.toggle(facet.value)"
          />
          <Icon v-if="facet.icon" :name="facet.icon" class="text-muted-foreground size-4 shrink-0" />
          <span class="flex-1 text-sm tracking-tight">{{ facet.label }}</span>
          <span class="text-muted-foreground text-xs tabular-nums sm:text-sm">{{ facet.count }}</span>
        </label>
      </div>
    </section>

    <section class="space-y-2">
      <h3 class="text-base font-medium tracking-tight">Ketersediaan</h3>
      <label class="hover:bg-muted flex cursor-pointer items-center gap-x-2.5 rounded-md px-2 py-1.5 transition-colors">
        <Checkbox
          :model-value="catalog.includeUnavailable.value"
          @update:model-value="catalog.includeUnavailable.value = !catalog.includeUnavailable.value"
        />
        <span class="flex-1 text-sm tracking-tight">Tampilkan yang lagi tidak tersedia</span>
      </label>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { usePackageCatalog } from "~/composables/usePackageCatalog";

const props = defineProps<{ catalog: ReturnType<typeof usePackageCatalog> }>();

const catalog = props.catalog;

/** Only the category facets carry an icon, so the shared shape makes it optional. */
interface FacetGroup {
  id: string;
  label: string;
  facets: { value: string; label: string; count: number; icon?: string }[];
  selected: string[];
  toggle: (value: string) => void;
  clear: () => void;
}

/**
 * One shape for every facet group, so the template stays a single loop instead
 * of four near-identical blocks.
 */
const groups = computed<FacetGroup[]>(() => [
  {
    id: "lokasi",
    label: "Lokasi",
    facets: catalog.locationFacets.value,
    selected: catalog.selectedLocations.value,
    toggle: catalog.toggleLocation,
    clear: () => (catalog.selectedLocations.value = []),
  },
  {
    id: "tipe",
    label: "Tipe",
    facets: catalog.typeFacets.value,
    selected: catalog.selectedTypes.value,
    toggle: catalog.toggleType,
    clear: () => (catalog.selectedTypes.value = []),
  },
  {
    id: "kategori",
    label: "Kategori",
    facets: catalog.categoryFacets.value,
    selected: catalog.selectedCategories.value,
    toggle: catalog.toggleCategory,
    clear: () => (catalog.selectedCategories.value = []),
  },
  {
    id: "untuk",
    label: "Cocok untuk",
    facets: catalog.audienceFacets.value,
    selected: catalog.selectedAudiences.value,
    toggle: catalog.toggleAudience,
    clear: () => (catalog.selectedAudiences.value = []),
  },
]);
</script>
