<script lang="ts" setup>
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { reactiveOmit } from "@vueuse/core";
import type { RangeCalendarCellTriggerProps } from "reka-ui";
import { RangeCalendarCellTrigger, useForwardProps } from "reka-ui";
import { computed, inject, type ComputedRef, type HTMLAttributes } from "vue";
import { formatIsoDate, formatRupiahShort, type PricingMap } from "./utils";

const props = withDefaults(
  defineProps<RangeCalendarCellTriggerProps & { class?: HTMLAttributes["class"] }>(),
  { as: "button" }
);

const delegatedProps = reactiveOmit(props, "class");
const forwardedProps = useForwardProps(delegatedProps);

const pricing = inject<ComputedRef<PricingMap> | undefined>("pricing-calendar-data", undefined);
const loading = inject<ComputedRef<boolean> | undefined>("pricing-calendar-loading", undefined);
const goodPriceThreshold = inject<ComputedRef<number | undefined> | undefined>(
  "pricing-calendar-good-threshold",
  undefined
);

const dayKey = computed(() => formatIsoDate(props.day));
const cell = computed(() => pricing?.value?.[dayKey.value]);
const showPrice = computed(() => cell.value && cell.value.rate != null && cell.value.rate > 0);
const priceLabel = computed(() => (showPrice.value ? formatRupiahShort(cell.value!.rate!) : ""));
const isGoodPrice = computed(() => {
  const threshold = goodPriceThreshold?.value;
  const rate = cell.value?.rate;
  return rate != null && threshold != null && rate < threshold;
});
const showSkeleton = computed(() => !!loading?.value && !cell.value);
</script>

<template>
  <RangeCalendarCellTrigger
    data-slot="pricing-calendar-trigger"
    :class="
      cn(
        buttonVariants({ variant: 'ghost' }),
        'group relative flex size-12 cursor-pointer flex-col items-center justify-center gap-1 p-0 font-normal aria-selected:opacity-100',
        '[&[data-today]:not([data-selected])]:bg-muted [&[data-today]:not([data-selected])]:text-foreground',
        'data-[selected]:text-primary-foreground data-[selected]:hover:text-primary-foreground data-[selected]:focus:text-primary-foreground data-[selected]:opacity-100',
        'data-[selection-start]:bg-primary data-[selection-start]:text-primary-foreground data-[selection-start]:hover:bg-primary data-[selection-start]:hover:text-primary-foreground data-[selection-start]:focus:bg-primary data-[selection-start]:focus:text-primary-foreground',
        'data-[selection-end]:bg-primary data-[selection-end]:text-primary-foreground data-[selection-end]:hover:bg-primary data-[selection-end]:hover:text-primary-foreground data-[selection-end]:focus:bg-primary data-[selection-end]:focus:text-primary-foreground',
        'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50',
        'data-[unavailable]:text-destructive-foreground data-[unavailable]:line-through',
        'data-[outside-view]:text-muted-foreground data-[outside-view]:opacity-50',
        'data-[today]:after:bg-primary data-[today]:data-[selected]:after:bg-primary-foreground data-[today]:after:absolute data-[today]:after:bottom-[3px] data-[today]:after:left-1/2 data-[today]:after:size-[3px] data-[today]:after:-translate-x-1/2 data-[today]:after:rounded-full',
        props.class
      )
    "
    v-bind="forwardedProps"
  >
    <span class="text-sm leading-none">
      <slot>{{ day.day }}</slot>
    </span>
    <Skeleton v-if="showSkeleton" class="h-2 w-8 rounded-sm" />
    <span
      v-else-if="priceLabel"
      class="text-[11px] leading-none font-medium"
      :class="{
        'text-success-foreground group-data-[selection-start]:text-primary-foreground/80 group-data-[selection-end]:text-primary-foreground/80 group-data-[selected]:text-primary-foreground/80':
          isGoodPrice,
        'text-muted-foreground group-data-[selection-start]:text-primary-foreground/70 group-data-[selection-end]:text-primary-foreground/70 group-data-[selected]:text-primary-foreground/70':
          !isGoodPrice,
      }"
    >
      {{ priceLabel }}
    </span>
  </RangeCalendarCellTrigger>
</template>
