<template>
  <div class="space-y-4">
    <!-- Error State -->
    <div v-if="error" class="flex flex-col items-start gap-y-3 rounded-lg">
      <!-- <div class="text-destructive-foreground flex items-center gap-x-2">
        <Icon name="hugeicons:alert-circle" class="size-5" />
        <span class="font-medium tracking-tight">{{ errorTitle || "Error loading data" }}</span>
      </div>
      <p class="text-sm tracking-tight">
        {{ error?.message || "An error occurred while fetching data." }}
      </p> -->
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-4">
      <!-- Toolbar -->
      <div
        v-if="
          searchable ||
          columnToggle ||
          $slots.filters ||
          hasActiveFilters ||
          (showRefreshButton && !displayOnly) ||
          (showAddButton && !displayOnly) ||
          $slots['add-button']
        "
        class="space-y-3"
      >
        <!-- Search and Filters -->
        <div
          v-if="searchable || columnToggle || $slots.filters"
          class="flex h-(--cn-input-h) w-full gap-x-1 sm:gap-x-2"
        >
          <!-- Search Input -->
          <div v-if="searchable" class="relative flex h-full grow items-center">
            <Icon
              name="lucide:search"
              class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            />
            <input
              ref="searchInputEl"
              type="text"
              data-slot="input"
              :placeholder="searchPlaceholder || 'Search..'"
              class="cn-input peer placeholder:text-muted-foreground h-full w-full px-9 tracking-tight outline-none"
              :value="searchValue"
              @input="handleSearchInput"
            />
            <span
              v-if="!searchValue"
              class="text-muted-foreground/60 pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 items-center gap-x-1 text-xs font-medium peer-placeholder-shown:flex"
            >
              <kbd class="keyboard-symbol">{{ metaSymbol }} K</kbd>
            </span>
            <button
              v-if="searchValue"
              class="bg-muted hover:bg-border absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full peer-placeholder-shown:hidden"
              aria-label="Clear search"
              @click="clearSearch"
            >
              <Icon name="lucide:x" class="size-3 shrink-0" />
            </button>
          </div>

          <!-- Filters Slot -->
          <slot name="filters" :table="table" />

          <!-- Column Toggle -->
          <ClientOnly v-if="columnToggle">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  :class="[
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    'h-(--cn-input-h) shrink-0 active:scale-98 max-sm:aspect-square max-sm:px-0',
                  ]"
                >
                  <Icon name="hugeicons:layout-3-column" class="size-4 shrink-0" />
                  <span class="hidden sm:flex">Columns</span>
                </button>
              </PopoverTrigger>
              <PopoverContent class="w-auto min-w-36 p-3" align="end">
                <div class="space-y-3">
                  <div class="text-muted-foreground text-xs font-medium">Toggle columns</div>
                  <div class="space-y-3">
                    <div
                      v-for="column in table
                        .getAllColumns()
                        .filter((column) => column.getCanHide())"
                      :key="column.id"
                      class="flex items-center gap-2"
                    >
                      <Checkbox
                        :id="column.id"
                        :model-value="column.getIsVisible()"
                        @update:model-value="(value) => column.toggleVisibility(!!value)"
                      />
                      <Label
                        :for="column.id"
                        class="grow cursor-pointer font-normal tracking-tight capitalize"
                      >
                        {{ column.columnDef.header }}
                      </Label>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <template #fallback>
              <button
                :class="[
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'h-(--cn-input-h) shrink-0 active:scale-98 max-sm:aspect-square max-sm:px-0',
                ]"
                disabled
              >
                <Icon name="hugeicons:layout-3-column" class="size-4 shrink-0" />
                <span class="hidden sm:flex">Columns</span>
              </button>
            </template>
          </ClientOnly>
        </div>

        <!-- Action Buttons (bulk actions live in the floating pill below) -->
        <div
          v-if="
            hasActiveFilters ||
            (showRefreshButton && !displayOnly) ||
            (showAddButton && !displayOnly) ||
            $slots['add-button'] ||
            $slots['toolbar-actions']
          "
          class="flex min-h-(--cn-input-h) w-full flex-wrap items-center justify-between gap-1 sm:gap-x-2"
        >
          <!-- Wraps rather than overflows: a page can hand this row several
               actions through #toolbar-actions, and on a narrow screen they have
               to fall to a second line instead of pushing the create button off
               the edge. min-h keeps the single-row case the height it was. -->
          <div class="ml-auto flex flex-wrap items-center justify-end gap-1 sm:gap-2">
            <!-- Clear Filters Button -->
            <Button
              v-if="hasActiveFilters"
              variant="outline"
              size="sm"
              @click="table.resetColumnFilters()"
            >
              <Icon name="lucide:x" class="size-4 shrink-0" />
              <span class="hidden sm:flex">Clear filters</span>
            </Button>

            <!-- Custom toolbar actions (rendered before Refresh) -->
            <slot name="toolbar-actions" :table="table" />

            <!-- Refresh Button -->
            <Button
              v-if="showRefreshButton && !displayOnly"
              variant="outline"
              size="sm"
              @click="$emit('refresh')"
            >
              <Icon
                name="hugeicons:reload"
                class="size-4 shrink-0"
                :class="pending ? 'animate-spin' : ''"
              />
              <span class="hidden sm:flex">Refresh</span>
              <KbdGroup class="hidden sm:flex">
                <Kbd>R</Kbd>
              </KbdGroup>
            </Button>

            <slot name="add-button">
              <Button v-if="showAddButton && !displayOnly" :to="`/${props.model}/create`" size="sm">
                <Icon name="lucide:plus" class="-ml-1 size-4 shrink-0" />
                <span
                  >Add <span v-if="props.label">{{ props.label }}</span></span
                >
              </Button>
            </slot>
          </div>
        </div>
      </div>

      <!-- Floating bulk-action pill — rendered for every page that provides an
           #actions slot. Teleported so it floats above the page; reveals when
           rows are selected (transitions-dev: panel reveal + badge pop). -->
      <ClientOnly>
        <Teleport to="body">
          <Transition
            enter-active-class="transition-[translate,opacity,filter] duration-(--panel-open-dur) ease-(--panel-ease) motion-reduce:transition-none"
            enter-from-class="translate-y-4 opacity-0 blur-(--panel-blur)"
            leave-active-class="transition-[translate,opacity,filter] duration-(--panel-close-dur) ease-(--panel-ease) motion-reduce:transition-none"
            leave-to-class="translate-y-4 opacity-0 blur-(--panel-blur)"
          >
            <div
              v-if="floatingActions && selectedRowsCount > 0 && $slots.actions"
              class="fixed bottom-4 left-1/2 z-40 w-fit max-w-[calc(100vw-1.5rem)] -translate-x-1/2 sm:bottom-6"
            >
              <!-- Static circle; only the value animates on change (NumberFlow),
                   so the circle itself never re-pops. -->
              <span
                class="bg-foreground text-background border-background absolute -top-2 -right-1 z-10 inline-flex size-6 items-center justify-center rounded-full border-2 text-xs font-medium tracking-tight tabular-nums shadow-sm"
              >
                <NumberFlow :value="selectedRowsCount" />
              </span>

              <div
                ref="pillEl"
                class="t-resize bg-foreground text-background flex items-center rounded-full p-1 shadow-lg"
              >
                <div class="no-scrollbar scroll-fade-x overflow-x-auto">
                  <div class="flex w-max items-center gap-x-0.5">
                    <TableBulkAction
                      icon="lucide:x"
                      label="Clear selection"
                      @click="resetRowSelection"
                    />
                    <div
                      v-if="$slots.actions"
                      class="bg-background/20 mx-0.5 h-5 w-px shrink-0"
                      aria-hidden="true"
                    />
                    <slot
                      name="actions"
                      :table="table"
                      :selected-rows="table.getSelectedRowModel().rows"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </Teleport>
      </ClientOnly>

      <!-- Table -->
      <div class="frame">
        <div class="frame-panel bg-background -m-px overflow-hidden p-0!">
          <Table ref="tableRef" class="table-fixed">
            <TableHeader>
              <TableRow
                v-for="headerGroup in table.getHeaderGroups()"
                :key="headerGroup.id"
                class="tracking-tight hover:bg-transparent"
              >
                <TableHead
                  v-for="(header, index) in headerGroup.headers"
                  :key="header.id"
                  :style="cellWidth(header.column)"
                  :class="[
                    'h-11',
                    index === 0 && header.column.id !== 'select' ? 'pl-4' : '',
                    isPinnedCell(header.column.id, index, headerGroup.headers.length)
                      ? pinnedHeadClass
                      : '',
                  ]"
                >
                  <template v-if="!header.isPlaceholder">
                    <div
                      v-if="header.column.getCanSort()"
                      class="flex h-full cursor-pointer items-center gap-x-3 select-none"
                      @click="header.column.getToggleSortingHandler()?.($event)"
                      @keydown="
                        (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            header.column.getToggleSortingHandler()?.(event);
                          }
                        }
                      "
                      tabindex="0"
                      role="button"
                    >
                      <FlexRender
                        :render="header.column.columnDef.header"
                        :props="header.getContext()"
                      />
                      <Icon
                        v-if="header.column.getIsSorted() === 'desc'"
                        name="lucide:chevron-down"
                        class="text-muted-foreground size-3.5 shrink-0"
                      />
                      <Icon
                        v-else-if="header.column.getIsSorted() === 'asc'"
                        name="lucide:chevron-up"
                        class="text-muted-foreground size-3.5 shrink-0"
                      />
                      <Icon
                        v-else
                        name="lucide:chevron-up"
                        class="text-muted-foreground/30 size-3.5 shrink-0"
                      />
                    </div>
                    <div v-else>
                      <FlexRender
                        :render="header.column.columnDef.header"
                        :props="header.getContext()"
                      />
                    </div>
                  </template>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <!-- Skeleton Loading Rows -->
              <template v-if="isInitialLoading">
                <slot name="loading">
                  <TableRow v-for="i in 25" :key="`skeleton-${i}`" class="tracking-tight">
                    <TableCell
                      v-for="(header, j) in skeletonHeaders"
                      :key="`skeleton-cell-${i}-${j}`"
                      :style="cellWidth(header.column)"
                      :class="[
                        'py-2.5',
                        header.column.id !== 'select' &&
                        !isPinnedCell(header.column.id, j, skeletonHeaders.length)
                          ? 'no-scrollbar scroll-fade-x overflow-x-auto'
                          : 'overflow-hidden',
                        j === 0 && header.column.id !== 'select' ? 'pl-4' : '',
                        isPinnedCell(header.column.id, j, skeletonHeaders.length)
                          ? pinnedCellClass
                          : '',
                      ]"
                    >
                      <Skeleton
                        :class="[
                          'h-4 rounded',
                          j === 0 ? 'w-3/4' : j % 3 === 0 ? 'w-1/2' : j % 2 === 0 ? 'w-2/3' : 'w-full',
                        ]"
                      />
                    </TableCell>
                  </TableRow>
                </slot>
              </template>

              <template v-else-if="table.getRowModel().rows?.length">
                <template v-for="row in table.getRowModel().rows" :key="row.id">
                  <TableRow
                    :data-state="row.getIsSelected() && 'selected'"
                    class="group tracking-tight"
                  >
                    <TableCell
                      v-for="(cell, index) in row.getVisibleCells()"
                      :key="cell.id"
                      :style="cellWidth(cell.column)"
                      :class="[
                        'py-2.5',
                        cell.column.id !== 'select' &&
                        !isPinnedCell(cell.column.id, index, row.getVisibleCells().length)
                          ? 'no-scrollbar scroll-fade-x overflow-x-auto'
                          : 'overflow-hidden',
                        index === 0 && cell.column.id !== 'select' ? 'pl-4' : '',
                        isPinnedCell(cell.column.id, index, row.getVisibleCells().length)
                          ? pinnedCellClass
                          : '',
                      ]"
                    >
                      <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                    </TableCell>
                  </TableRow>
                  <Transition v-if="$slots['expanded-row']" name="t-acc">
                    <TableRow
                      v-if="row.getIsExpanded()"
                      :key="`${row.id}-expanded`"
                      class="border-b-0 hover:bg-transparent"
                    >
                      <TableCell :colspan="row.getVisibleCells().length" class="p-0">
                        <div class="t-acc-wrap">
                          <div class="t-acc-inner bg-muted/30">
                            <slot name="expanded-row" :row="row" />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </Transition>
                </template>
              </template>
            </TableBody>
            <tfoot
              v-if="$slots.footer && hasRows && !isInitialLoading"
              data-slot="table-footer"
            >
              <slot name="footer" />
            </tfoot>
          </Table>

          <!-- Empty State -->
          <div
            v-if="!isInitialLoading && !hasRows"
            class="mx-auto flex w-full max-w-md flex-col items-center gap-4 py-10 text-center"
          >
            <div
              class="*:bg-background/80 *:squircle text-muted-foreground flex items-center -space-x-2 *:rounded-lg *:border *:p-3 *:backdrop-blur-sm [&_svg]:size-5"
            >
              <div class="translate-y-1.5 -rotate-6">
                <Icon name="hugeicons:file-empty-01" />
              </div>
              <div>
                <Icon name="hugeicons:search-remove" />
              </div>
              <div class="translate-y-1.5 rotate-6">
                <Icon name="hugeicons:user" />
              </div>
            </div>
            <div class="flex flex-col gap-y-1.5">
              <h6 class="text-lg font-semibold tracking-tight">No data found</h6>
              <p class="text-muted-foreground text-sm">
                It looks like there's no data in this page.
              </p>
            </div>
            <div class="flex items-center gap-2">
              <Button
                v-if="props.showAddButton && !props.displayOnly"
                :to="`/${props.model}/create`"
              >
                <Icon name="lucide:plus" class="size-4 shrink-0" />
                <span>Create new</span>
              </Button>
              <Button v-if="hasActiveFilters" variant="outline" @click="table.resetColumnFilters()">
                <Icon name="lucide:x" class="size-4 shrink-0" />
                <span>Clear filters</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="hasRows && showPagination"
        class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"
      >
        <div class="flex items-center justify-between gap-x-4">
          <div class="text-muted-foreground text-sm tracking-tight">
            <template v-if="hasSelectedRows">
              {{ selectedRowsCount }} of {{ totalItems }} row<template v-if="selectedRowsCount > 1"
                >s</template
              >
              selected.
            </template>
            <template v-else>
              Showing {{ paginationInfo.from }} to {{ paginationInfo.to }} of
              {{ paginationInfo.total }} results.
            </template>
          </div>

          <Spinner v-if="pending" />
        </div>

        <div class="flex items-center justify-between gap-x-4">
          <div class="flex items-center gap-x-2">
            <p
              class="text-muted-foreground hidden text-sm tracking-tight whitespace-nowrap sm:block"
            >
              Rows per page
            </p>
            <Select :model-value="currentPageSizeValue" @update:model-value="handlePageSizeChange">
              <SelectTrigger size="sm">
                <SelectValue :placeholder="currentPageSizeDisplay" />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectItem v-for="pageSize in pageSizes" :key="pageSize" :value="`${pageSize}`">
                  {{ pageSize }}
                </SelectItem>
                <SelectItem value="all"> All </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Pagination
              :default-page="currentPage"
              :items-per-page="itemsPerPage"
              :total="totalItems"
            >
              <PaginationContent>
                <PaginationFirst asChild>
                  <button
                    :class="buttonVariants({ variant: 'outline', size: 'icon' })"
                    @click="goToFirstPage"
                    :disabled="!canGoPrevious"
                  >
                    <Icon name="lucide:chevron-first" class="size-4 shrink-0" />
                  </button>
                </PaginationFirst>
                <PaginationPrevious asChild>
                  <button
                    :class="buttonVariants({ variant: 'outline', size: 'icon' })"
                    @click="goToPreviousPage"
                    :disabled="!canGoPrevious"
                  >
                    <Icon name="lucide:chevron-left" class="size-4 shrink-0" />
                  </button>
                </PaginationPrevious>
                <PaginationNext asChild>
                  <button
                    :class="buttonVariants({ variant: 'outline', size: 'icon' })"
                    @click="goToNextPage"
                    :disabled="!canGoNext"
                  >
                    <Icon name="lucide:chevron-right" class="size-4 shrink-0" />
                  </button>
                </PaginationNext>
                <PaginationLast asChild>
                  <button
                    :class="buttonVariants({ variant: 'outline', size: 'icon' })"
                    @click="goToLastPage"
                    :disabled="!canGoNext"
                  >
                    <Icon name="lucide:chevron-last" class="size-4 shrink-0" />
                  </button>
                </PaginationLast>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Button, buttonVariants } from "@/components/ui/button";
import TableBulkAction from "@/components/ui/table-data/TableBulkAction.vue";
import { Checkbox } from "@/components/ui/checkbox";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationFirst,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { valueUpdater } from "@/components/ui/table/utils";
import { useResizeObserver } from "@vueuse/core";
import {
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createExpandedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  FlexRender,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from "@tanstack/vue-table";

const slots = useSlots();

const props = defineProps({
  // Data
  data: {
    type: Array,
    required: true,
  },
  columns: {
    type: Array,
    required: true,
  },
  meta: {
    type: Object,
    required: true,
  },
  pending: {
    type: Boolean,
    default: false,
  },
  error: {
    type: [Object, String],
    default: null,
  },
  model: {
    type: String,
    required: true,
  },
  label: {
    type: String,
  },
  clientOnly: {
    type: Boolean,
    default: true,
  },
  searchable: {
    type: Boolean,
    default: true,
  },
  searchColumn: {
    type: String,
    default: "name",
  },
  searchPlaceholder: {
    type: String,
    default: null,
  },
  columnToggle: {
    type: Boolean,
    default: true,
  },
  showAddButton: {
    type: Boolean,
    default: true,
  },
  showRefreshButton: {
    type: Boolean,
    default: true,
  },
  showPagination: {
    type: Boolean,
    default: true,
  },
  displayOnly: {
    type: Boolean,
    default: false,
  },
  pageSizes: {
    type: Array,
    default: () => [10, 20, 30, 40, 50],
  },

  // Messages
  errorTitle: {
    type: String,
    default: null,
  },

  // Initial state
  initialRowSelection: {
    type: Object,
    default: () => ({}),
  },
  initialColumnFilters: {
    type: Array,
    default: () => [],
  },
  initialColumnVisibility: {
    type: Object,
    default: () => ({}),
  },
  initialPagination: {
    type: Object,
    default: () => ({ pageIndex: 0, pageSize: 10 }),
  },
  initialSorting: {
    type: Array,
    default: () => [{ id: "created_at", desc: true }],
  },
  // Renders the #actions slot inside the floating bottom pill. On by default so
  // every table page gets the pill; set false to keep actions inline.
  floatingActions: {
    type: Boolean,
    default: true,
  },
  // Keeps the trailing `actions` column flush against the right edge while the
  // rest of the table scrolls under it. Opt-in: a pinned column is a permanent
  // claim on the row's width, so each table decides for itself whether reaching
  // its row menu without scrolling is worth that.
  pinActions: {
    type: Boolean,
    default: false,
  },
  // Column id that absorbs leftover width. `table-fixed` + `w-full` spreads any
  // slack proportionally across EVERY column, so on a wide window a checkbox
  // column grows too and a badge ends up centred in empty space. Naming one
  // column here hands it the whole remainder instead, and every other column
  // stays at the width it declared. Opt-in; unset keeps the old behaviour.
  flexColumn: {
    type: String,
    default: null,
  },
});

const emit = defineEmits([
  "refresh",
  "update:rowSelection",
  "update:columnFilters",
  "update:columnVisibility",
  "update:pagination",
  "update:sorting",
]);

// Determine if we should use client-side processing
const isClientSideMode = computed(() => props.displayOnly || props.clientOnly);

// Table state
const rowSelection = ref(props.initialRowSelection);
const columnFilters = ref(props.initialColumnFilters);
const columnVisibility = ref(props.initialColumnVisibility);
const pagination = ref(props.initialPagination);
const sorting = ref(props.initialSorting);
const expanded = ref({});

// Watch for state changes and emit to parent
watch(rowSelection, (value) => emit("update:rowSelection", value), { deep: true });
watch(columnFilters, (value) => emit("update:columnFilters", value), { deep: true });
watch(columnVisibility, (value) => emit("update:columnVisibility", value), { deep: true });
watch(pagination, (value) => emit("update:pagination", value), { deep: true });
watch(sorting, (value) => emit("update:sorting", value), { deep: true });

// Feature + row-model registry. TanStack v9 resolves these statically, so every
// row model is always registered and the client/server split is expressed purely
// through the manual* flags below (v8 used to swap the factories in and out).
// `filterFns` / `sortFns` are registered so the string names columns pass to
// `filterFn` / `sortFn` — including the default "auto" — still resolve.
const features = tableFeatures({
  columnFilteringFeature,
  // `header.getSize()` / `column.getSize()` are used for the sticky column
  // widths; both only exist once columnSizingFeature is registered.
  columnSizingFeature,
  columnVisibilityFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  filterFns,
  sortFns,
});

// Table instance
const table = useTable({
  features,
  get data() {
    return props.data || [];
  },
  get columns() {
    return props.columns;
  },
  // Row expansion is opt-in: only enabled when the consumer provides an
  // #expanded-row slot, so existing tables are unaffected.
  getRowCanExpand: () => !!slots["expanded-row"],
  manualPagination: !isClientSideMode.value,
  manualSorting: !isClientSideMode.value,
  manualFiltering: !isClientSideMode.value,
  pageCount: isClientSideMode.value ? undefined : props.meta.last_page,
  autoResetPageIndex: false,
  state: {
    get rowSelection() {
      return rowSelection.value;
    },
    get pagination() {
      return pagination.value;
    },
    get sorting() {
      return sorting.value;
    },
    get columnFilters() {
      return columnFilters.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
    get expanded() {
      return expanded.value;
    },
  },
  onSortingChange: (updater) => valueUpdater(updater, sorting),
  onPaginationChange: (updater) => valueUpdater(updater, pagination),
  onColumnFiltersChange: (updater) => valueUpdater(updater, columnFilters),
  onColumnVisibilityChange: (updater) => valueUpdater(updater, columnVisibility),
  onRowSelectionChange: (updater) => valueUpdater(updater, rowSelection),
  onExpandedChange: (updater) => valueUpdater(updater, expanded),
  enableSortingRemoval: false,
});

// Handle page size change
const handlePageSizeChange = (value) => {
  // If "all" is selected, set page size to total items
  const newPageSize = value === "all" ? totalItems.value : Number(value);
  const currentPageSize = pagination.value.pageSize;

  // Only update if page size actually changed
  if (currentPageSize !== newPageSize) {
    // Update pagination state atomically - reset to page 1 when page size changes
    pagination.value = {
      pageIndex: 0,
      pageSize: newPageSize,
    };
  }
};

// Pagination navigation functions that work for both client and server-side modes
const goToFirstPage = () => {
  if (isClientSideMode.value) {
    table.setPageIndex(0);
  } else {
    pagination.value = { ...pagination.value, pageIndex: 0 };
  }
};

const goToPreviousPage = () => {
  if (isClientSideMode.value) {
    table.previousPage();
  } else {
    const newIndex = Math.max(0, pagination.value.pageIndex - 1);
    pagination.value = { ...pagination.value, pageIndex: newIndex };
  }
};

const goToNextPage = () => {
  if (isClientSideMode.value) {
    table.nextPage();
  } else {
    const maxIndex = props.meta.last_page - 1;
    const newIndex = Math.min(maxIndex, pagination.value.pageIndex + 1);
    pagination.value = { ...pagination.value, pageIndex: newIndex };
  }
};

const goToLastPage = () => {
  if (isClientSideMode.value) {
    table.setPageIndex(table.getPageCount() - 1);
  } else {
    pagination.value = { ...pagination.value, pageIndex: props.meta.last_page - 1 };
  }
};

// Search with debounce
const searchInputEl = ref();
const searchValue = ref("");
const { metaSymbol } = useShortcuts();

// Initialize search value from initial filters
onMounted(() => {
  const initialSearchFilter = props.initialColumnFilters.find((f) => f.id === props.searchColumn);
  if (initialSearchFilter?.value) {
    searchValue.value = initialSearchFilter.value;
  }
});

// Debounced search handler (300ms delay to prevent fetch on every keystroke)
const debouncedSearch = useDebounceFn((value) => {
  table.getColumn(props.searchColumn)?.setFilterValue(value || undefined);
  // Reset to first page when search changes
  table.setPageIndex(0);
}, 300);

const handleSearchInput = (event) => {
  searchValue.value = event.target.value;
  debouncedSearch(event.target.value);
};

const clearSearch = () => {
  searchValue.value = "";
  table.getColumn(props.searchColumn)?.setFilterValue(undefined);
  // Reset to first page when search is cleared
  table.setPageIndex(0);
};

defineShortcuts({
  meta_k: {
    usingInput: true,
    handler: () => {
      searchInputEl.value?.focus();
    },
  },
  r: {
    handler: () => {
      if (props.showRefreshButton && !props.displayOnly) {
        emit("refresh");
      }
    },
  },
});

// Computed properties for better readability
const isClientSidePagination = computed(() => isClientSideMode.value);
const hasRows = computed(() => table.getRowModel().rows?.length > 0);
const isInitialLoading = computed(() => props.pending && props.data.length === 0);
const hasActiveFilters = computed(() => table.atoms.columnFilters.get().length > 0);
const selectedRowsCount = computed(() => table.getSelectedRowModel().rows.length);
const hasSelectedRows = computed(() => selectedRowsCount.value > 0);

const paginationInfo = computed(() => {
  if (isClientSidePagination.value) {
    const pageIndex = table.atoms.pagination.get().pageIndex;
    const pageSize = table.atoms.pagination.get().pageSize;
    const totalRows = table.getFilteredRowModel().rows.length;

    return {
      from: pageIndex * pageSize + 1,
      to: Math.min((pageIndex + 1) * pageSize, totalRows),
      total: totalRows,
    };
  } else {
    return {
      from: (props.meta.current_page - 1) * props.meta.per_page + 1,
      to: Math.min(props.meta.current_page * props.meta.per_page, props.meta.total),
      total: props.meta.total,
    };
  }
});

const canGoPrevious = computed(() =>
  isClientSidePagination.value ? table.getCanPreviousPage() : pagination.value.pageIndex > 0
);

const canGoNext = computed(() =>
  isClientSidePagination.value
    ? table.getCanNextPage()
    : pagination.value.pageIndex < props.meta.last_page - 1
);

const lastPageIndex = computed(() =>
  isClientSidePagination.value ? table.getPageCount() - 1 : props.meta.last_page - 1
);

const currentPage = computed(() =>
  isClientSidePagination.value ? table.atoms.pagination.get().pageIndex + 1 : props.meta.current_page
);

const itemsPerPage = computed(() =>
  isClientSidePagination.value ? table.atoms.pagination.get().pageSize : props.meta.per_page
);

const totalItems = computed(() =>
  isClientSidePagination.value ? table.getFilteredRowModel().rows.length : props.meta.total
);

const currentPageSizeValue = computed(() => {
  const pageSize = pagination.value.pageSize;
  // Only show "all" if page size is larger than all available options in pageSizes
  const maxPageSizeOption = Math.max(...props.pageSizes);
  const isAllSelected = pageSize > maxPageSizeOption;
  return isAllSelected ? "all" : `${pageSize}`;
});

const currentPageSizeDisplay = computed(() => {
  const pageSize = pagination.value.pageSize;
  const maxPageSizeOption = Math.max(...props.pageSizes);
  const isAllSelected = pageSize > maxPageSizeOption;
  return isAllSelected ? "All" : `${pageSize}`;
});

// Smoothly tween the floating pill's width when its action content changes
// width (e.g. a button label swaps "Mark as checked in" ↔ "Mark as not
// checked in"). CSS can't transition intrinsic (auto) widths, so we FLIP:
// lock the old px width, force a reflow, then animate to the new px width.
// The `.t-resize` class supplies the transition timing (transitions-dev 01).
const pillEl = ref(null);
let pillObserver = null;
let lastPillWidth = 0;
let pillAnimating = false;
let pillResetTimer = null;

const prefersReducedMotion = () =>
  import.meta.client &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const teardownPillObserver = () => {
  if (pillObserver) {
    pillObserver.disconnect();
    pillObserver = null;
  }
  if (pillResetTimer) {
    clearTimeout(pillResetTimer);
    pillResetTimer = null;
  }
  lastPillWidth = 0;
  pillAnimating = false;
};

const setupPillObserver = (el) => {
  lastPillWidth = 0;
  pillObserver = new ResizeObserver(() => {
    // Ignore the resize events caused by our own inline-width writes.
    if (pillAnimating) {
      return;
    }
    const newWidth = el.offsetWidth;
    if (!newWidth) {
      return;
    }
    // First measurement after the pill appears — record the baseline only;
    // the entrance itself is handled by the panel-reveal transition.
    if (lastPillWidth === 0 || newWidth === lastPillWidth) {
      lastPillWidth = newWidth;
      return;
    }
    const fromWidth = lastPillWidth;
    lastPillWidth = newWidth;
    if (prefersReducedMotion()) {
      return;
    }
    pillAnimating = true;
    el.style.width = `${fromWidth}px`;
    void el.offsetWidth; // force reflow so the next assignment transitions
    el.style.width = `${newWidth}px`;
    const finish = () => {
      el.style.width = "";
      pillAnimating = false;
      el.removeEventListener("transitionend", onTransitionEnd);
      if (pillResetTimer) {
        clearTimeout(pillResetTimer);
        pillResetTimer = null;
      }
    };
    const onTransitionEnd = (event) => {
      if (event.propertyName === "width") {
        finish();
      }
    };
    el.addEventListener("transitionend", onTransitionEnd);
    pillResetTimer = setTimeout(finish, 450); // fallback if transitionend misfires
  });
  pillObserver.observe(el);
};

watch(pillEl, (el, prevEl) => {
  if (prevEl) {
    teardownPillObserver();
  }
  if (el) {
    setupPillObserver(el);
  }
});

onBeforeUnmount(teardownPillObserver);

// ── Pinned actions column ───────────────────────────────────────────────────
// A wide table buries its own row menu: the actions column is last, so reaching
// it means scrolling past everything else, and on a phone that is roughly a
// thousand pixels of sideways drag. Sticking it to the right edge costs nothing
// when the table already fits.
//
// Plain sticky rather than TanStack's columnPinningFeature: there is exactly one
// pinned column and it is always last, so the offset is a constant `right: 0`
// and none of that feature's offset arithmetic or extra state slices buy
// anything. `Table`'s root element IS the `overflow-x: auto` container, which is
// what `position: sticky` resolves against.
const tableRef = ref(null);
const scrollHost = computed(() => tableRef.value?.$el ?? null);

// The divider only earns its place while there is still something to scroll to.
// At rest, or once the reader is already at the right edge, the pinned cell sits
// where it would sit anyway and a rule beside it reads as a stray line.
//
// One subtraction against the live geometry rather than a library's arrived-state
// flag: the condition is the whole feature, and it is worth being able to read it
// here. The 1px of slack absorbs fractional layout widths that would otherwise
// make the divider flicker at the end of a scroll.
const hostWidth = ref(0);
const pinDividerHidden = ref(true);

const syncPinDivider = () => {
  const el = scrollHost.value;
  pinDividerHidden.value = !el || el.scrollWidth - el.clientWidth - el.scrollLeft <= 1;
};

// Same signals feed the flex column: it has to be recomputed whenever the space
// available to the table changes.
const syncHostWidth = () => {
  hostWidth.value = scrollHost.value?.clientWidth ?? 0;
};

// The listener follows the element rather than being bound once: `scrollHost` is
// null until the table mounts, and it changes again if the table is re-created.
// `flush: "post"` so the element exists by the time the watcher runs.
//
// Worth knowing when testing this: assigning `scrollLeft` from a script does NOT
// fire a scroll event in Chrome, so a console check will show the divider frozen
// while a real wheel or trackpad scroll updates it correctly. Verify by scrolling.
let detachPinScroll = null;

watch(
  scrollHost,
  (el) => {
    detachPinScroll?.();
    detachPinScroll = null;
    if (!el) {
      return;
    }
    el.addEventListener("scroll", syncPinDivider, { passive: true });
    detachPinScroll = () => el.removeEventListener("scroll", syncPinDivider);
    syncPinDivider();
    syncHostWidth();
  },
  { immediate: true, flush: "post" }
);

onBeforeUnmount(() => detachPinScroll?.());

// Also on resize: a window that grows until the table fits stops scrolling, and
// nothing else would tell us the overflow is gone.
useResizeObserver(scrollHost, () => {
  syncHostWidth();
  syncPinDivider();
});

// Both conditions on purpose. A table that ever puts `actions` somewhere other
// than last falls back to today's behaviour instead of pinning the wrong cell.
const isPinnedCell = (columnId, index, total) =>
  props.pinActions && columnId === "actions" && index === total - 1;

// Width computed here rather than handed to the layout algorithm. `width: auto`
// plus a `min-width` looks like the obvious way to do this and does not work:
// fixed-layout ignores the min-width and gives the auto column whatever is left,
// which measured 171px at a 1137px container and 0px at 800px - the flex column
// is the first thing squeezed, which is the opposite of what it is for.
//
// So: the flex column gets the leftover, or its own declared size when there is
// no leftover. The sum then equals the container exactly, which is what stops the
// browser distributing slack across every other column.
const flexColumnWidth = computed(() => {
  const columns = table.getVisibleFlatColumns?.() ?? [];
  const flex = columns.find((column) => column.id === props.flexColumn);
  if (!flex) {
    return null;
  }
  const others = columns.reduce(
    (sum, column) => (column.id === props.flexColumn ? sum : sum + column.getSize()),
    0
  );
  return Math.max(flex.getSize(), hostWidth.value - others);
});

// A cell scrolls its own overflow rather than clipping it. `scroll-fade-x` was
// already on every cell but inert: the mask's scroll-timeline needs the cell to BE
// a scroll container, and the table's old `[&_td]:overflow-hidden` meant it never
// was - so the fade never ran and a value wider than its column was simply cut.
// The three classes travel together, the same trio the bulk-action pill uses.
// `select` keeps `overflow-hidden`: its checkbox sits 7px past a 28px cell and
// there is nothing there worth scrolling to.
const cellWidth = (column) =>
  column.id === props.flexColumn && flexColumnWidth.value !== null
    ? { width: `${flexColumnWidth.value}px` }
    : { width: `${column.getSize()}px` };

const PIN_BASE = "sticky right-0 z-1 bg-background";
const PIN_DIVIDER =
  "after:bg-border after:pointer-events-none after:absolute after:inset-y-0 after:left-0 after:w-px after:content-['']";

const pinnedHeadClass = computed(() => [PIN_BASE, pinDividerHidden.value ? "" : PIN_DIVIDER]);

const pinnedCellClass = computed(() => [
  PIN_BASE,
  // Centred, not right-aligned. Row actions render as `flex justify-end`, which
  // was right while the column was the last thing at the end of a long scroll -
  // it hugged the table's edge. Pinned, the column is its own strip and the
  // button reads as off-centre against it, so the pin re-centres what it froze.
  "[&>div]:justify-center",
  // Padding follows the scroll state, because the two states are different
  // problems. While the column floats over content it is a strip of its own and
  // the trigger has to sit dead centre in it - anything off-centre reads as a
  // mistake. Once the reader hits the end, the cell's right edge IS the table
  // border, and that inset should match every other last cell in the product
  // rather than shrink because this column happens to be pinned.
  //
  // The 4px nudge lands on the same frame the divider disappears on, so it reads
  // as one arrival rather than as jitter.
  pinDividerHidden.value ? "pl-1 pr-3" : "px-2",
  // The row's tint rides on a negative-z pseudo-element rather than on the cell.
  // The cell needs an opaque base or the columns sliding underneath show through
  // it, and `bg-muted/50` applied to the cell itself would do exactly that. A
  // sticky cell with a positive z-index makes its own stacking context, so a
  // `-z-10` child lands between that opaque base and the content.
  "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:content-['']",
  "group-hover:before:bg-muted/50 group-data-[state=selected]:before:bg-muted",
  pinDividerHidden.value ? "" : PIN_DIVIDER,
]);

// The skeleton pins too, otherwise the column visibly jumps into place the moment
// the real rows arrive.
const skeletonHeaders = computed(() => table.getHeaderGroups()[0]?.headers ?? []);

// Method to reset row selection
const resetRowSelection = () => {
  table.resetRowSelection();
};

// Expose table instance and methods for parent
defineExpose({
  table,
  resetRowSelection,
});
</script>
