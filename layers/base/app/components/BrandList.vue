<template>
  <div class="relative isolate">
    <div class="container-wider">
      <div class="flex flex-col items-center text-center">
        <h2
          :class="{
            'section-title': route.name?.toString().includes('brands'),
            'text-foreground text-3xl font-semibold tracking-tighter sm:text-4xl':
              !['index', 'brands', 'edition-brands'].some((n) =>
                route.name?.toString().startsWith(n),
              ),
          }"
        >
          {{ content?.title }}
        </h2>

        <p class="section-description mt-1.5 max-w-2xl!">
          {{ content?.description }}
        </p>
      </div>
    </div>

    <BrandControls
      class="mt-4"
      v-model:search-input="searchInput"
      :available-events="availableEvents"
      :available-categories="availableCategories"
      :selected-events="selectedEvents"
      :selected-categories="selectedCategories"
      :total-active-filters="totalActiveFilters"
      :toggle-event-filter="toggleEventFilter"
      :toggle-category-filter="toggleCategoryFilter"
      :sort-options="sortOptions"
      :selected-sort-option="selectedSortOption"
      :change-selected-sort-option="changeSelectedSortOption"
      :pending="pending"
      :view-mode="viewMode"
      @refresh="refresh()"
      @clear-events="selectedEvents = []"
      @clear-categories="selectedCategories = []"
    />

    <div
      ref="resultsRef"
      class="container-wider scroll-mt-[calc(var(--navbar-height-mobile)*2)] [overflow-anchor:none] lg:scroll-mt-[calc(var(--navbar-height-desktop)*2)]"
    >
      <BrandResultsView
        v-model:view-mode="viewMode"
        class="mt-6"
        :pending="pending"
        :error="error"
        :all-brands="allBrands"
        :filtered-brands="filteredBrands"
        :brand-groups="brandGroups"
        :grouped-filtered-sorted="groupedFilteredSorted"
        :debounced-search-input="debouncedSearchInput"
        :brand-base-path="brandBasePath"
        :get-conjunction-img="getConjunctionImg"
        :show-project-column="showProjectColumn"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  edition: {
    type: [String, Number],
    default: null,
  },
});

const route = useRoute();
const content = computed(() => useContentStore().components.brandList);

const {
  searchInput,
  debouncedSearchInput,
  viewMode,
  sortOptions,
  selectedSortOption,
  changeSelectedSortOption,
  selectedCategories,
  selectedEvents,
  totalActiveFilters,
  toggleCategoryFilter,
  toggleEventFilter,
  brandBasePath,
  pending,
  error,
  refresh,
  brandGroups,
  allBrands,
  availableEvents,
  availableCategories,
  filteredBrands,
  groupedFilteredSorted,
  getConjunctionImg,
  showProjectColumn,
} = useBrandsListing({ edition: toRef(props, "edition") });

// Pull results into view when search/filter changes, so a virtualized,
// shortened result set isn't left below the fold after the user has scrolled.
const resultsRef = ref(null);

const scrollToResults = () => {
  if (typeof window === "undefined" || !resultsRef.value) return;
  // Only pull up when the results have already scrolled above the viewport top.
  // scroll-margin-top on the element lands them just below the sticky controls,
  // so the browser resolves the offset (no manual sticky math needed).
  if (resultsRef.value.getBoundingClientRect().top < 0) {
    resultsRef.value.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

watch([debouncedSearchInput, selectedCategories, selectedEvents], () => {
  nextTick(scrollToResults);
});
</script>
