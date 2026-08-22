<template>
  <PhoneInput
    :model-value="phoneValue"
    noUseBrowserLocale
    :country-code="activeCountry"
    :ignored-countries="['AC', 'TA']"
    class="flex"
    @update="handleResults"
    @update:country-code="handleCountryChange"
  >
    <template #selector="{ inputValue, updateInputValue, countries }">
      <Popover v-model:open="open">
        <PopoverTrigger as-child>
          <button
            type="button"
            data-slot="input"
            class="cn-input flex w-auto min-w-0 shrink-0 items-center gap-1 rounded-e-none border-e-0"
            :aria-label="t('phone.selectCountry')"
            :aria-invalid="isInvalid || undefined"
          >
            <Flag :country="inputValue" />
            <ChevronsUpDown class="h-4 w-4 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent class="w-[300px] p-0" :align="align">
          <Command :ignore-filter="true">
            <CommandInput v-model="countrySearch" :placeholder="t('phone.searchCountry')" />
            <CommandEmpty>{{ t("phone.noCountry") }}</CommandEmpty>
            <CommandList>
              <ComboboxViewport class="max-h-72 p-1">
                <ComboboxVirtualizer
                  v-slot="{ option }"
                  :options="filterCountries(countries)"
                  :estimate-size="32"
                  :text-content="(opt: any) => opt.name"
                >
                  <CommandItem
                    :value="option.name"
                    class="h-8 w-full gap-2"
                    @select="
                      () => {
                        updateInputValue(option.iso2);
                        open = false;
                        focused = true;
                      }
                    "
                  >
                    <Flag :country="option?.iso2" />
                    <span class="flex-1 truncate text-sm">{{ option.name }}</span>
                    <span class="text-foreground/50 text-sm">{{ option.dialCode }}</span>
                  </CommandItem>
                </ComboboxVirtualizer>
              </ComboboxViewport>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </template>

    <template #input="{ inputValue, updateInputValue, placeholder }">
      <!-- `id` is forwarded explicitly. Left to fall through it lands on
           PhoneInput's wrapper div, which is not a labelable element, so every
           `<FieldLabel for="...">` pointing at this control labelled nothing. -->
      <Input
        ref="phoneInput"
        :id="id"
        class="rounded-s-none"
        type="text"
        inputmode="tel"
        autocomplete="tel"
        :model-value="inputValue"
        @input="updateInputValue"
        :placeholder="placeholder"
        :required="required"
        :aria-invalid="isInvalid || undefined"
      />
    </template>
  </PhoneInput>
</template>

<script lang="ts" setup>
import { useFocus } from "@vueuse/core";
import PhoneInput from "base-vue-phone-input";
import { ChevronsUpDown } from "@lucide/vue";
import { ComboboxVirtualizer, useFilter } from "reka-ui";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    required?: boolean;
    /**
     * Forwarded to the number input so a `<FieldLabel for>` actually points at a
     * focusable control. Without it the attribute falls through to PhoneInput's
     * wrapper div and the field is left unlabelled.
     */
    id?: string;
    /**
     * Declared rather than left to fall through: the fallthrough target is
     * `PhoneInput`'s wrapper div, so the `aria-invalid:` rules on `.cn-input`
     * would never see it and an invalid phone field would keep a normal border
     * while every other field in the row turned red. Bound to both halves of
     * the group so the country button reddens with the number.
     */
    ariaInvalid?: boolean | "true" | "false";
    align?: "start" | "center" | "end";
  }>(),
  {
    align: "start",
  }
);

const isInvalid = computed(() => props.ariaInvalid === true || props.ariaInvalid === "true");

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const { t } = useI18n();
const { getCountryCode } = usePhoneCountry();

const open = ref(false);
const phoneInput = ref(null);
const { focused } = useFocus(phoneInput);

const countrySearch = ref("");
const { contains } = useFilter({ sensitivity: "base" });

const filterCountries = (countries: any[]) =>
  countrySearch.value
    ? countries.filter(
        (c) =>
          contains(c.name, countrySearch.value) ||
          c.dialCode?.includes(countrySearch.value) ||
          contains(c.iso2, countrySearch.value)
      )
    : countries;

watch(open, (isOpen) => {
  if (isOpen) countrySearch.value = "";
});

const phoneValue = ref(props.modelValue || "");
const activeCountry = ref<string>(
  (props.modelValue ? getCountryCode(props.modelValue) : null) || "ID"
);

let isInitializing = true;
let lastEmittedValue = props.modelValue || "";

onMounted(() => {
  nextTick(() => {
    isInitializing = false;
  });
});

const handleResults = (results: any) => {
  if (isInitializing) return;
  let value = "";
  if (results?.e164 && results?.isValid) {
    value = results.e164;
  } else if (results?.phoneNumber) {
    value = results.phoneNumber;
  }
  lastEmittedValue = value;
  emit("update:modelValue", value);
};

const handleCountryChange = (countryCode: string) => {
  activeCountry.value = countryCode;
};

watch(
  () => props.modelValue,
  (newVal) => {
    const incoming = newVal || "";
    if (incoming === lastEmittedValue) return;
    isInitializing = true;
    phoneValue.value = incoming;
    if (incoming) {
      const detected = getCountryCode(incoming);
      if (detected) activeCountry.value = detected;
    } else {
      activeCountry.value = "ID";
    }
    nextTick(() => {
      isInitializing = false;
    });
  }
);
</script>
