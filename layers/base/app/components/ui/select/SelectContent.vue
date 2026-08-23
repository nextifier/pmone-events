<script setup lang="ts">
import { cn } from "@/lib/utils";
import { reactiveOmit } from "@vueuse/core";
import type { SelectContentEmits, SelectContentProps } from "reka-ui";
import { SelectContent, SelectPortal, SelectViewport, useForwardPropsEmits } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { SelectScrollDownButton, SelectScrollUpButton } from ".";

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<SelectContentProps & { class?: HTMLAttributes["class"] }>(),
  {
    position: "popper",
    bodyLock: false,
  }
);
const emits = defineEmits<SelectContentEmits>();

const delegatedProps = reactiveOmit(props, "class");

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <SelectPortal>
    <SelectContent
      data-slot="select-content"
      :data-align-trigger="position === 'item-aligned'"
      v-bind="{ ...forwarded, ...$attrs }"
      :class="
        cn(
          'cn-select-content cn-select-content-logical cn-menu-target cn-menu-translucent relative z-50 max-h-(--reka-select-content-available-height) origin-(--reka-select-content-transform-origin) overflow-x-hidden overflow-y-auto data-[align-trigger=true]:animate-none',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          props.class
        )
      "
    >
      <!-- The scroll affordances sit above the list and have to keep occluding
           the options passing under them, but `cn-select-scroll-*-button` paints
           them `bg-popover` at full opacity while the content around them is
           `cn-menu-translucent` at 70%. On a long list that reads as two solid
           slabs bolted onto a sheet of glass. Same treatment as the popover
           itself instead: blur what is behind them, then the same 70% tint. -->
      <SelectScrollUpButton class="bg-popover/70 backdrop-blur-2xl backdrop-saturate-150" />
      <SelectViewport
        :data-position="position"
        :class="
          cn(
            'cn-select-viewport data-[position=popper]:h-(--reka-select-trigger-height) data-[position=popper]:w-full data-[position=popper]:min-w-(--reka-select-trigger-width)'
          )
        "
      >
        <slot />
      </SelectViewport>
      <SelectScrollDownButton class="bg-popover/70 backdrop-blur-2xl backdrop-saturate-150" />
    </SelectContent>
  </SelectPortal>
</template>
