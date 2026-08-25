<script setup lang="ts">
import { buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarDate, getLocalTimeZone, type DateValue } from "@internationalized/date";
import {
  YearPickerCell,
  YearPickerCellTrigger,
  YearPickerGrid,
  YearPickerGridBody,
  YearPickerGridRow,
  YearPickerHeader,
  YearPickerHeading,
  YearPickerNext,
  YearPickerPrev,
  YearPickerRoot,
  type Matcher,
  useDateFormatter,
} from "reka-ui";
import { toDate } from "reka-ui/date";
import { computed, type HTMLAttributes } from "vue";

/**
 * Year picker. v-model is a reka-native `DateValue` (Jan 1 of the picked year)
 * in both variants, so callers never learn which one is on screen.
 *
 * - `grid` (default): popover trigger around reka-ui's YearPickerRoot, a
 *   decade-aligned grid you page through. Good when the range is open-ended.
 * - `select`: a plain dropdown of every year in range, newest first. Better
 *   when the field is bounded tightly enough to list — a birth year capped at
 *   an age limit is 60-odd rows, and picking one is a scroll and a tap instead
 *   of arithmetic about which decade to page to.
 *
 * Part of the DatePicker family.
 */
const props = withDefaults(
  defineProps<{
    /**
     * Forwarded to the trigger button so a sibling `<FieldLabel :for>` has
     * something to point at. Popover renders no element of its own, and the
     * button lives behind `as-child`, so an id on the component would otherwise
     * never reach the DOM.
     */
    id?: string;
    class?: HTMLAttributes["class"];
    variant?: "grid" | "select";
    modelValue?: DateValue | null;
    placeholder?: DateValue;
    defaultPlaceholder?: DateValue;
    minValue?: DateValue;
    maxValue?: DateValue;
    isYearDisabled?: Matcher;
    isYearUnavailable?: Matcher;
    yearsPerPage?: number;
    disabled?: boolean;
    readonly?: boolean;
    locale?: string;
    size?: "default" | "sm" | "lg";
    align?: "start" | "center" | "end";
    placeholderText?: string;
  }>(),
  {
    modelValue: null,
    variant: "grid",
    disabled: false,
    locale: "en-US",
    size: "default",
    align: "start",
    placeholderText: "Pick a year",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: DateValue | undefined];
}>();

const isOpen = defineModel<boolean>("open", { default: false });

const formatter = useDateFormatter(props.locale);

const displayText = computed(() =>
  props.modelValue
    ? formatter.custom(toDate(props.modelValue), { year: "numeric" })
    : props.placeholderText,
);

function yearLabel(cell: DateValue): string {
  return formatter.custom(toDate(cell), { year: "numeric" });
}

/**
 * Years offered by the `select` variant, newest first.
 *
 * Bounds come from the same min/max the grid disables cells with, so the two
 * variants never disagree about what is choosable. The fallbacks match the
 * server's own year rules (1900-2100) rather than inventing a range here - but
 * an unbounded field is 200 rows, which is the argument for setting bounds,
 * not for this variant.
 */
const YEAR_FLOOR = 1900;
const YEAR_CEILING = 2100;

const selectableYears = computed<number[]>(() => {
  const min = props.minValue?.year ?? YEAR_FLOOR;
  const max = props.maxValue?.year ?? YEAR_CEILING;

  if (max < min) return [];

  const years: number[] = [];
  for (let year = max; year >= min; year--) {
    years.push(year);
  }

  return years;
});

/** Select works in strings; the model stays a DateValue either way. */
const selectedYear = computed<string | undefined>(() =>
  props.modelValue ? String(props.modelValue.year) : undefined,
);

function onSelectYear(value: unknown): void {
  const year = Number(value);
  emit("update:modelValue", Number.isInteger(year) ? new CalendarDate(year, 1, 1) : undefined);
}

/** SelectTrigger has no `lg`; fold it into the default rather than dropping it. */
const selectTriggerSize = computed<"sm" | "default">(() =>
  props.size === "sm" ? "sm" : "default",
);

function onSelect(value: DateValue | DateValue[] | undefined): void {
  const next = Array.isArray(value) ? value[0] : value;
  emit("update:modelValue", next);
  isOpen.value = false;
}

const cellClass = cn(
  buttonVariants({ variant: "ghost", size: "sm" }),
  "h-9 w-full rounded-md font-normal select-none",
  "data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground data-[selected]:focus:bg-primary data-[selected]:focus:text-primary-foreground",
  "[&[data-today]:not([data-selected])]:bg-muted [&[data-today]:not([data-selected])]:text-foreground",
  "data-[disabled]:text-muted-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  "data-[unavailable]:text-muted-foreground data-[unavailable]:line-through data-[unavailable]:opacity-100",
);
</script>

<template>
  <Select
    v-if="variant === 'select'"
    :model-value="selectedYear"
    :disabled="disabled"
    @update:model-value="onSelectYear"
  >
    <SelectTrigger :id="id" :size="selectTriggerSize" :class="cn('w-full', props.class)">
      <SelectValue :placeholder="placeholderText" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="year in selectableYears" :key="year" :value="String(year)">
        {{ year }}
      </SelectItem>
    </SelectContent>
  </Select>

  <Popover v-else v-model:open="isOpen" :modal="false">
    <PopoverTrigger as-child>
      <button
        :id="id"
        type="button"
        :disabled="disabled"
        :class="
          cn(
            'cn-input flex w-full min-w-0 items-center gap-2 text-left font-normal disabled:cursor-not-allowed disabled:opacity-50',
            size === 'sm' && 'h-8',
            size === 'lg' && 'h-10',
            !modelValue && 'text-muted-foreground',
            props.class,
          )
        "
      >
        <Icon name="hugeicons:calendar-04" class="size-4 shrink-0" />
        <span class="truncate">{{ displayText }}</span>
      </button>
    </PopoverTrigger>
    <PopoverContent
      class="w-auto rounded-xl p-0"
      :align="align"
      :collision-padding="8"
    >
      <YearPickerRoot
        v-slot="{ grid }"
        :model-value="modelValue ?? undefined"
        :placeholder="placeholder"
        :default-placeholder="defaultPlaceholder"
        :min-value="minValue"
        :max-value="maxValue"
        :is-year-disabled="isYearDisabled"
        :is-year-unavailable="isYearUnavailable"
        :years-per-page="yearsPerPage"
        :disabled="disabled"
        :readonly="readonly"
        :locale="locale"
        initial-focus
        data-slot="year-picker"
        class="cn-calendar w-[15.5rem] p-3"
        @update:model-value="onSelect"
      >
        <YearPickerHeader class="relative flex min-h-8 items-center justify-center">
          <YearPickerPrev
            :class="
              cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'absolute left-1 size-7 p-0 select-none aria-disabled:opacity-50',
              )
            "
          >
            <Icon name="lucide:chevron-left" class="size-4" />
          </YearPickerPrev>
          <YearPickerHeading class="text-sm font-medium select-none" />
          <YearPickerNext
            :class="
              cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'absolute right-1 size-7 p-0 select-none aria-disabled:opacity-50',
              )
            "
          >
            <Icon name="lucide:chevron-right" class="size-4" />
          </YearPickerNext>
        </YearPickerHeader>
        <YearPickerGrid class="mt-3 w-full border-collapse">
          <YearPickerGridBody>
            <YearPickerGridRow
              v-for="(row, i) in grid.rows"
              :key="i"
              class="flex w-full gap-1 [&:not(:first-child)]:mt-1"
            >
              <YearPickerCell
                v-for="cell in row"
                :key="cell.toString()"
                :date="cell"
                class="flex-1"
              >
                <YearPickerCellTrigger :year="cell" :class="cellClass">
                  {{ yearLabel(cell) }}
                </YearPickerCellTrigger>
              </YearPickerCell>
            </YearPickerGridRow>
          </YearPickerGridBody>
        </YearPickerGrid>
      </YearPickerRoot>
    </PopoverContent>
  </Popover>
</template>
