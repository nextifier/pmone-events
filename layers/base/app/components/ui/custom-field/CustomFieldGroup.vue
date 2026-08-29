<template>
  <div class="space-y-6">
    <!-- `empty:hidden`: a field can withdraw itself (a province whose country is
         not Indonesia renders nothing), and without this the wrapper would stay
         in the flow and `space-y-6` would leave a 24px hole where it used to be. -->
    <div
      v-for="(field, index) in visibleFields"
      :key="fieldKey(field)"
      :data-field-error="errorFor(field) ? '' : null"
      class="empty:hidden"
    >
      <CustomFieldRenderer
        :field="field"
        :is-first="index === 0"
        :model-value="modelValue[fieldKey(field)]"
        :error="errorFor(field)"
        :locale="locale"
        :label-size="labelSize"
        :disabled="disabled"
        :preview="preview"
        :existing-files="existingFiles[fieldKey(field)] || []"
        :context-values="contextValues"
        :derived-system-keys="derivedSystemKeys"
        :upload-handler="uploadHandler"
        :revert-handler="revertHandler"
        @update:model-value="update(field, $event)"
        @uploading="$emit('uploading', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, shallowRef, watch } from "vue";
import CustomFieldRenderer from "./CustomFieldRenderer.vue";
import { countries } from "./countries";
import {
  contextValuesFor,
  defaultValueFor,
  derivedFieldKeys,
  derivedLocationValues,
  normalizeField,
} from "./core";

// Auto-imported composable; all three repos sharing this folder ship it.
const { getCountryCode } = usePhoneCountry();

const props = defineProps({
  fields: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => ({}) },
  errors: { type: Object, default: () => ({}) },
  // e.g. "responses." or "project_custom_fields." — prefixes the error keys.
  errorPrefix: { type: String, default: "" },
  locale: { type: String, default: "en" },
  // Forwarded, not consumed. "lg" on standalone public surfaces where a field
  // label is a question the visitor reads; the group had been swallowing it, so
  // every consumer was stuck on dashboard-sized labels.
  labelSize: { type: String, default: "default" },
  disabled: { type: Boolean, default: false },
  preview: { type: Boolean, default: false },
  uploadHandler: { type: Function, default: null },
  revertHandler: { type: Function, default: null },
  // Already-submitted files, keyed by the same value-map key as modelValue:
  // { [fieldKey]: [{ id, name, url, size }] }.
  existingFiles: { type: Object, default: () => ({}) },
  // The value-map key: "ulid" (default) or "key" (brand profile).
  valueKey: { type: String, default: "ulid" },
  /**
   * The respondent's phone number, when the surrounding form already asks for
   * one. A blank country field is seeded from its dial code, because a checkout
   * that already knows the buyer is on +62 should not make them say so again.
   * Only ever fills a blank: a country they picked, or one that arrived with the
   * record, is never overwritten.
   */
  phone: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue", "uploading"]);

const fieldKey = (field) => String(field[props.valueKey] ?? field.ulid ?? field.id ?? "");

/**
 * A field switched off in the admin is off for whoever fills the form in, so
 * the group drops it rather than trusting each caller to remember. Callers kept
 * disagreeing - some filtered, some did not - and this is the one place every
 * surface goes through.
 *
 * `!== false` rather than falsy: a locally built draft field may carry no
 * `is_active` at all, and that means "not stated", not "hidden".
 */
const activeFields = computed(() => props.fields.filter((field) => field.is_active !== false));

/**
 * What actually gets rendered. A field the form fills in on the respondent's
 * behalf is dropped here rather than shown as a control nobody has to touch; it
 * stays in `activeFields`, so it is still answered, still stored, still
 * exported. See `derivedFieldKeys`.
 */
const derivedKeys = computed(() => derivedFieldKeys(props.fields, props.valueKey));
const visibleFields = computed(() =>
  activeFields.value.filter((field) => !derivedKeys.value.has(fieldKey(field)))
);

/**
 * The same set named by `system_key`, which is how a dependent field refers to
 * its parent. A city whose province field is hidden must not narrow itself to
 * that province: the province is only set because the city set it, so narrowing
 * would lock the list to one province the moment anything is chosen.
 */
const derivedSystemKeys = computed(() =>
  activeFields.value
    .filter((field) => derivedKeys.value.has(fieldKey(field)) && field?.system_key)
    .map((field) => field.system_key)
);

/**
 * Answers re-keyed by `system_key`, for fields that depend on a sibling.
 *
 * The renderer is handed one field and one value, so a dependent select (city
 * narrowing on province) has no way to see its parent. The group is the only
 * component holding every answer, so the lookup is built here. Keyed by
 * `system_key` rather than ulid because `settings.depends_on` names a stable
 * library key, not a per-event id.
 */
const contextValues = computed(() =>
  contextValuesFor(props.fields, props.modelValue, props.valueKey)
);

/**
 * Loaded only when a city field is on screen, mirroring how the renderer imports
 * it. ~39 KB, and most forms never ask for a city.
 */
const regions = shallowRef(null);
const fieldOfType = (type) => activeFields.value.find((field) => field?.type === type) ?? null;
const cityField = computed(() => fieldOfType("city"));
const countryField = computed(() => fieldOfType("country"));

watch(
  cityField,
  async (field) => {
    if (!field || regions.value) return;
    regions.value = await import("./indonesiaRegions");
  },
  { immediate: true }
);

/**
 * Both keys have to land in one emit, or the second would spread a stale
 * `modelValue` and drop the first.
 */
const update = (field, value) => {
  emit("update:modelValue", {
    ...props.modelValue,
    [fieldKey(field)]: value,
    ...derivedLocationValues(field, value, activeFields.value, regions.value, props.valueKey),
  });
};

/**
 * A stored record can arrive carrying a city and a province that no longer agree,
 * because region data gets corrected over time. While the province is hidden
 * that mismatch would fail validation against a control nobody can see, so it is
 * re-derived from the city. Only ever while hidden: a province still on screen is
 * the respondent's to answer.
 */
const cityValue = computed(() =>
  cityField.value ? props.modelValue[fieldKey(cityField.value)] : null
);

watch(
  [regions, cityValue, derivedKeys],
  ([loaded, city, derived]) => {
    if (!loaded || !city || !derived.size || !cityField.value) return;
    const patch = derivedLocationValues(
      cityField.value,
      city,
      activeFields.value,
      loaded,
      props.valueKey
    );
    const [key] = Object.keys(patch);
    if (key && patch[key] !== props.modelValue[key]) {
      emit("update:modelValue", { ...props.modelValue, ...patch });
    }
  },
  { immediate: true }
);

// Seed a blank country from the phone's dial code. Never overwrites an answer.
watch(
  [() => props.phone, countryField],
  ([phone, field]) => {
    if (!phone || !field || props.modelValue[fieldKey(field)]) return;
    const iso = getCountryCode(phone);
    const label = iso ? (countries.find((row) => row.value === iso)?.label ?? "") : "";
    if (!label) return;
    emit("update:modelValue", { ...props.modelValue, [fieldKey(field)]: label });
  },
  { immediate: true }
);

// First error for a field, including nested keys (date_range .start/.end,
// array item .*) — the firstFieldError logic every consumer used to inline.
const errorFor = (field) => {
  const prefix = `${props.errorPrefix}${fieldKey(field)}`;
  const exact = props.errors[prefix];
  if (exact) return Array.isArray(exact) ? exact[0] : exact;
  const nestedKey = Object.keys(props.errors).find((key) => key.startsWith(`${prefix}.`));
  if (!nestedKey) return null;
  const nested = props.errors[nestedKey];
  return Array.isArray(nested) ? nested[0] : nested;
};

// Seed missing values with per-type defaults so controls render correctly.
onMounted(() => {
  const patch = {};
  for (const field of activeFields.value) {
    const key = fieldKey(field);
    if (props.modelValue[key] === undefined) {
      patch[key] = defaultValueFor(normalizeField(field, props.locale));
    }
  }
  if (Object.keys(patch).length) {
    emit("update:modelValue", { ...props.modelValue, ...patch });
  }
});
</script>
