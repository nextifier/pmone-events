<template>
  <div>
    <div
      v-if="filteredBrands"
      class="text-muted-foreground text-sm tracking-tight"
    >
      Showing {{ filteredBrands.length }} brand<span
        v-if="filteredBrands.length !== 1"
        >s</span
      >
    </div>
    <div v-else class="skeleton h-4 w-36"></div>

    <div class="mt-4">
      <div v-if="pending">
        <div
          v-if="viewMode !== 'table'"
          :class="
            viewMode === 'grid'
              ? 'border-border bg-border grid grid-cols-3 gap-px overflow-hidden rounded-lg border sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]'
              : 'grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] sm:gap-x-2'
          "
        >
          <div
            v-for="index in viewMode === 'grid' ? 24 : 64"
            :key="index"
            class="skeleton rounded-lg"
            :class="viewMode === 'grid' ? 'bg-background aspect-square' : 'h-48'"
          />
        </div>
        <div v-else class="frame">
          <div
            class="frame-panel bg-background -m-px overflow-hidden rounded-lg p-4"
          >
            <div class="space-y-3">
              <div
                v-for="index in 12"
                :key="index"
                class="skeleton h-12 w-full rounded-md"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center gap-y-2 text-center"
      >
        <span class="text-primary text-2xl font-semibold tracking-tighter">
          Failed to get the data.
        </span>
        <span
          v-if="errorDetail"
          class="text-muted-foreground text-sm tracking-tight"
        >
          {{ errorDetail }}
        </span>
      </div>

      <div
        v-else-if="!allBrands?.length"
        class="mt-6 flex flex-col items-center justify-center gap-y-6 text-center"
      >
        <div class="perspective-midrange">
          <BrandListEmptyStateImage
            class="shadow-wrapper w-full max-w-80 rounded-md transition duration-300 hover:rotate-x-40"
          />
        </div>
        <span class="text-primary text-xl font-semibold tracking-tight">
          Brand list is coming soon. Check back later!
        </span>
      </div>

      <template v-else>
        <div v-if="mounted.table" v-show="viewMode === 'table'">
          <TableData
            v-if="filteredBrands?.length"
            :data="filteredBrands"
            :columns="brandTableColumns"
            :meta="{}"
            :pending="pending"
            model="brands"
            :searchable="false"
            :column-toggle="false"
            :show-add-button="false"
            :show-refresh-button="false"
            :display-only="true"
            :page-sizes="[]"
            :initial-pagination="{ pageIndex: 0, pageSize: 9999 }"
            :initial-sorting="[{ id: 'brand_name', desc: false }]"
          />
          <div v-else class="flex flex-col gap-y-4">
            <span class="text-4xl font-semibold tracking-tighter sm:text-5xl">
              No results found for
              <span class="font-semibold italic"
                >{{ debouncedSearchInput }}.</span
              >
            </span>
            <span class="text-base tracking-tight sm:text-lg">
              Maybe try a different keyword.
            </span>
          </div>
        </div>

        <div v-if="mounted.grid" v-show="viewMode === 'grid'">
          <div v-if="debouncedSearchInput">
            <GridFill
              v-if="filteredBrands?.length"
              :count="filteredBrands.length"
              min-col-width="260px"
              rounded="lg"
              :cols="2"
            >
              <BrandGridItem
                v-for="brand in filteredBrands"
                :key="brand.slug"
                :brand="brand"
                :brand-base-path="brandBasePath"
              />
            </GridFill>
            <div v-else class="flex flex-col gap-y-4">
              <span class="text-4xl font-semibold tracking-tighter sm:text-5xl">
                No results found for
                <span class="font-semibold italic"
                  >{{ debouncedSearchInput }}.</span
                >
              </span>
              <span class="text-base tracking-tight sm:text-lg">
                Maybe try a different keyword.
              </span>
            </div>
          </div>

          <div v-else class="space-y-10">
            <template
              v-for="(group, groupIndex) in brandGroups"
              :key="groupIndex"
            >
              <BrandConjunctionSeparator
                v-if="!group.is_primary && groupedBrandsAt(groupIndex)?.length"
                :group="group"
                :get-img="getConjunctionImg"
              />
              <GridFill
                v-if="groupedBrandsAt(groupIndex)?.length"
                :count="groupedBrandsAt(groupIndex).length"
                min-col-width="260px"
                rounded="lg"
                :cols="2"
              >
                <BrandGridItem
                  v-for="brand in groupedBrandsAt(groupIndex)"
                  :key="brand.slug"
                  :brand="brand"
                  :brand-base-path="brandBasePath"
                />
              </GridFill>
            </template>
            <BrandAndManyMore />
          </div>
        </div>

        <div v-if="mounted.card" v-show="viewMode === 'card'">
          <div v-if="debouncedSearchInput">
            <div
              v-if="filteredBrands?.length"
              class="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] sm:gap-x-2"
            >
              <BrandCard
                v-for="brand in filteredBrands"
                :key="brand.slug"
                :brand="brand"
                :brand-base-path="brandBasePath"
                :class="{
                  'col-span-2 sm:col-span-1': filteredBrands.length === 1,
                }"
              />
            </div>
            <div v-else class="flex flex-col gap-y-4">
              <span class="text-4xl font-semibold tracking-tighter sm:text-5xl">
                No results found for
                <span class="font-semibold italic"
                  >{{ debouncedSearchInput }}.</span
                >
              </span>
              <span class="text-base tracking-tight sm:text-lg">
                Maybe try a different keyword.
              </span>
            </div>
          </div>

          <div v-else class="space-y-10">
            <template
              v-for="(group, groupIndex) in brandGroups"
              :key="groupIndex"
            >
              <BrandConjunctionSeparator
                v-if="!group.is_primary && groupedBrandsAt(groupIndex)?.length"
                :group="group"
                :get-img="getConjunctionImg"
              />
              <div
                v-if="groupedBrandsAt(groupIndex)?.length"
                class="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] sm:gap-x-2"
              >
                <BrandCard
                  v-for="brand in groupedBrandsAt(groupIndex)"
                  :key="brand.slug"
                  :brand="brand"
                  :brand-base-path="brandBasePath"
                  :class="{
                    'col-span-2 sm:col-span-1':
                      groupedBrandsAt(groupIndex).length === 1,
                  }"
                />
              </div>
            </template>
            <BrandAndManyMore />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import GridFill from "./ui/grid-fill/GridFill.vue";

const props = defineProps({
  pending: { type: Boolean, default: false },
  error: { type: [Object, null], default: null },
  viewMode: { type: String, default: "grid" },
  allBrands: { type: Array, default: () => [] },
  filteredBrands: { type: Array, default: () => [] },
  brandGroups: { type: Array, default: () => [] },
  groupedFilteredSorted: { type: Map, default: () => new Map() },
  debouncedSearchInput: { type: String, default: "" },
  brandBasePath: { type: String, default: "/brands" },
  getConjunctionImg: { type: Function, required: true },
  brandTableColumns: { type: Array, default: () => [] },
});

const groupedBrandsAt = (idx) => props.groupedFilteredSorted.get(idx);

const errorDetail = computed(() => {
  const err = props.error;
  if (!err) return null;
  return err.statusMessage || err.message || null;
});

// Lazy-mount each view on first visit, then keep it in DOM and toggle
// visibility via v-show — switch back becomes pure CSS, zero mount cost.
const mounted = ref({
  grid: props.viewMode === "grid",
  card: props.viewMode === "card",
  table: props.viewMode === "table",
});

watch(
  () => props.viewMode,
  (mode) => {
    if (mode && !mounted.value[mode]) {
      mounted.value[mode] = true;
    }
  },
);
</script>
