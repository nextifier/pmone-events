<template>
  <div class="mx-auto mt-6 flex w-full max-w-5xl flex-col gap-4 sm:mt-8">
    <div class="mx-auto w-full max-w-xl">
      <div class="group relative w-full">
        <input
          ref="searchInputEl"
          v-model="searchInput"
          type="text"
          class="input-base peer h-11 px-10 py-2 text-sm tracking-tight"
          placeholder="Search any brand or category"
        />

        <IconSearch
          class="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400 peer-focus:text-gray-400"
        />

        <span
          id="shortcut-key"
          class="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 items-center justify-center gap-x-0.5 peer-placeholder-shown:flex peer-focus-within:hidden"
        >
          <kbd class="keyboard-symbol">{{ metaSymbol }} K</kbd>
        </span>

        <button
          id="clear-input"
          type="button"
          @click="
            searchInput = '';
            searchInputEl?.focus();
          "
          class="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-gray-100 transition-colors peer-placeholder-shown:hidden hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800"
        >
          <IconClose class="h-3" />
        </button>
      </div>
    </div>

    <div
      class="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-3 sm:gap-y-2"
    >
      <div
        class="flex flex-wrap items-center justify-center gap-2 sm:justify-start"
      >
        <DropdownMenu v-if="editions?.length > 1" :modal="false">
          <DropdownMenuTrigger as-child>
            <button
              class="group border-border hover:bg-muted/40 flex h-10 items-center gap-x-2 rounded-lg border px-3 tracking-tight transition"
              aria-label="Edition"
            >
              <Icon
                name="hugeicons:calendar-03"
                class="text-muted-foreground size-4 shrink-0"
              />
              <span class="truncate text-sm">{{
                selectedEdition
                  ? `${selectedEdition.edition_label} edition`
                  : "Edition"
              }}</span>
              <IconChevronDown
                class="text-muted-foreground size-3 shrink-0 transition group-data-[state=open]:rotate-180"
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            class="flex w-44 flex-col gap-y-1 rounded-lg px-1 py-2"
          >
            <DropdownMenuItem
              v-for="(item, index) in editions"
              :key="index"
              v-slot="{ active }"
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
                  v-if="selectedEdition?.edition_number === item.edition_number"
                  class="absolute top-1/2 left-2 size-5 -translate-y-1/2"
                />
                <div class="flex flex-col items-start gap-y-0.5">
                  <span class="text-sm">{{ item.edition_label }} Edition</span>
                  <span class="text-xs opacity-60 sm:text-sm">{{
                    item.date_label
                  }}</span>
                </div>
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover>
          <PopoverTrigger as-child>
            <button
              class="group border-border hover:bg-muted/40 relative flex h-10 items-center gap-x-2 rounded-lg border px-3 tracking-tight transition"
              aria-label="Filter"
            >
              <Icon
                name="hugeicons:filter-horizontal"
                class="text-muted-foreground size-4 shrink-0"
              />
              <span class="truncate text-sm">Filter</span>
              <span
                v-if="totalActiveFilters > 0"
                class="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 inline-flex size-5 items-center justify-center rounded-full text-[11px] font-medium tracking-tight"
              >
                {{ totalActiveFilters }}
              </span>
            </button>
          </PopoverTrigger>

          <PopoverContent
            align="start"
            class="max-h-[60vh] w-72 space-y-4 overflow-y-auto rounded-lg px-1 py-4"
          >
            <div v-if="availableEvents.length > 1" class="space-y-1.5">
              <div class="flex items-center justify-between px-3">
                <div
                  class="text-muted-foreground text-xs font-medium tracking-tight"
                >
                  Events
                </div>
                <button
                  v-if="selectedEvents.length > 0"
                  class="text-primary hover:text-primary/80 text-xs tracking-tight transition"
                  @click="$emit('clear-events')"
                >
                  Clear
                </button>
              </div>
              <div class="space-y-0">
                <label
                  v-for="(event, index) in availableEvents"
                  :key="event.projectUsername"
                  :for="`event-filter-${index}`"
                  class="hover:bg-muted/70 flex cursor-pointer items-center gap-x-2 rounded-md px-3 py-1"
                >
                  <Checkbox
                    :id="`event-filter-${index}`"
                    :model-value="selectedEvents.includes(event.projectUsername)"
                    @update:model-value="
                      toggleEventFilter(event.projectUsername, $event)
                    "
                  />
                  <NuxtImg
                    v-if="event.img"
                    :src="event.img"
                    :alt="event.title"
                    width="20"
                    height="20"
                    loading="lazy"
                    class="bg-muted border-border size-5 shrink-0 rounded-full border object-cover"
                  />
                  <div
                    v-else
                    class="bg-muted border-border size-5 shrink-0 rounded-full border"
                  />
                  <span class="grow truncate text-sm tracking-tight">
                    {{ event.title }}
                  </span>
                  <span class="text-muted-foreground text-xs tabular-nums">
                    {{ event.count }}
                  </span>
                </label>
              </div>
            </div>

            <div class="space-y-1.5">
              <div class="flex items-center justify-between px-3">
                <div
                  class="text-muted-foreground text-xs font-medium tracking-tight"
                >
                  Categories
                </div>
                <button
                  v-if="selectedCategories.length > 0"
                  class="text-primary hover:text-primary/80 text-xs tracking-tight transition"
                  @click="$emit('clear-categories')"
                >
                  Clear
                </button>
              </div>

              <div
                v-if="availableCategories.length === 0"
                class="text-muted-foreground text-sm"
              >
                No categories available.
              </div>

              <div v-else class="space-y-0">
                <label
                  v-for="(item, index) in availableCategories"
                  :key="item.name"
                  :for="`category-filter-${index}`"
                  class="hover:bg-muted/70 flex cursor-pointer items-center gap-x-2 rounded-md px-3 py-1"
                >
                  <Checkbox
                    :id="`category-filter-${index}`"
                    :model-value="selectedCategories.includes(item.name)"
                    @update:model-value="toggleCategoryFilter(item.name, $event)"
                  />
                  <span class="grow truncate text-sm tracking-tight">
                    {{ item.name }}
                  </span>
                  <span class="text-muted-foreground text-xs tabular-nums">
                    {{ item.count }}
                  </span>
                </label>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div :class="viewMode === 'table' ? 'pointer-events-none invisible' : ''">
          <DropdownMenu :modal="false">
            <DropdownMenuTrigger as-child>
              <button
                class="group border-border hover:bg-muted/40 flex h-10 items-center gap-x-2 rounded-lg border px-3 tracking-tight transition"
                aria-label="Sort by"
              >
                <IconSort class="text-muted-foreground size-4 shrink-0" />
                <span class="truncate text-sm">{{
                  selectedSortOption?.label
                }}</span>
                <IconChevronDown
                  class="text-muted-foreground size-3 shrink-0 transition group-data-[state=open]:rotate-180"
                />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              class="flex w-44 flex-col gap-y-1 rounded-lg px-1 py-2"
            >
              <DropdownMenuItem
                v-for="(item, index) in sortOptions"
                :key="index"
                v-slot="{ active }"
                as-child
              >
                <button
                  :aria-label="`Sort by ${item.label}`"
                  class="relative flex w-full cursor-pointer items-center gap-x-4 rounded-md py-2 pr-4 pl-8 tracking-tight text-black ring-black ring-offset-2 ring-offset-white transition hover:bg-gray-100 hover:text-black focus-visible:ring-1 focus-visible:outline-hidden active:scale-98 dark:text-white dark:ring-white dark:ring-offset-gray-950 dark:hover:bg-gray-900 dark:hover:text-white"
                  :class="{
                    'bg-gray-100 text-black dark:bg-gray-900 dark:text-white':
                      selectedSortOption?.val === item.val && !active,
                    'bg-blue-600 text-white dark:bg-blue-600 dark:text-white':
                      active,
                  }"
                  @click="changeSelectedSortOption(item)"
                >
                  <IconCheck
                    v-if="selectedSortOption?.val === item.val"
                    class="absolute top-1/2 left-2 size-5 -translate-y-1/2"
                  />
                  <span class="text-sm">{{ item.label }}</span>
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div class="flex items-center justify-center gap-2 sm:justify-end">
        <button
          aria-label="Refresh data"
          @click="$emit('refresh')"
          class="text-muted-foreground hover:bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg transition active:scale-98"
          v-tippy="'Refresh'"
        >
          <IconRefresh class="size-4" :class="{ 'animate-spin': pending }" />
        </button>

        <BrandViewSwitcher v-model="viewMode" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  editions: { type: Array, default: () => [] },
  selectedEdition: { type: Object, default: null },
  changeEdition: { type: Function, required: true },
  availableEvents: { type: Array, default: () => [] },
  availableCategories: { type: Array, default: () => [] },
  selectedEvents: { type: Array, default: () => [] },
  selectedCategories: { type: Array, default: () => [] },
  totalActiveFilters: { type: Number, default: 0 },
  toggleEventFilter: { type: Function, required: true },
  toggleCategoryFilter: { type: Function, required: true },
  sortOptions: { type: Array, default: () => [] },
  selectedSortOption: { type: Object, default: null },
  changeSelectedSortOption: { type: Function, required: true },
  pending: { type: Boolean, default: false },
});

defineEmits(["refresh", "clear-events", "clear-categories"]);

const searchInput = defineModel("searchInput", { type: String, default: "" });
const viewMode = defineModel("viewMode", { type: String, default: "grid" });

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
