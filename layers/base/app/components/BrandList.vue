<template>
  <div class="container-wider">
    <div class="flex flex-col items-center text-center">
      <h2
        :class="{
          'section-title': ['brands'].includes(route.name),
          'text-primary text-3xl font-semibold tracking-tighter sm:text-4xl': ![
            'index',
            'brands',
          ].includes(route.name),
        }"
      >
        {{ content.title }}
      </h2>

      <p class="section-description mt-3">
        {{ content.description }}
      </p>
    </div>

    <div class="mx-auto mt-6 flex max-w-lg flex-col gap-y-4 sm:mt-8">
      <div class="flex flex-col items-end gap-y-3">
        <div class="group relative h-full w-full">
          <input
            type="text"
            v-model="searchInput"
            ref="searchInputEl"
            class="input-base peer h-10 px-9 py-2 text-sm tracking-tight"
            placeholder="Search any brand or category"
          />

          <IconSearch
            class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400 peer-focus:text-gray-400"
          />

          <span
            id="shortcut-key"
            class="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 items-center justify-center gap-x-0.5 transition peer-placeholder-shown:flex peer-focus-within:hidden"
          >
            <kbd class="keyboard-symbol">{{ metaSymbol }} K</kbd>
          </span>

          <button
            id="clear-input"
            type="button"
            @click="
              searchInput = '';
              $refs.searchInputEl.focus();
            "
            class="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-gray-100 transition-colors peer-placeholder-shown:hidden hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            <IconClose class="h-3" />
          </button>
        </div>

        <div class="flex gap-x-1.5">
          <DropdownMenu :modal="false">
            <DropdownMenuTrigger as-child>
              <button
                class="group border-border flex h-full w-40 items-center justify-between gap-x-3 rounded-lg border px-2.5 py-2 tracking-tight transition sm:w-44"
                aria-label="Sort by"
              >
                <div class="text-muted-foreground flex items-center gap-x-1.5">
                  <IconSort class="size-4 shrink-0" />
                  <span class="truncate text-sm">{{
                    selectedSortOption.label
                  }}</span>
                </div>
                <IconChevronDown
                  class="size-3 shrink-0 transition group-data-[state=open]:rotate-180"
                />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              class="flex w-40 flex-col gap-y-1 rounded-lg px-1 py-2 sm:w-44"
            >
              <DropdownMenuItem
                v-for="(item, index) in sortOptions"
                :key="index"
                v-slot="{ active, close }"
                as-child
              >
                <button
                  :aria-label="`Sort by ${item.label}`"
                  class="relative flex w-full cursor-pointer items-center gap-x-4 rounded-md py-2 pr-4 pl-8 tracking-tight text-black ring-black ring-offset-2 ring-offset-white transition hover:bg-gray-100 hover:text-black focus-visible:ring-1 focus-visible:outline-hidden active:scale-98 dark:text-white dark:ring-white dark:ring-offset-gray-950 dark:hover:bg-gray-900 dark:hover:text-white"
                  :class="{
                    'bg-gray-100 text-black dark:bg-gray-900 dark:text-white':
                      selectedSortOption.val === item.val && !active,
                    'bg-blue-600 text-white dark:bg-blue-600 dark:text-white':
                      active,
                  }"
                  @click="changeSelectedSortOption(item)"
                >
                  <IconCheck
                    v-if="selectedSortOption.val === item.val"
                    class="absolute top-1/2 left-2 size-5 -translate-y-1/2"
                  />
                  <span class="text-sm">{{ item.label }}</span>
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            aria-label="Refresh data"
            @click="refresh()"
            class="text-muted-foreground hover:bg-muted flex aspect-square size-10 items-center justify-center rounded-full transition active:scale-98"
            v-tippy="'Refresh'"
          >
            <IconRefresh class="size-4" :class="{ 'animate-spin': pending }" />
          </button>
        </div>
      </div>
    </div>

    <div class="mt-6 lg:mt-10">
      <div v-if="filteredBrands" class="text-muted-foreground tracking-tight">
        Showing {{ filteredBrands.length }} brand<span
          v-if="filteredBrands.length !== 1"
          >s</span
        >
      </div>
      <div v-else class="skeleton h-4 w-36"></div>
    </div>

    <div class="mt-3">
      <div v-if="pending">
        <div
          class="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] sm:gap-x-4"
        >
          <BrandCardSkeleton v-for="index in 64" :key="index" />
        </div>
      </div>

      <div
        v-else-if="error"
        class="flex items-center justify-center text-center"
      >
        <span class="text-primary text-2xl font-semibold tracking-tighter"
          >Failed to get the data.</span
        >
      </div>

      <div
        v-else-if="brands?.length === 0"
        class="mt-6 flex flex-col items-center justify-center gap-y-6 text-center"
      >
        <div class="perspective-midrange">
          <BrandListEmptyStateImage
            class="shadow-wrapper w-full max-w-80 rounded-md transition duration-300 hover:rotate-x-40"
          />
        </div>

        <span class="text-primary text-xl font-semibold tracking-tight"
          >Brand list is coming soon 🤩 Check back later!
        </span>
      </div>

      <div v-else>
        <div v-if="filteredBrands?.length" class="space-y-10">
          <div
            class="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] sm:gap-x-4"
            v-auto-animate="{ duration: 300 }"
          >
            <BrandCard
              v-for="(brand, index) in filteredBrands"
              :key="index"
              :brand="brand"
              :class="{
                'col-span-2 sm:col-span-1': filteredBrands?.length === 1,
              }"
            />
          </div>

          <div
            v-if="!searchInput"
            class="flex flex-col items-center justify-center"
          >
            <span
              class="text-muted-foreground/20 text-center text-[clamp(2rem,11vw,6rem)] !leading-[1.1] font-semibold tracking-tighter"
              >and many more!</span
            >
          </div>
        </div>

        <div v-else class="flex flex-col gap-y-4">
          <span class="text-4xl font-semibold tracking-tighter sm:text-5xl"
            >No results found for
            <span class="font-semibold italic">{{ searchInput }}.</span></span
          >

          <span class="text-base tracking-tight sm:text-lg"
            >Maybe try a different keyword.</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { refDebounced } from "@vueuse/core";

const content = computed(() => useContentStore().components.brandList);
const config = useRuntimeConfig();
const route = useRoute();

const searchInput = defineModel({ default: "" });
const debouncedSearchInput = refDebounced(searchInput, 300);

const sortOptions = [
  {
    label: "Brand Name",
    val: "brand_name",
  },
  {
    label: "Booth Number",
    val: "booth_number",
  },
  {
    label: "Last Created",
    val: "-created_at",
  },
];

const selectedSortOption = ref(sortOptions[0]);

const changeSelectedSortOption = (param) => {
  selectedSortOption.value = param;
};

const selectedSortOptionValue = computed(() => selectedSortOption.value.val);

// const {
//   data: brands,
//   refresh,
//   pending,
//   error,
// } = await useFetch(`${useAppConfig().app.apiUrl}/api/exhibitors`, {
//   query: {
//     "filter[is_published]": 1,
//     // "filter[exhibit_at_the_edition_of]": "2024",
//     // sort: selectedSortOptionValue,
//   },
//   server: ["brands"].includes(route.name) ? true : false,
//   lazy: true,
//   key: "fetchExhibitors",
// });

const brands = ref([]);
const refresh = () => {};
const pending = ref(0);
const error = ref(0);

const filteredBrands = computed(() => {
  // Filtering
  let results = brands?.value?.filter((brand) => {
    return (
      brand.brand_name
        .toLowerCase()
        .includes(debouncedSearchInput.value.toLowerCase()) ||
      brand.company_name
        ?.toLowerCase()
        .includes(debouncedSearchInput.value.toLowerCase()) ||
      brand.brand_description
        ?.toLowerCase()
        .includes(debouncedSearchInput.value.toLowerCase()) ||
      brand.business_categories
        ?.toString()
        .toLowerCase()
        .includes(debouncedSearchInput.value.toLowerCase()) ||
      brand.booth_number
        ?.replace(/[^\w\s]/gi, "")
        .replace(/\s/g, "")
        .toLowerCase()
        .includes(
          debouncedSearchInput.value
            .replace(/[^\w\s]/gi, "")
            .replace(/\s/g, "")
            .toLowerCase(),
        )
    );
  });

  // Sorting
  if (results?.length) {
    if (selectedSortOption.value.val === "brand_name") {
      results.sort((a, b) => a.brand_name.localeCompare(b.brand_name));
    } else if (selectedSortOption.value.val === "-created_at") {
      results.sort((a, b) => b.created_at.localeCompare(a.created_at));
    } else if (selectedSortOption.value.val === "booth_number") {
      results.sort((a, b) => {
        // Normalize booth numbers: replace special characters, handle nulls
        const normalize = (value) => {
          if (!value) return null; // Return null explicitly for sorting logic
          return value
            .split("&")[0] // Take the first booth in case of multiple
            .replace(/[^\w\s-]/gi, "") // Remove non-alphanumeric characters except hyphens
            .replace(/\s/g, "") // Remove spaces
            .toUpperCase(); // Make it case-insensitive
        };

        const boothA = normalize(a.booth_number);
        const boothB = normalize(b.booth_number);

        // If boothA is null, place it after boothB
        if (boothA === null && boothB !== null) return 1;
        if (boothB === null && boothA !== null) return -1;

        // If both are null, consider them equal
        if (boothA === null && boothB === null) return 0;

        // Compare non-null booth numbers
        return boothA.localeCompare(boothB, undefined, { numeric: true });
      });
    }
  }

  return results;
});

const searchInputEl = ref();
const { metaSymbol } = useShortcuts();
defineShortcuts({
  meta_k: {
    handler: async () => {
      searchInputEl.value?.focus();
    },
  },
});
</script>
