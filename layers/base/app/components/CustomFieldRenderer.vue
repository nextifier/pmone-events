<script setup>
/**
 * Renders one business-matching custom field by its type, mirroring the admin
 * Form Builder renderer (frontend/app/components/form-builder/PublicFieldRenderer.vue).
 *
 * EventCustomField is leaner than the Form Builder's FormField, so this adapts:
 * - keys by `field.id` (not ulid)
 * - reads `field.required` directly (no nested validation)
 * - `field.options` is a plain string array; `opt?.value ?? opt` handles both
 *   that and the {value,label} shape
 * - no placeholder/help_text/validation/settings -> sensible defaults
 * - excludes `file` (needs upload infra) and `section` (layout-only)
 *
 * Value formats sent up match what the backend stores/validates:
 *   text/email/phone/url/color/select/radio/country -> string
 *   number/slider/rating/linear_scale               -> number
 *   date "YYYY-MM-DD" | datetime "YYYY-MM-DD HH:mm" | time "HH:mm" -> string
 *   date_range -> { start: "YYYY-MM-DD", end: "YYYY-MM-DD" }
 *   checkbox/switch -> boolean
 *   multi_select/checkbox_group/tags -> string[]
 */
import { computed } from "vue";
import { Time } from "@internationalized/date";
import countries from "../data/countries.json";
import { Checkbox } from "./ui/checkbox";
import { DatePicker } from "./ui/date-picker";
import { Input } from "./ui/input";
import { InputLink } from "./ui/input-link";
import { InputNumber } from "./ui/input-number";
import { InputPhone } from "./ui/input-phone";
import { Label } from "./ui/label";
import { LocationCombobox } from "./ui/location-combobox";
import { MultiSelect } from "./ui/multi-select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { RangeCalendarPicker } from "./ui/range-calendar-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
} from "./ui/tags-input";
import { Textarea } from "./ui/textarea";

const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { default: null },
  error: { type: String, default: null },
});

const emit = defineEmits(["update:modelValue"]);

const fieldId = computed(() => `bm_${props.field.id}`);

// file needs upload infra BM doesn't wire; section is a layout-only divider.
const isSupported = computed(
  () => !["file", "section"].includes(props.field.type)
);
const isInlineLabelType = computed(() =>
  ["checkbox", "switch"].includes(props.field.type)
);

/* ----- Options (plain string array OR {value,label}) ----- */
const selectOptions = computed(() =>
  (props.field.options || []).map((opt) => ({
    value: String(opt?.value ?? opt),
    label: String(opt?.label ?? opt?.value ?? opt),
  }))
);

const multiSelectValue = computed(() =>
  (props.modelValue || []).map(
    (v) => selectOptions.value.find((o) => o.value === v) || { value: v, label: v }
  )
);

const handleMultiCheck = (checked, value) => {
  const current = props.modelValue || [];
  if (checked) {
    emit("update:modelValue", [...current, value]);
  } else {
    emit(
      "update:modelValue",
      current.filter((v) => v !== value)
    );
  }
};

/* ----- Date & time helpers (DatePicker/RangeCalendarPicker emit plain Date) ----- */
const pad = (n) => String(n).padStart(2, "0");

const toLocalDateString = (d) =>
  d instanceof Date && !isNaN(d)
    ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    : null;

const parseLocalDateString = (value) => {
  if (!value || typeof value !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
};

const toLocalDateTimeString = (d) =>
  d instanceof Date && !isNaN(d)
    ? `${toLocalDateString(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    : null;

const parseLocalDateTimeString = (value) => {
  if (!value || typeof value !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(value);
  return m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]))
    : null;
};

const parseTimeString = (value) => {
  if (!value || typeof value !== "string") return null;
  const m = /^(\d{1,2}):(\d{2})/.exec(value);
  return m ? new Time(Number(m[1]), Number(m[2])) : null;
};

const formatTimeValue = (time) =>
  time ? `${pad(time.hour)}:${pad(time.minute)}` : null;

const dateRangeValue = computed(() => {
  const value = props.modelValue;
  if (!value || typeof value !== "object") return null;
  return {
    start: parseLocalDateString(value.start),
    end: parseLocalDateString(value.end),
  };
});

const handleDateRange = (range) => {
  if (!range || (!range.start && !range.end)) {
    emit("update:modelValue", null);
    return;
  }
  if (range.start && range.end) {
    emit("update:modelValue", {
      start: toLocalDateString(range.start),
      end: toLocalDateString(range.end),
    });
  }
};

/* ----- Scales (BM has no settings, so use defaults) ----- */
const ratingMax = 5;
const scaleRange = [1, 2, 3, 4, 5];
const sliderMin = 0;
const sliderMax = 100;
const sliderStep = 1;

const isValidHex = (value) => /^#[0-9a-fA-F]{6}$/.test(value || "");
</script>

<template>
  <div v-if="isSupported" class="space-y-2">
    <Label v-if="!isInlineLabelType" :for="fieldId">
      {{ field.label }}
      <span v-if="field.required" class="text-destructive">*</span>
    </Label>

    <div
      class="rounded-md"
      :class="{ 'ring-destructive/50 ring-offset-background ring-2 ring-offset-2': error }"
    >
      <!-- Text -->
      <Input
        v-if="field.type === 'text'"
        :id="fieldId"
        :model-value="modelValue ?? ''"
        type="text"
        @update:model-value="emit('update:modelValue', $event)"
      />

      <!-- Email -->
      <Input
        v-else-if="field.type === 'email'"
        :id="fieldId"
        :model-value="modelValue ?? ''"
        type="email"
        placeholder="email@example.com"
        @update:model-value="emit('update:modelValue', $event)"
      />

      <!-- Number -->
      <InputNumber
        v-else-if="field.type === 'number'"
        :id="fieldId"
        :model-value="modelValue"
        decimal
        @update:model-value="emit('update:modelValue', $event)"
      />

      <!-- Phone -->
      <InputPhone
        v-else-if="field.type === 'phone'"
        :id="fieldId"
        :model-value="modelValue || ''"
        @update:model-value="emit('update:modelValue', $event)"
      />

      <!-- URL -->
      <InputLink
        v-else-if="field.type === 'url'"
        :model-value="modelValue || ''"
        @update:model-value="emit('update:modelValue', $event)"
      />

      <!-- Textarea / Rich Text (rich text is collected as plain multiline text
           at checkout; the admin TipTap editor isn't loaded on the event site) -->
      <Textarea
        v-else-if="field.type === 'textarea' || field.type === 'rich_text'"
        :id="fieldId"
        :model-value="modelValue ?? ''"
        rows="3"
        @update:model-value="emit('update:modelValue', $event)"
      />

      <!-- Date -->
      <DatePicker
        v-else-if="field.type === 'date'"
        :model-value="parseLocalDateString(modelValue)"
        @update:model-value="emit('update:modelValue', $event ? toLocalDateString($event) : null)"
      />

      <!-- Time -->
      <TimePicker
        v-else-if="field.type === 'time'"
        :model-value="parseTimeString(modelValue)"
        clearable
        @update:model-value="emit('update:modelValue', $event ? formatTimeValue($event) : null)"
      />

      <!-- Date & Time -->
      <DatePicker
        v-else-if="field.type === 'datetime'"
        with-time
        :model-value="parseLocalDateTimeString(modelValue)"
        @update:model-value="emit('update:modelValue', $event ? toLocalDateTimeString($event) : null)"
      />

      <!-- Date Range -->
      <RangeCalendarPicker
        v-else-if="field.type === 'date_range'"
        :model-value="dateRangeValue"
        @update:model-value="handleDateRange"
      />

      <!-- Select -->
      <Select
        v-else-if="field.type === 'select'"
        :model-value="modelValue ?? ''"
        @update:model-value="emit('update:modelValue', $event)"
      >
        <SelectTrigger :id="fieldId" class="w-full">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="opt in selectOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- Multi Select -->
      <MultiSelect
        v-else-if="field.type === 'multi_select'"
        :model-value="multiSelectValue"
        :options="selectOptions"
        placeholder="Select options"
        open-on-click
        @update:model-value="emit('update:modelValue', $event.map((o) => o.value))"
      />

      <!-- Country -->
      <LocationCombobox
        v-else-if="field.type === 'country'"
        :model-value="modelValue ?? ''"
        :options="countries"
        :pinned="['Indonesia']"
        placeholder="Select country"
        @update:model-value="emit('update:modelValue', $event)"
      />

      <!-- Radio -->
      <RadioGroup
        v-else-if="field.type === 'radio'"
        :model-value="modelValue ?? ''"
        class="space-y-1.5"
        @update:model-value="emit('update:modelValue', $event)"
      >
        <div
          v-for="opt in selectOptions"
          :key="opt.value"
          class="flex items-center gap-x-2"
        >
          <RadioGroupItem :id="`${fieldId}-${opt.value}`" :value="opt.value" />
          <Label :for="`${fieldId}-${opt.value}`" class="font-normal">
            {{ opt.label }}
          </Label>
        </div>
      </RadioGroup>

      <!-- Checkbox Group -->
      <div v-else-if="field.type === 'checkbox_group'" class="space-y-2">
        <div
          v-for="opt in selectOptions"
          :key="opt.value"
          class="flex items-center gap-x-2"
        >
          <Checkbox
            :id="`${fieldId}-${opt.value}`"
            :model-value="(modelValue || []).includes(opt.value)"
            @update:model-value="handleMultiCheck($event, opt.value)"
          />
          <Label :for="`${fieldId}-${opt.value}`" class="font-normal">
            {{ opt.label }}
          </Label>
        </div>
      </div>

      <!-- Tags -->
      <TagsInput
        v-else-if="field.type === 'tags'"
        :model-value="modelValue || []"
        class="text-sm"
        @update:model-value="emit('update:modelValue', $event)"
      >
        <TagsInputItem v-for="tag in modelValue || []" :key="tag" :value="tag">
          <TagsInputItemText />
          <TagsInputItemDelete />
        </TagsInputItem>
        <TagsInputInput placeholder="Type and press Enter" />
      </TagsInput>

      <!-- Checkbox (single) -->
      <label
        v-else-if="field.type === 'checkbox'"
        class="flex items-start gap-x-2 text-sm tracking-tight"
      >
        <Checkbox
          :id="fieldId"
          :model-value="!!modelValue"
          @update:model-value="emit('update:modelValue', !!$event)"
        />
        <span>
          {{ field.label }}
          <span v-if="field.required" class="text-destructive">*</span>
        </span>
      </label>

      <!-- Switch -->
      <label
        v-else-if="field.type === 'switch'"
        class="flex items-center gap-x-2 text-sm tracking-tight"
      >
        <Switch
          :id="fieldId"
          :model-value="!!modelValue"
          @update:model-value="emit('update:modelValue', !!$event)"
        />
        <span>
          {{ field.label }}
          <span v-if="field.required" class="text-destructive">*</span>
        </span>
      </label>

      <!-- Rating -->
      <div v-else-if="field.type === 'rating'" class="flex gap-x-1">
        <button
          v-for="star in ratingMax"
          :key="star"
          type="button"
          class="transition-transform active:scale-90"
          :class="star <= (modelValue || 0) ? 'text-warning' : 'text-muted-foreground/40'"
          :aria-label="`${star} of ${ratingMax}`"
          @click="emit('update:modelValue', star)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="size-7 transition-colors"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :fill="star <= (modelValue || 0) ? 'currentColor' : 'none'"
          >
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            />
          </svg>
        </button>
      </div>

      <!-- Slider -->
      <div v-else-if="field.type === 'slider'" class="space-y-2 pt-1">
        <Slider
          :model-value="[Number(modelValue ?? sliderMin)]"
          :min="sliderMin"
          :max="sliderMax"
          :step="sliderStep"
          @update:model-value="emit('update:modelValue', $event?.[0] ?? null)"
        />
        <div
          class="text-muted-foreground flex justify-between text-xs tracking-tight sm:text-sm"
        >
          <span>{{ sliderMin }}</span>
          <span class="text-foreground font-medium">{{ modelValue ?? sliderMin }}</span>
          <span>{{ sliderMax }}</span>
        </div>
      </div>

      <!-- Linear Scale -->
      <div v-else-if="field.type === 'linear_scale'" class="space-y-2">
        <div role="radiogroup" class="grid grid-cols-5 gap-1.5 sm:gap-2">
          <button
            v-for="n in scaleRange"
            :key="n"
            type="button"
            role="radio"
            :aria-checked="Number(modelValue) === n"
            :aria-label="String(n)"
            class="flex h-10 w-full items-center justify-center rounded-lg border text-sm font-medium tracking-tight transition-colors active:scale-95"
            :class="
              Number(modelValue) === n
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input hover:bg-muted'
            "
            @click="emit('update:modelValue', n)"
          >
            {{ n }}
          </button>
        </div>
      </div>

      <!-- Color -->
      <div v-else-if="field.type === 'color'" class="flex items-center gap-x-2">
        <label
          class="border-input relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-md border shadow-xs"
          :style="{ backgroundColor: isValidHex(modelValue) ? modelValue : '#ffffff' }"
        >
          <input
            :id="fieldId"
            type="color"
            :value="isValidHex(modelValue) ? modelValue : '#000000'"
            class="absolute inset-0 size-full cursor-pointer opacity-0"
            @input="emit('update:modelValue', $event.target.value)"
          />
        </label>
        <Input
          :model-value="modelValue ?? ''"
          placeholder="#000000"
          maxlength="7"
          class="w-32 font-mono"
          @update:model-value="emit('update:modelValue', $event)"
        />
      </div>

      <!-- Fallback: any other text-ish type -->
      <Input
        v-else
        :id="fieldId"
        :model-value="modelValue ?? ''"
        type="text"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </div>

    <p v-if="error" class="text-destructive text-sm tracking-tight">{{ error }}</p>
  </div>
</template>
