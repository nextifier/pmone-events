<script setup lang="ts">
import { cn } from "@/lib/utils";
import { reactiveOmit } from "@vueuse/core";
import type { ToggleEmits, ToggleProps } from "reka-ui";
import { Toggle as TogglePrimitive, useForwardPropsEmits } from "reka-ui";
import { computed, type HTMLAttributes } from "vue";

const props = withDefaults(
  defineProps<
    ToggleProps & { class?: HTMLAttributes["class"]; variant?: "pill" | "card" }
  >(),
  { variant: "pill" },
);

const emits = defineEmits<ToggleEmits>();

const delegatedProps = reactiveOmit(props, "class", "variant");

const forwarded = useForwardPropsEmits(delegatedProps, emits);

// All the shared styling lives here so the two variants read as one control
// family: same border, surface, radius, hover, focus ring and selected accent.
const base =
  "border border-border bg-background rounded-xl transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=on]:border-primary data-[state=on]:bg-primary/5 data-[state=on]:ring-1 data-[state=on]:ring-primary";

const variants = {
  // Compact single-line chip (e.g. the day picker).
  pill: "inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium tracking-tight",
  // Layout-flexible card; the consumer supplies the inner layout (e.g. sessions).
  card: "",
};

const classes = computed(() => cn(base, variants[props.variant], props.class));
</script>

<template>
  <TogglePrimitive data-slot="toggle" v-bind="forwarded" :class="classes">
    <slot />
  </TogglePrimitive>
</template>
