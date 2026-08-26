<script setup lang="ts">
import { cn } from "@/lib/utils";
import { TabsTrigger, type TabsTriggerProps, useForwardProps } from "reka-ui";
import { computed, inject, type HTMLAttributes } from "vue";
import {
  TABS_CONTEXT,
  TABS_DEFAULTS,
  tabsTriggerClasses,
  tabsTriggerSizeClasses,
} from "./context";

const props = defineProps<
  TabsTriggerProps & { class?: HTMLAttributes["class"] }
>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;
  return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);

const ctx = inject(TABS_CONTEXT, null);
const variantClass = computed(
  () => tabsTriggerClasses[ctx?.variant.value ?? TABS_DEFAULTS.variant],
);
const sizeClass = computed(
  () => tabsTriggerSizeClasses[ctx?.size.value ?? TABS_DEFAULTS.size],
);
</script>

<!-- The focus ring is INSET on purpose: TabsList scrolls horizontally, so it
     clips its own overflow and an offset ring loses its top and bottom arcs
     against the list edge. Drawn inside the box it follows the trigger radius
     and stays whole in every variant. -->
<template>
  <TabsTrigger
    v-bind="forwardedProps"
    :class="
      cn(
        'focus-visible:ring-ring/60 inline-flex cursor-pointer items-center justify-center gap-1.5 font-medium whitespace-nowrap transition-colors outline-hidden select-none focus-visible:ring-2 focus-visible:ring-inset disabled:opacity-50',
        sizeClass,
        variantClass,
        props.class,
      )
    "
  >
    <slot />
  </TabsTrigger>
</template>
