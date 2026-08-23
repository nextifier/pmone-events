<script setup lang="ts">
import { togglePillClass, toggleVariants } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { reactiveOmit } from "@vueuse/core";
import type { VariantProps } from "class-variance-authority";
import type { ToggleGroupItemProps } from "reka-ui";
import { ToggleGroupItem, useForwardProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { computed, inject } from "vue";

type ToggleGroupVariants = VariantProps<typeof toggleVariants>;
type GroupVariant = NonNullable<ToggleGroupVariants["variant"]> | "pill";

const props = defineProps<
  ToggleGroupItemProps & {
    class?: HTMLAttributes["class"];
    variant?: GroupVariant;
    size?: ToggleGroupVariants["size"];
    // Radio-style dot, same as <Toggle indicator>. For a single-select group
    // whose options are mutually exclusive, so the chosen one reads at a glance.
    indicator?: boolean;
  }
>();

const context = inject<{
  variant?: GroupVariant;
  size?: ToggleGroupVariants["size"];
  spacing?: number;
}>("toggleGroup");

const resolvedVariant = computed<GroupVariant>(
  () => context?.variant || props.variant || "default"
);

// CVA only knows the segmented variants; "pill" is rendered via pillClass, so
// fall back to "default" here (kept out of the template to avoid a TS cast).
const cvaVariant = computed<ToggleGroupVariants["variant"]>(() =>
  resolvedVariant.value === "pill" ? "default" : resolvedVariant.value
);

const delegatedProps = reactiveOmit(props, "class", "size", "variant", "indicator");
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <ToggleGroupItem
    v-slot="slotProps"
    data-slot="toggle-group-item"
    :data-variant="resolvedVariant"
    :data-size="context?.size || size"
    v-bind="forwardedProps"
    :class="
      resolvedVariant === 'pill'
        ? cn(togglePillClass, indicator && 'group/toggle', props.class)
        : cn(
            toggleVariants({
              variant: cvaVariant,
              size: context?.size || size,
            }),
            'cn-toggle-group-item shrink-0 focus:z-10 focus-visible:z-10',
            // spacing>0 → gapped, individually-rounded items (no flex-1 stretch,
            // no border-collapse). spacing 0/undefined → joined segmented control.
            context?.spacing
              ? 'rounded-md'
              : 'min-w-0 flex-1 rounded-none shadow-none first:rounded-l-md last:rounded-r-md data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l',
            props.class
          )
    "
  >
    <!-- Matches <Toggle indicator> exactly: an empty bordered ring that fills
         with the primary colour and a contrast dot while the item is on. -->
    <span
      v-if="indicator"
      aria-hidden="true"
      class="border-border text-primary-foreground flex size-4 shrink-0 items-center justify-center rounded-full border shadow-xs transition-colors group-data-[state=on]/toggle:border-primary group-data-[state=on]/toggle:bg-primary"
    >
      <svg
        width="6"
        height="6"
        viewBox="0 0 6 6"
        fill="currentColor"
        class="opacity-0 transition-opacity group-data-[state=on]/toggle:opacity-100"
      >
        <circle cx="3" cy="3" r="3" />
      </svg>
    </span>
    <slot v-bind="slotProps" />
  </ToggleGroupItem>
</template>
