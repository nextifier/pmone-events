<script setup lang="ts">
/**
 * The two-bar menu icon of the site header: a hamburger that turns into a
 * cross while the menu is open. Same markup, classes and motion as the button
 * in pmone-events' HeaderMenu (icon swap tokens, `transition-all` because
 * translate, rotate and scale all change).
 *
 * 1.5px bars, 24-unit glyph drawn at 20px: the weight of the icons beside it.
 * The cross is scaled to 6/7 so the rotated bars, which lose the pixel grid,
 * do not come out heavier than the bars they morph from.
 */
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
  defineProps<{
    open?: boolean;
    /** Replaces the bar colour, `bg-primary` by default. */
    barClass?: HTMLAttributes["class"];
  }>(),
  { open: false, barClass: undefined },
);
</script>

<template>
  <span class="relative flex size-8 items-center justify-center" aria-hidden="true">
    <span
      v-for="(_, index) in 2"
      :key="index"
      :class="
        cn(
          'bg-primary absolute h-[1.5px] w-5 transition-[translate,rotate,scale] duration-(--icon-swap-dur) ease-(--icon-swap-ease) motion-reduce:transition-none',
          props.barClass,
          {
            '-translate-y-1 scale-y-100': index === 0 && !open,
            'translate-y-1 scale-y-100': index === 1 && !open,
            'translate-y-0! scale-y-[.857] rotate-45': index === 0 && open,
            'translate-y-0! scale-y-[.857] -rotate-45': index === 1 && open,
          },
        )
      "
    />
  </span>
</template>
