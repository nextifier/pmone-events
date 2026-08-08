<template>
  <div class="frame">
    <div class="frame-panel bg-background -m-px overflow-hidden p-0!">
      <Table class="[&_td]:scroll-fade-x table-fixed [&_td]:overflow-hidden">
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
            class="tracking-tight hover:bg-transparent"
          >
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              :style="{ width: `${header.getSize()}px` }"
              class="h-11"
            >
              <template v-if="!header.isPlaceholder">
                <div
                  v-if="header.column.getCanSort()"
                  class="flex h-full cursor-pointer items-center gap-x-3 select-none"
                  tabindex="0"
                  role="button"
                  @click="header.column.getToggleSortingHandler()?.($event)"
                  @keydown="onHeaderKeydown($event, header)"
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

        <TableBody ref="bodyRef">
          <tr v-if="paddingTop > 0" aria-hidden="true">
            <td
              :colspan="leafCount"
              :style="{ height: `${paddingTop}px`, padding: 0, border: 0 }"
            />
          </tr>

          <tr
            v-for="vRow in virtualRows"
            :key="rows[vRow.index]?.id ?? vRow.index"
            :data-index="vRow.index"
            :ref="measureElement"
            class="hover:bg-muted/50 group border-b tracking-tight"
          >
            <td
              v-for="cell in rows[vRow.index]?.getVisibleCells() || []"
              :key="cell.id"
              :style="{ width: `${cell.column.getSize()}px` }"
              class="px-2 py-2.5 align-middle whitespace-nowrap"
            >
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </td>
          </tr>

          <tr v-if="paddingBottom > 0" aria-hidden="true">
            <td
              :colspan="leafCount"
              :style="{ height: `${paddingBottom}px`, padding: 0, border: 0 }"
            />
          </tr>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  ref,
  onMounted,
  onActivated,
  onBeforeUnmount,
  nextTick,
} from "vue";
import {
  columnSizingFeature,
  columnVisibilityFeature,
  createSortedRowModel,
  FlexRender,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from "@tanstack/vue-table";
import { useWindowVirtualizer } from "@tanstack/vue-virtual";

const props = defineProps({
  data: { type: Array, default: () => [] },
  columns: { type: Array, required: true },
  initialSorting: {
    type: Array,
    default: () => [{ id: "brand_name", desc: false }],
  },
});

const sorting = ref(props.initialSorting);

// TanStack v9 resolves features statically; `sortFns` is registered so the
// string sort names columns pass (including the default "auto") still resolve.
const features = tableFeatures({
  // `header.getSize()` / `column.getSize()` drive the virtual column widths;
  // both only exist once columnSizingFeature is registered.
  columnSizingFeature,
  columnVisibilityFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
});

const table = useTable({
  features,
  get data() {
    return props.data || [];
  },
  get columns() {
    return props.columns;
  },
  state: {
    get sorting() {
      return sorting.value;
    },
  },
  onSortingChange: (updater) => {
    sorting.value =
      typeof updater === "function" ? updater(sorting.value) : updater;
  },
  enableSortingRemoval: false,
});

const rows = computed(() => table.getRowModel().rows);
const leafCount = computed(() => table.getVisibleLeafColumns().length);

const onHeaderKeydown = (event, header) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    header.column.getToggleSortingHandler()?.(event);
  }
};

// ----- Window virtualizer (spacer-row pattern) -----
const bodyRef = ref(null);
const scrollMargin = ref(0);
const measureScrollMargin = () => {
  const el = bodyRef.value?.$el;
  if (!el || typeof window === "undefined") return;
  scrollMargin.value = el.getBoundingClientRect().top + window.scrollY;
};

const virtualizerOptions = computed(() => ({
  count: rows.value.length,
  estimateSize: () => 56,
  overscan: 8,
  scrollMargin: scrollMargin.value,
  getItemKey: (i) => rows.value[i]?.id ?? i,
}));

const rowVirtualizer = useWindowVirtualizer(virtualizerOptions);
const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems());
const totalSize = computed(() => rowVirtualizer.value.getTotalSize());

// window virtualizer: virtualItem.start/end are in document coordinates
// (include scrollMargin). The tbody already sits at scrollMargin, so subtract
// it to get spacer heights relative to the tbody.
const paddingTop = computed(() =>
  virtualRows.value.length
    ? Math.max(0, virtualRows.value[0].start - scrollMargin.value)
    : 0,
);
const paddingBottom = computed(() =>
  virtualRows.value.length
    ? totalSize.value -
      (virtualRows.value[virtualRows.value.length - 1].end - scrollMargin.value)
    : 0,
);

const measureElement = (el) => {
  if (el) rowVirtualizer.value?.measureElement(el);
};

let onResize = null;
onMounted(() => {
  measureScrollMargin();
  onResize = () => measureScrollMargin();
  window.addEventListener("resize", onResize, { passive: true });
});

// Keepalive reaktivasi (balik dari brand detail): ukur ulang scrollMargin +
// reset cache virtualizer supaya spacer/posisi baris tidak berantakan.
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
