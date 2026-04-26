<template>
  <TabsRoot
    :model-value="modelValue"
    @update:model-value="(v) => emit('update:modelValue', v)"
    class="inline-flex"
  >
    <TabsList
      class="bg-muted text-muted-foreground/80 relative isolate inline-flex items-center rounded-xl p-0.5"
      aria-label="View mode"
    >
      <TabsIndicator
        class="absolute inset-y-0.5 left-0 z-0 w-(--reka-tabs-indicator-size) translate-x-(--reka-tabs-indicator-position) rounded-lg transition-all duration-300 ease-in-out"
      >
        <div class="bg-background ring-border/40 h-full w-full rounded-lg shadow-sm shadow-black/10 ring-1" />
      </TabsIndicator>

      <TabsTrigger
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :aria-label="option.label"
        v-tippy="option.label"
        class="ring-offset-background hover:text-foreground focus-visible:ring-ring data-[state=active]:text-foreground relative z-10 inline-flex size-8 items-center justify-center rounded-lg p-0 outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        <Icon :name="option.icon" class="size-4 shrink-0" />
      </TabsTrigger>
    </TabsList>
  </TabsRoot>
</template>

<script setup>
import { TabsIndicator, TabsList, TabsRoot, TabsTrigger } from "reka-ui";
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
