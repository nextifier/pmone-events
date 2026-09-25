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
        <InputGroupInput
          ref="searchInputEl"
          v-model="searchInput"
          type="text"
          placeholder="Search any brand or category"
          aria-label="Search any brand or category"
          class="placeholder:text-placeholder/70 h-full text-sm tracking-tight"
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
              focusSearchInput();
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
            class="relative shrink-0 grow-0 sm:w-auto sm:gap-1.5 sm:pr-3 sm:pl-2.5"
            aria-label="Filter"
          >
            <Icon
              name="hugeicons:filter-horizontal"
              class="text-muted-foreground size-4 shrink-0"
            />
            <span class="hidden sm:inline">Filter</span>
            <!-- z-10: the Sort button after this one is also relative with
                 z-index auto, so DOM order would paint it over the badge. -->
            <span
              v-if="totalActiveFilters > 0"
              class="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 z-10 inline-flex size-5 items-center justify-center rounded-full text-[11px] font-medium tracking-tight"
            >
              {{ totalActiveFilters }}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          class="max-h-[60vh] w-72 space-y-4 overflow-y-auto rounded-lg px-1 py-4"
        >
          <div v-if="meetingsAvailable">
            <DropdownMenuLabel>{{ $t("meetings.list.filterLabel") }}</DropdownMenuLabel>
            <Field
              orientation="horizontal"
              class="hover:bg-muted/70 gap-x-2 rounded-md px-3 py-1"
            >
              <Checkbox id="meetings-filter" v-model="meetingsOnly" />
              <FieldLabel
                for="meetings-filter"
                class="min-w-0 grow cursor-pointer items-center gap-x-2 font-normal"
              >
                <span class="grow truncate text-sm tracking-tight">
                  {{ $t("meetings.list.filterOption") }}
                </span>
              </FieldLabel>
            </Field>
          </div>

          <div v-if="availableEvents.length > 1">
            <div class="flex items-center justify-between">
              <DropdownMenuLabel>Events</DropdownMenuLabel>
              <Button
                v-if="selectedEvents.length > 0"
                variant="link"
                size="xs"
                class="h-auto px-3 py-0"
                @click="$emit('clear-events')"
              >
                Clear
              </Button>
            </div>
            <div class="space-y-0">
              <Field
                v-for="(event, index) in availableEvents"
                :key="event.projectUsername"
                orientation="horizontal"
                class="hover:bg-muted/70 gap-x-2 rounded-md px-3 py-1"
              >
                <Checkbox
                  :id="`event-filter-${index}`"
                  :model-value="selectedEvents.includes(event.projectUsername)"
                  @update:model-value="
                    toggleEventFilter(event.projectUsername, $event)
                  "
                />
                <FieldLabel
                  :for="`event-filter-${index}`"
                  class="min-w-0 grow cursor-pointer items-center gap-x-2 font-normal"
                >
                  <img
                    v-if="event.img"
                    :src="event.img"
                    :alt="event.title"
                    width="20"
                    height="20"
                    loading="lazy"
                    decoding="async"
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
                </FieldLabel>
              </Field>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between">
              <DropdownMenuLabel>Categories</DropdownMenuLabel>
              <Button
                v-if="selectedCategories.length > 0"
                variant="link"
                size="xs"
                class="h-auto px-3 py-0"
                @click="$emit('clear-categories')"
              >
                Clear
              </Button>
            </div>

            <div
              v-if="availableCategories.length === 0"
              class="text-muted-foreground text-sm"
            >
              No categories available.
            </div>

            <div v-else>
              <Field
                v-for="(item, index) in availableCategories"
                :key="item.name"
                orientation="horizontal"
                class="hover:bg-muted/70 gap-x-2 rounded-md px-3 py-1"
              >
                <Checkbox
                  :id="`category-filter-${index}`"
                  :model-value="selectedCategories.includes(item.name)"
                  @update:model-value="toggleCategoryFilter(item.name, $event)"
                />
                <FieldLabel
                  :for="`category-filter-${index}`"
                  class="min-w-0 grow cursor-pointer items-center gap-x-2 font-normal"
                >
                  <span class="grow truncate text-sm tracking-tight">
                    {{ item.name }}
                  </span>
                  <span class="text-muted-foreground text-xs tabular-nums">
                    {{ item.count }}
                  </span>
                </FieldLabel>
              </Field>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <DropdownMenu :modal="false">
        <DropdownMenuTrigger as-child>
          <Button
            variant="outline"
            size="icon"
            class="shrink-0 grow-0 max-sm:rounded-r-md! sm:w-auto sm:gap-1.5 sm:pr-3 sm:pl-2.5"
            :disabled="viewMode === 'table'"
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
          <!-- Layout and selected marker only. The highlight belongs to
               `.cn-dropdown-menu-item` in the active style. -->
          <DropdownMenuItem
            v-for="(item, index) in sortOptions"
            :key="index"
            :text-value="item.label"
            :aria-label="`Sort by ${item.label}`"
            class="w-full gap-x-4 rounded-md py-2 pr-4 pl-8 tracking-tight transition active:scale-98"
            :class="{
              'bg-muted text-foreground': selectedSortOption?.val === item.val,
            }"
            @select="changeSelectedSortOption(item)"
          >
            <IconCheck
              v-if="selectedSortOption?.val === item.val"
              class="absolute top-1/2 left-2 size-5 -translate-y-1/2"
            />
            <span class="text-sm">{{ item.label }}</span>
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
  meetingsAvailable: { type: Boolean, default: false },
});

const meetingsOnly = defineModel("meetingsOnly", { type: Boolean, default: false });

defineEmits(["refresh", "clear-events", "clear-categories"]);

const searchInput = defineModel("searchInput", { type: String, default: "" });

const searchInputEl = ref();

// InputGroupInput is a component, so the template ref holds its instance; the
// real <input> lives on $el.
function focusSearchInput() {
  const el = searchInputEl.value?.$el ?? searchInputEl.value;
  el?.focus?.();
}

const { metaSymbol } = useShortcuts();

defineShortcuts({
  meta_k: {
    handler: async () => {
      focusSearchInput();
    },
  },
});
</script>
