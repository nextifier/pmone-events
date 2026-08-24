<script setup lang="ts">
import {
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxViewport,
} from "@/components/ui/combobox";
import { Flag } from "@/components/ui/flag";
import { InputGroupAddon } from "@/components/ui/input-group";
import { LucideCheck, LucideCircleDashed } from "@lucide/vue";
import { ComboboxRoot, ComboboxVirtualizer, useFilter } from "reka-ui";
import { computed, ref, watch } from "vue";

interface Option {
  value: string;
  label: string;
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
  pinned?: string[];
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
  showFlag = false,
} = defineProps<LocationComboboxProps>();

/**
 * Whether the field will accept an on-screen keyboard yet. See the template for
 * why it starts closed and what opens it.
 */
const keyboardMode = ref<"none" | "text">("none");

const searchTerm = ref("");
const { contains } = useFilter({ sensitivity: "base" });

const selectedOption = computed(
  () => options.find((opt) => opt.label === modelValue.value) ?? null
);

const filteredOptions = computed(() =>
  options.filter(
    (option) => contains(option.label, searchTerm.value) || contains(option.value, searchTerm.value)
  )
);

const pinnedSet = computed(() => new Set(pinned));

const pinnedOptions = computed(() =>
  filteredOptions.value.filter((opt) => pinnedSet.value.has(opt.label))
);

const remainingOptions = computed(() =>
  filteredOptions.value.filter((opt) => !pinnedSet.value.has(opt.label))
);

const noneOption: Option = { value: "__none__", label: "None" };

const isSearching = computed(
  () => searchTerm.value !== "" && searchTerm.value !== modelValue.value
);

const flatOptions = computed<Option[]>(() => [
  ...(!isSearching.value ? [noneOption] : []),
  ...pinnedOptions.value,
  ...remainingOptions.value,
]);

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

// Keep searchTerm in sync - when modelValue changes externally, clear search
watch(modelValue, () => {
  searchTerm.value = "";
});
</script>

<template>
  <ComboboxRoot
    :model-value="selectedOption"
    :ignore-filter="true"
    :open-on-focus="true"
    :disabled="disabled"
    @update:model-value="
      (val: any) => {
        if (val) handleSelect(val);
      }
    "
    @update:open="
      (open: boolean) => {
        if (open) {
          searchTerm = '';
          keyboardMode = 'none';
        }
      }
    "
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
           to search. So it lifts on the first pointerdown, which fires before
           focus: by the time the tap completes the input already accepts one.
           Reset on every open, so the next visit starts quiet again.
           This only ever affected VIRTUAL keyboards; desktop type-to-filter was
           never touched. The attribute reaches the native input through
           `ComboboxInput.vue`'s `$attrs`. -->
      <ComboboxInput
        :id="id"
        v-model="searchTerm"
        :inputmode="keyboardMode"
        @pointerdown="keyboardMode = 'text'"
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
        <ComboboxEmpty class="px-2 py-4 text-sm">No results found.</ComboboxEmpty>

        <ComboboxVirtualizer
          v-slot="{ option }"
          :options="flatOptions"
          :estimate-size="32"
          :text-content="(opt: Option) => opt.label"
        >
          <ComboboxItem
            :value="option"
            class="h-8 w-full"
            :class="[
              option.value === '__none__' && 'text-muted-foreground italic',
              option.value === lastPinnedValue &&
                remainingOptions.length > 0 &&
                'border-border rounded-b-none border-b',
            ]"
          >
            <!-- Fixed box the width of a Flag (24×16) so the flagless "None"
                 row still lines its label up with the country rows. An empty
                 <Flag> would not do: it always paints its placeholder tint.
                 "None" gets a dashed circle rather than blank space: an empty
                 slot beside a column of flags reads as a failed image. `size-4`
                 is the Flag's own height, and centring it in the same 24px box
                 puts it on the flags' axis. No colour class - it inherits the
                 row's `text-muted-foreground`. -->
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
            <span class="truncate">{{ option.label }}</span>
            <ComboboxItemIndicator>
              <LucideCheck class="ml-auto size-4" />
            </ComboboxItemIndicator>
          </ComboboxItem>
        </ComboboxVirtualizer>
      </ComboboxViewport>
    </ComboboxList>
  </ComboboxRoot>
</template>
