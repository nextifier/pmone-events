<script setup lang="ts">
/**
 * The part of the page that slides sideways with the "underlay" variant, by the
 * width of the panel, while the page narrows around it. It is inert while the
 * menu is open, so a press on it closes the menu instead of following a link.
 */
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "vue";
import { computed, inject } from "vue";
import { headerMenuKey } from "./context";
import { useHeaderMenuView, useUnderlayPhase } from "./store";

const props = withDefaults(
  defineProps<{
  class?: HTMLAttributes["class"];
  /** Follow the HeaderMenu that shares this name, when it is not an ancestor. */
  name?: string;
  /**
   * How much of the panel's width the content slides by, 0 to 1. 1 moves it all the
   * way, as the page does in the reference, so centred content is cut in half. A
   * page with content on the left wants less: 0.2 nudges it and keeps it readable.
   */
  shift?: number;
}>(),
  { class: undefined, name: undefined, shift: 1 },
);

const view = useHeaderMenuView(inject(headerMenuKey, null), () => props.name);
const active = view.active;
const open = view.open;
const phase = useUnderlayPhase(open, active);
const style = computed(() => ({ "--hm-panel": view.width.value, "--hm-shift": props.shift }));

</script>

<template>
  <div
    data-slot="header-menu-page-content"
    :data-underlay="phase.engaged.value ? '' : undefined"
    :data-state="phase.visual.value ? 'open' : 'closed'"
    :inert="open || undefined"
    :style="style"
    :class="cn('hm-content', props.class)"
  >
    <slot />
  </div>
</template>

<style>
.hm-content[data-underlay] {
  transform: translateX(0);
  transition: transform var(--hm-dur, 720ms) var(--hm-ease, cubic-bezier(0.32, 0.72, 0, 1));
}
.hm-content[data-underlay][data-state="open"] {
  transform: translateX(calc(var(--hm-panel) * var(--hm-shift, 1) * -1));
}
@media (prefers-reduced-motion: reduce) {
  .hm-content[data-underlay] {
    transition: none;
  }
}
</style>
