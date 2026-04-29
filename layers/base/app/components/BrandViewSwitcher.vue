<template>
  <Tabs
    variant="segmented"
    :model-value="modelValue"
    @update:model-value="(v) => emit('update:modelValue', v)"
  >
    <TabsList aria-label="View mode">
      <TabsIndicator />

      <TabsTrigger
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :aria-label="option.label"
        v-tippy="option.label"
        class="size-8 p-0"
      >
        <Icon :name="option.icon" class="size-4 shrink-0" />
      </TabsTrigger>
    </TabsList>
  </Tabs>
</template>

<script setup>
import {
  VALID_VIEW_MODES,
  VIEW_OPTIONS,
} from "../composables/useBrandHelpers";

defineProps({
  modelValue: {
    type: String,
    default: "grid",
    validator: (v) => VALID_VIEW_MODES.includes(v),
  },
});

const emit = defineEmits(["update:modelValue"]);

const options = VIEW_OPTIONS;
</script>
