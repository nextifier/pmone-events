<template>
  <div
    class="sticky inset-x-0 top-(--navbar-height-mobile) z-50 flex h-(--navbar-height-mobile) items-center justify-center text-sm lg:top-(--navbar-height-desktop) lg:h-(--navbar-height-desktop)"
  >
    <ButtonGroup
      class="border-border/30 bg-background/95 supports-backdrop-filter:bg-background/90 mx-auto flex h-full w-full max-w-2xl items-center px-4 backdrop-blur-sm sm:rounded-b-2xl sm:px-2.5"
    >
      <InputGroup class="bg-background grow">
        <InputGroupAddon align="inline-start">
          <Icon name="hugeicons:search-01" class="text-gray-400" />
        </InputGroupAddon>
        <input
          ref="searchInputEl"
          v-model="searchInput"
          type="text"
          data-slot="input-group-control"
          placeholder="Search any brand or category"
          class="placeholder:text-muted-foreground/70 flex h-full w-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-2 text-sm tracking-tight outline-none"
        />
        <InputGroupAddon align="inline-end">
          <kbd v-if="!searchInput" class="keyboard-symbol">
            {{ metaSymbol }} K
          </kbd>
          <InputGroupButton
            v-else
            size="icon-xs"
            variant="ghost"
            aria-label="Clear search"
            @click="
              searchInput = '';
              searchInputEl?.focus();
            "
          >
            <IconClose class="size-3" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <Popover>
        <PopoverTrigger as-child>
          <Button
            variant="outline"
            size="icon"
            class="relative shrink-0 grow-0 sm:w-auto sm:gap-1.5 sm:px-3"
            aria-label="Filter"
          >
            <Icon
              name="hugeicons:filter-horizontal"
              class="text-muted-foreground size-4 shrink-0"
            />
            <span class="hidden sm:inline">Filter</span>
            <span
              v-if="totalActiveFilters > 0"
              class="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 inline-flex size-5 items-center justify-center rounded-full text-[11px] font-medium tracking-tight"
            >
              {{ totalActiveFilters }}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          class="max-h-[60vh] w-72 space-y-4 overflow-y-auto rounded-lg px-1 py-4"
        >
          <div v-if="availableEvents.length > 1">
            <div class="flex items-center justify-between">
              <DropdownMenuLabel>Events</DropdownMenuLabel>
              <button
                v-if="selectedEvents.length > 0"
                class="text-primary hover:text-primary/80 px-3 text-xs tracking-tight transition"
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

          <div>
            <div class="flex items-center justify-between">
              <DropdownMenuLabel>Categories</DropdownMenuLabel>
              <button
                v-if="selectedCategories.length > 0"
                class="text-primary hover:text-primary/80 px-3 text-xs tracking-tight transition"
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

            <div v-else>
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

      <DropdownMenu :modal="false">
        <DropdownMenuTrigger as-child>
          <Button
            variant="outline"
            size="icon"
            :class="[
              'shrink-0 grow-0 max-sm:!rounded-r-md sm:w-auto sm:gap-1.5 sm:px-3',
              viewMode === 'table' ? 'pointer-events-none invisible' : '',
            ]"
            aria-label="Sort by"
          >
            <Icon
              name="hugeicons:arrow-up-down"
              class="text-muted-foreground size-4 shrink-0"
            />
            <span class="hidden sm:inline">Sort</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          class="flex w-44 flex-col rounded-lg px-1 py-2"
        >
          <DropdownMenuLabel> Sort by </DropdownMenuLabel>
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

      <Button
        variant="outline"
        size="icon"
        aria-label="Refresh data"
        class="hidden shrink-0 grow-0 sm:flex"
        v-tippy="'Refresh'"
        @click="$emit('refresh')"
      >
        <Icon
          name="hugeicons:reload"
          class="size-4"
          :class="{ 'animate-spin': pending }"
        />
      </Button>
    </ButtonGroup>
  </div>
</template>

<script setup>
defineProps({
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
  viewMode: { type: String, default: "grid" },
});

defineEmits(["refresh", "clear-events", "clear-categories"]);

const searchInput = defineModel("searchInput", { type: String, default: "" });

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
