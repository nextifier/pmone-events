<script setup lang="ts">
import {
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxViewport,
} from "@/components/ui/combobox";
import { Flag } from "@/components/ui/flag";
import { InputGroupAddon } from "@/components/ui/input-group";
import { LucideCheck, LucideCircleDashed } from "@lucide/vue";
import { ComboboxRoot, ComboboxVirtualizer, useFilter } from "reka-ui";
import { computed, nextTick, ref, watch } from "vue";

interface Option {
  value: string;
  label: string;
  /**
   * Muted text on the right of the row, and searchable. Set it only when the
   * label alone is ambiguous: an all-province city list carries the province
   * here, because Indonesia has regencies that share a name.
   */
  description?: string;
  [key: string]: string | boolean | undefined;
}

interface LocationComboboxProps {
  /**
   * Forwarded to the native search input, so a sibling `<FieldLabel :for>` has
   * something to point at. Without it the label was inert: clicking it did
   * nothing and a screen reader announced the field unnamed.
   */
  id?: string;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  /**
   * Labels lifted above the rest, in the order given here. While `group` is on
   * they stay under their own heading and lift that group instead, so a pinned
   * row is never read out of the province it belongs to.
   */
  pinned?: string[];
  /**
   * Bucket the rows under a heading taken from `option.description`, instead of
   * repeating that text on every row. Turn it on for a list long enough that the
   * same description recurs dozens of times: 514 regencies repeating their
   * province is what squeezed the city name off the row on a phone.
   *
   * Searching keeps the headings. Typing used to drop back to flat rows with the
   * description inline, which meant one field answered in two different layouts -
   * and the flat one is the layout the grouping exists to avoid.
   */
  group?: boolean;
  /** Headings to lift to the top, in order. The rest keep the options' order. */
  groupOrder?: string[];
  /**
   * Show a country flag beside each option and beside the selected value.
   * Only turn this on for lists whose `option.value` is an ISO 3166-1 alpha-2
   * code. Province/city lists key off numeric codes; the `isIso2` guard below
   * makes a stray `show-flag` on those a no-op rather than a broken image.
   */
  showFlag?: boolean;
}

const modelValue = defineModel<string>("modelValue", { default: "" });

const {
  id,
  options,
  placeholder,
  disabled,
  pinned = [],
  group = false,
  groupOrder = [],
  showFlag = false,
} = defineProps<LocationComboboxProps>();

/**
 * Whether the field will accept an on-screen keyboard yet. See the template for
 * why it starts closed and what opens it.
 */
const keyboardMode = ref<"none" | "text">("none");

/**
 * Controlled, because the list must open on a pointer landing in the field and
 * on nothing else. `open-on-focus` also fired for focus arriving through the
 * label, and `<FieldLabel>` spans its whole row: clicking the blank space beside
 * "Country" dropped a dropdown on someone who had only clicked the gap. Focus
 * still lands on the input either way, and typing or ArrowDown still opens it,
 * so keyboard use is unchanged.
 */
const open = ref(false);

/** Only for `highlightSelected`, which the controlled open above has to run itself. */
const rootRef = ref<{ highlightSelected?: () => void } | null>(null);

const searchTerm = ref("");
const { contains } = useFilter({ sensitivity: "base" });

const selectedOption = computed(
  () => options.find((opt) => opt.label === modelValue.value) ?? null
);

const filteredOptions = computed(() =>
  options.filter(
    (option) =>
      contains(option.label, searchTerm.value) ||
      contains(option.value, searchTerm.value) ||
      // So a city list spanning every province can be searched by province too.
      (typeof option.description === "string" && contains(option.description, searchTerm.value))
  )
);

const pinnedSet = computed(() => new Set(pinned));

/**
 * Position in `pinned`, or last. The caller lists them the way it wants them
 * read - Jakarta before Bogor - while the source data is sorted by region code,
 * which would scatter them.
 */
const pinnedRank = computed(() => new Map(pinned.map((label, index) => [label, index])));

const rankOf = (option: Option) => pinnedRank.value.get(option.label) ?? Number.MAX_SAFE_INTEGER;

const pinnedOptions = computed(() =>
  filteredOptions.value.filter((opt) => pinnedSet.value.has(opt.label)).sort((a, b) => rankOf(a) - rankOf(b))
);

const remainingOptions = computed(() =>
  filteredOptions.value.filter((opt) => !pinnedSet.value.has(opt.label))
);

const noneOption: Option = { value: "__none__", label: "None" };

const isSearching = computed(
  () => searchTerm.value !== "" && searchTerm.value !== modelValue.value
);

type Row = Option | { heading: string };

/**
 * One flat array either way, because the virtualizer needs an index it can size
 * and scroll. Headings ride along as rows rather than wrapping their items in a
 * `ComboboxGroup`, which cannot span a virtual window.
 */
const flatOptions = computed<Row[]>(() => {
  const head: Row[] = isSearching.value ? [] : [noneOption];

  if (!group) {
    return [...head, ...pinnedOptions.value, ...remainingOptions.value];
  }

  const buckets = new Map<string, Option[]>();
  for (const option of filteredOptions.value) {
    const key = typeof option.description === "string" ? option.description : "";
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(option);
  }

  /**
   * A pinned row keeps its heading instead of being lifted into a headerless
   * block on top: the whole point of grouping is that every row is read under
   * its province, and Jabodetabek spans three of them. So the pin works twice -
   * it floats the city to the top of its own group, and it floats that group up
   * the list. Jakarta, then Tangerang under Banten, then Bekasi, Depok and Bogor
   * under Jawa Barat: the order asked for, with nothing said twice.
   */
  const groupRank = new Map<string, number>();
  for (const [name, bucket] of buckets) {
    const best = Math.min(...bucket.map(rankOf));
    if (best !== Number.MAX_SAFE_INTEGER) {
      groupRank.set(name, best);
      bucket.sort((a, b) => rankOf(a) - rankOf(b));
    }
  }

  const ordered = [
    ...groupOrder.filter((name) => buckets.has(name)),
    ...[...groupRank.keys()]
      .filter((name) => !groupOrder.includes(name))
      .sort((a, b) => groupRank.get(a)! - groupRank.get(b)!),
    ...[...buckets.keys()].filter((name) => !groupOrder.includes(name) && !groupRank.has(name)),
  ];

  const rows: Row[] = [...head];
  for (const name of ordered) {
    if (name) rows.push({ heading: name });
    rows.push(...buckets.get(name)!);
  }
  return rows;
});

/**
 * Every row, heading included, is this tall. The virtualizer lays rows out from
 * this number, so a heading that renders taller than its slot is overlapped by
 * the row under it - and a heading that renders SHORTER moves every offset below
 * it, which is worse than it sounds: reka reuses the row elements and skips the
 * style patch on them, so any change to the row mix left rows drawn 4px off
 * until a hover happened to re-render one and snap it into place. One height for
 * everything means `translateY` for a given index is always `index * 32` and can
 * never go stale.
 *
 * The heading carries its own `h-8` rather than being left to whatever
 * `.cn-combobox-label` pads it to. Nine palettes style that class and they do
 * not agree on the padding, so a height read off any one of them is wrong in
 * the other eight.
 */
const ROW_HEIGHT = 32;

const lastPinnedValue = computed(() => pinnedOptions.value.at(-1)?.value);

const isIso2 = (value: string) => /^[A-Za-z]{2}$/.test(value);

// Hidden while the user types, because `searchTerm` has replaced the display
// value by then and the flag would no longer describe what the field reads.
// Reka resets `searchTerm` to the selected label on close and this component
// clears it on open, so both of those states keep the flag and the field never
// jumps width on the most common interaction.
const showSelectedFlag = computed(
  () =>
    showFlag &&
    !isSearching.value &&
    !!selectedOption.value &&
    isIso2(selectedOption.value.value)
);

function handleSelect(option: Option) {
  if (option.value === "__none__") {
    modelValue.value = "";
  } else {
    modelValue.value = option.label;
  }
  searchTerm.value = "";
}

function handleOpenChange(value: boolean) {
  open.value = value;
  if (value) {
    searchTerm.value = "";
    keyboardMode.value = "none";
  }
}

function handleFieldPointerDown() {
  // Already open, so this tap is a deliberate one on the field: let the keyboard
  // up. Opening resets it, which is what holds the keyboard back on the way in.
  if (open.value) {
    keyboardMode.value = "text";
    return;
  }
  handleOpenChange(true);
  // Reka runs this from its own `onOpenChange`, which setting `open` from the
  // outside does not reach. Without it a list reopened on a chosen city starts
  // back at Aceh instead of at that city.
  nextTick(() => rootRef.value?.highlightSelected?.());
}

// Keep searchTerm in sync - when modelValue changes externally, clear search
watch(modelValue, () => {
  searchTerm.value = "";
});
</script>

<template>
  <ComboboxRoot
    ref="rootRef"
    :model-value="selectedOption"
    :ignore-filter="true"
    :open="open"
    :disabled="disabled"
    @update:model-value="
      (val: any) => {
        if (val) handleSelect(val);
      }
    "
    @update:open="handleOpenChange"
  >
    <ComboboxAnchor class="w-full">
      <!-- The shared Combobox field, so the border, focus ring, invalid and disabled
           states are the same here as in every other combobox. -->
      <!-- The on-screen keyboard is held back for the AUTO-focus only, not for
           good. `ComboboxRoot.onOpenChange` calls `inputElement.focus()`
           unconditionally - reka 2.10.1 exposes no prop to opt out, so don't go
           looking for one - and a keyboard rising on its own would take half the
           viewport away from the list nobody has scrolled yet.
           `inputmode="none"` suppresses it, but leaving it there permanently
           also refused the keyboard to anyone who deliberately tapped the field
           to search. So it lifts on a pointerdown that lands while the list is
           already open - the tap that opened it only wanted the list.
           Reset on every open, so the next visit starts quiet again.
           This only ever affected VIRTUAL keyboards; desktop type-to-filter was
           never touched. The attribute reaches the native input through
           `ComboboxInput.vue`'s `$attrs`. -->
      <ComboboxInput
        :id="id"
        v-model="searchTerm"
        :inputmode="keyboardMode"
        @pointerdown="handleFieldPointerDown"
        :display-value="() => modelValue || ''"
        :placeholder="placeholder || 'Select'"
        :disabled="disabled"
        class="w-full"
      >
        <!-- Rendered last but `order-first` on the inline-start addon puts it
             left of the input, and `cn-input-group` tightens the input's own
             left padding to match. -->
        <InputGroupAddon v-if="showSelectedFlag" align="inline-start">
          <Flag :country="selectedOption!.value" :country-name="selectedOption!.label" />
        </InputGroupAddon>
      </ComboboxInput>
    </ComboboxAnchor>

    <ComboboxList class="w-(--reka-combobox-trigger-width)">
      <ComboboxViewport class="p-1">
        <ComboboxEmpty class="px-2 py-4">No results found.</ComboboxEmpty>

        <ComboboxVirtualizer
          v-slot="{ option }"
          :options="flatOptions"
          :estimate-size="ROW_HEIGHT"
          :text-content="(opt: Row) => ('heading' in opt ? '' : opt.label)"
        >
          <!-- Not a ComboboxItem: a heading is not selectable and must not enter
               the collection, or arrow keys would stop on it. -->
          <div
            v-if="'heading' in option"
            class="cn-combobox-label flex h-8 items-center py-0"
            role="presentation"
          >
            {{ option.heading }}
          </div>

          <ComboboxItem
            v-else
            :value="option"
            class="h-8 w-full"
            :class="[
              option.value === '__none__' && 'text-muted-foreground italic',
              !group &&
                option.value === lastPinnedValue &&
                remainingOptions.length > 0 &&
                'border-border rounded-b-none border-b',
            ]"
          >
            <!-- ONE row layout for every list this component renders.
                 `.cn-combobox-item` reserves `pr-8` for an absolutely-positioned
                 check; the check is drawn inline here instead, so that reserve is
                 cancelled once, on the row, rather than per branch. `flex-1` and
                 not `w-full`: an explicit width pins the right edge at the padding
                 edge, and the negative margin then does nothing. Every column
                 then lines up the same way whether the row carries a description,
                 whether it is selected, and whether the list is grouped. Two
                 branches used to share this space and they kept drifting apart. -->
            <span class="-me-6 flex min-w-0 flex-1 items-center gap-1.5">
              <!-- Fixed box the width of a Flag (24x16) so the flagless "None"
                   row still lines its label up with the country rows. An empty
                   <Flag> would not do: it always paints its placeholder tint.
                   "None" gets a dashed circle rather than blank space: an empty
                   slot beside a column of flags reads as a failed image. -->
              <span v-if="showFlag" class="flex h-4 w-6 shrink-0 items-center justify-center">
                <Flag
                  v-if="isIso2(option.value)"
                  :country="option.value"
                  :country-name="option.label"
                />
                <LucideCircleDashed
                  v-else-if="option.value === '__none__'"
                  class="size-4"
                  aria-hidden="true"
                />
              </span>

              <!-- The answer being chosen, so it is the part that keeps its width. -->
              <span class="min-w-0 grow basis-auto truncate">{{ option.label }}</span>

              <!-- Context, not the answer: capped and first to shrink, so a long
                   province gives room back to the city rather than cutting
                   "Kabupaten Bangka Barat" down to "Kabupaten Ba...". Dropped
                   while grouped, where the heading already says it. -->
              <span
                v-if="option.description && !group"
                class="text-muted-foreground max-w-[45%] min-w-0 shrink-[3] truncate text-sm"
              >
                {{ option.description }}
              </span>

              <!-- Always present, so the columns to its left do not shift between
                   the selected row and its neighbours. -->
              <span class="flex size-4 shrink-0 items-center justify-center" aria-hidden="true">
                <LucideCheck v-if="option.label === modelValue" class="size-4" />
              </span>
            </span>
          </ComboboxItem>
        </ComboboxVirtualizer>
      </ComboboxViewport>
    </ComboboxList>
  </ComboboxRoot>
</template>
