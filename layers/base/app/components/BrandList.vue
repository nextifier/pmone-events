<template>
  <div class="container-wider">
    <div class="flex flex-col items-center text-center">
      <h2
        :class="{
          'section-title': route.name?.toString().includes('brands'),
          'text-primary text-3xl font-semibold tracking-tighter sm:text-4xl': ![
            'index',
            'brands',
            'edition-brands',
          ].some((n) => route.name?.toString().startsWith(n)),
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

        <div class="flex w-full flex-wrap justify-end gap-1.5">
          <DropdownMenu v-if="editions?.length > 1" :modal="false">
            <DropdownMenuTrigger as-child>
              <button
                class="group border-border flex h-full min-w-0 flex-1 grow items-center justify-between gap-x-3 rounded-lg border px-2.5 py-2 tracking-tight transition sm:w-44 sm:flex-none"
                aria-label="Edition"
              >
                <div class="text-muted-foreground flex items-center gap-x-1.5">
                  <Icon name="hugeicons:calendar-03" class="size-4 shrink-0" />
                  <span class="truncate text-sm">{{
                    selectedEdition
                      ? `${selectedEdition.edition_label} edition`
                      : "Edition"
                  }}</span>
                </div>
                <IconChevronDown
                  class="size-3 shrink-0 transition group-data-[state=open]:rotate-180"
                />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              class="flex w-40 flex-col gap-y-1 rounded-lg px-1 py-2 sm:w-44"
            >
              <DropdownMenuItem
                v-for="(item, index) in editions"
                :key="index"
                v-slot="{ active, close }"
                as-child
              >
                <button
                  :aria-label="item.title"
                  class="relative flex w-full cursor-pointer items-center gap-x-4 rounded-md py-2 pr-4 pl-8 tracking-tight text-black ring-black ring-offset-2 ring-offset-white transition hover:bg-gray-100 hover:text-black focus-visible:ring-1 focus-visible:outline-hidden active:scale-98 dark:text-white dark:ring-white dark:ring-offset-gray-950 dark:hover:bg-gray-900 dark:hover:text-white"
                  :class="{
                    'bg-gray-100 text-black dark:bg-gray-900 dark:text-white':
                      selectedEdition?.edition_number === item.edition_number &&
                      !active,
                    'bg-blue-600 text-white dark:bg-blue-600 dark:text-white':
                      active,
                  }"
                  @click="changeEdition(item)"
                >
                  <IconCheck
                    v-if="
                      selectedEdition?.edition_number === item.edition_number
                    "
                    class="absolute top-1/2 left-2 size-5 -translate-y-1/2"
                  />
                  <div class="flex flex-col items-start gap-y-0.5">
                    <span class="text-sm"
                      >{{ item.edition_label }} Edition</span
                    >
                    <span class="text-xs opacity-60 sm:text-sm">{{
                      item.date_label
                    }}</span>
                  </div>
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu :modal="false">
            <DropdownMenuTrigger as-child>
              <button
                class="group border-border flex h-full min-w-0 flex-1 items-center justify-between gap-x-3 rounded-lg border px-2.5 py-2 tracking-tight transition sm:w-44 sm:flex-none"
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
            class="text-muted-foreground hover:bg-muted flex aspect-square size-10 shrink-0 items-center justify-center rounded-full transition active:scale-98"
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
        v-else-if="allBrands?.length === 0"
        class="mt-6 flex flex-col items-center justify-center gap-y-6 text-center"
      >
        <div class="perspective-midrange">
          <BrandListEmptyStateImage
            class="shadow-wrapper w-full max-w-80 rounded-md transition duration-300 hover:rotate-x-40"
          />
        </div>

        <span class="text-primary text-xl font-semibold tracking-tight"
          >Brand list is coming soon. Check back later!
        </span>
      </div>

      <div v-else>
        <!-- Searching: flat list across all groups -->
        <div v-if="debouncedSearchInput">
          <div v-if="filteredBrands?.length" class="space-y-10">
            <div
              class="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] sm:gap-x-4"
              v-auto-animate="{ duration: 300 }"
            >
              <BrandCard
                v-for="(brand, index) in filteredBrands"
                :key="brand.slug"
                :brand="brand"
                :brandBasePath="brandBasePath"
                :class="{
                  'col-span-2 sm:col-span-1': filteredBrands?.length === 1,
                }"
              />
            </div>
          </div>

          <div v-else class="flex flex-col gap-y-4">
            <span class="text-4xl font-semibold tracking-tighter sm:text-5xl"
              >No results found for
              <span class="font-semibold italic"
                >{{ debouncedSearchInput }}.</span
              ></span
            >

            <span class="text-base tracking-tight sm:text-lg"
              >Maybe try a different keyword.</span
            >
          </div>
        </div>

        <!-- Not searching: grouped display -->
        <div v-else class="space-y-10">
          <template v-for="(group, groupIndex) in brandGroups" :key="groupIndex">
            <!-- Conjunction separator -->
            <div
              v-if="!group.is_primary && group.brands?.length"
              class="flex items-center gap-3 pt-4 sm:gap-4"
            >
              <div class="border-border flex-1 border-t" />
              <div
                class="flex items-center gap-2.5 text-center sm:gap-3"
              >
                <NuxtImg
                  v-if="getConjunctionImg(group.project_username)"
                  :src="getConjunctionImg(group.project_username)"
                  :alt="group.event_title"
                  class="bg-muted border-border size-8 rounded-full border"
                  width="32"
                  height="32"
                  loading="lazy"
                />
                <span
                  class="text-muted-foreground text-sm tracking-tight text-balance sm:text-base"
                >
                  {{ $t('brands.conjunctionExplore', { eventName: group.event_title }) }}
                </span>
              </div>
              <div class="border-border flex-1 border-t" />
            </div>

            <!-- Brand grid for this group -->
            <div
              v-if="getSortedGroupBrands(group)?.length"
              class="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] sm:gap-x-4"
              v-auto-animate="{ duration: 300 }"
            >
              <BrandCard
                v-for="(brand, index) in getSortedGroupBrands(group)"
                :key="brand.slug"
                :brand="brand"
                :brandBasePath="brandBasePath"
                :class="{
                  'col-span-2 sm:col-span-1':
                    getSortedGroupBrands(group)?.length === 1,
                }"
              />
            </div>
          </template>

          <div class="flex flex-col items-center justify-center">
            <span
              class="text-muted-foreground/20 text-center text-[clamp(2rem,11vw,6rem)] !leading-[1.1] font-semibold tracking-tighter"
              >and many more!</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { refDebounced } from "@vueuse/core";

const props = defineProps({
  edition: {
    type: [String, Number],
    default: null,
  },
});

const { t } = useI18n();
const content = computed(() => useContentStore().components.brandList);
const config = useRuntimeConfig();
const route = useRoute();
const localePath = useLocalePath();
const appConfig = useAppConfig();

const searchInput = defineModel({ default: "" });
const debouncedSearchInput = refDebounced(searchInput, 300);

// Check if this is a brands page (not embedded on homepage)
const isBrandsPage = computed(() =>
  route.name?.toString().includes("brands"),
);

// Check if conjunction events exist
const hasConjunctions = computed(
  () => appConfig.event.inConjunction?.list?.length > 0,
);

// Use conjunction endpoint when on brands page with conjunction events
const useConjunctionEndpoint = computed(
  () => isBrandsPage.value && hasConjunctions.value && !props.edition,
);

// Edition dropdown
const { data: editions } = await useFetch("/api/editions", {
  transform: (res) => res.data,
});

const selectedEdition = computed(() => {
  if (props.edition) {
    return editions.value?.find(
      (e) => String(e.edition_number) === String(props.edition),
    );
  }
  return editions.value?.find((e) => e.is_active);
});

const brandBasePath = computed(() =>
  props.edition ? `/${props.edition}/brands` : "/brands",
);

const changeEdition = (item) => {
  if (item.is_active) {
    navigateTo(localePath("/brands"));
  } else {
    navigateTo(localePath(`/${item.edition_number}/brands`));
  }
};

// Sort dropdown
const sortOptions = [
  { label: "Brand Name", val: "brand_name" },
  { label: "Booth Number", val: "booth_number" },
  { label: "Last Created", val: "-created_at" },
];

const selectedSortOption = ref(sortOptions[0]);

const changeSelectedSortOption = (param) => {
  selectedSortOption.value = param;
};

const selectedSortOptionValue = computed(() => selectedSortOption.value.val);

// Fetch brands
const brandsUrl = computed(() => {
  if (useConjunctionEndpoint.value) {
    return "/api/exhibitors/with-conjunctions";
  }
  return props.edition
    ? `/api/exhibitors/by-edition/${props.edition}`
    : "/api/exhibitors";
});

const {
  data: rawData,
  refresh,
  pending,
  error,
} = await useFetch(brandsUrl, {
  server: route.name?.toString().includes("brands") ? true : false,
  lazy: true,
  key: `fetchExhibitors-${props.edition || "active"}-${useConjunctionEndpoint.value ? "conj" : "single"}`,
  transform: (res) => res.data,
});

// Brand groups (for grouped display when not searching)
const brandGroups = computed(() => {
  if (useConjunctionEndpoint.value && rawData.value?.groups) {
    return rawData.value.groups;
  }
  // Fallback: wrap in single group
  const brands = rawData.value?.groups
    ? rawData.value.groups[0]?.brands
    : rawData.value;
  return [
    {
      is_primary: true,
      event_title: appConfig.event.title,
      project_username: appConfig.app.projectUsername,
      brands: brands || [],
    },
  ];
});

// All brands flattened (for search/filter/sort)
const allBrands = computed(() => {
  return brandGroups.value?.flatMap((group) => group.brands || []) || [];
});

// Sort function reused for both grouped and flat display
const sortBrands = (brands) => {
  if (!brands?.length) return brands;

  const sorted = [...brands];
  if (selectedSortOption.value.val === "brand_name") {
    sorted.sort((a, b) => a.brand_name.localeCompare(b.brand_name));
  } else if (selectedSortOption.value.val === "-created_at") {
    sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
  } else if (selectedSortOption.value.val === "booth_number") {
    sorted.sort((a, b) => {
      const normalize = (value) => {
        if (!value) return null;
        return value
          .split("&")[0]
          .replace(/[^\w\s-]/gi, "")
          .replace(/\s/g, "")
          .toUpperCase();
      };

      const boothA = normalize(a.booth_number);
      const boothB = normalize(b.booth_number);

      if (boothA === null && boothB !== null) return 1;
      if (boothB === null && boothA !== null) return -1;
      if (boothA === null && boothB === null) return 0;

      return boothA.localeCompare(boothB, undefined, { numeric: true });
    });
  }
  return sorted;
};

// Filter function
const filterBrands = (brands) => {
  if (!debouncedSearchInput.value) return brands;

  return brands?.filter((brand) => {
    const search = debouncedSearchInput.value.toLowerCase();
    return (
      brand.brand_name?.toLowerCase().includes(search) ||
      brand.company_name?.toLowerCase().includes(search) ||
      brand.brand_description?.toLowerCase().includes(search) ||
      brand.business_categories?.toString().toLowerCase().includes(search) ||
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
};

// Filtered + sorted brands (flat, for search mode and counts)
const filteredBrands = computed(() => {
  return sortBrands(filterBrands(allBrands.value));
});

// Get sorted brands for a specific group (for grouped display)
const getSortedGroupBrands = (group) => {
  return sortBrands(group.brands);
};

// Get conjunction event image from app config
const getConjunctionImg = (projectUsername) => {
  const item = appConfig.event.inConjunction?.list?.find(
    (c) => c.projectUsername === projectUsername,
  );
  return item?.img;
};

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
