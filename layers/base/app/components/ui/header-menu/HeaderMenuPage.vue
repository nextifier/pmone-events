<script setup lang="ts">
/**
 * The page, for the "underlay" variant. Wrap everything that should move away
 * when the menu opens: the header and the page content. At desktop width it
 * narrows from the right, rounds its corners and dims while the panel waits
 * underneath; below that width, or in any other variant, it does nothing.
 *
 * Put the content that should slide sideways in HeaderMenuPageContent, and
 * leave the header outside it so the logo stays where it is.
 */
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "vue";
import { useScrollLock } from "@vueuse/core";
import { computed, inject, onMounted, ref, watch } from "vue";
import { headerMenuKey } from "./context";
import { useHeaderMenuView, useUnderlayPhase } from "./store";

const props = defineProps<{
  class?: HTMLAttributes["class"];
  /** Follow the HeaderMenu that shares this name, when it is not an ancestor. */
  name?: string;
}>();

const view = useHeaderMenuView(inject(headerMenuKey, null), () => props.name);
const active = view.active;
const open = view.open;
const phase = useUnderlayPhase(open, active);
/**
 * A page taller than the screen is clipped to the part you are looking at, not to
 * the whole page: how far the screen's top and bottom sit inside the page is read
 * once, when the menu opens (the scroll is held from then on).
 */
const root = ref<HTMLElement | null>(null);
const edges = ref({ top: 0, bottom: 0 });
watch(open, (isOpen) => {
  if (!isOpen || !root.value) return;
  const rect = root.value.getBoundingClientRect();
  edges.value = { top: Math.max(0, -rect.top), bottom: Math.max(0, rect.bottom - window.innerHeight) };
});
const style = computed(() => ({
  "--hm-panel": view.width.value,
  "--hm-top": `${edges.value.top}px`,
  "--hm-bottom": `${edges.value.bottom}px`,
}));

/** The page stays put behind the panel, so the scroll is held while the menu is open. */
const lock = useScrollLock(typeof document === "undefined" ? null : document.documentElement);
onMounted(() => watch(open, (isOpen) => (lock.value = isOpen)));

/** The page is inert while the menu is open, so a press on it lands here. */
function onPress(event: MouseEvent) {
  if ((event.target as Element | null)?.closest("[data-slot=header-menu-trigger]")) return;
  if (open.value) view.close();
}
</script>

<template>
  <div
    ref="root"
    data-slot="header-menu-page"
    :data-underlay="phase.engaged.value ? '' : undefined"
    :data-state="phase.visual.value ? 'open' : 'closed'"
    :style="style"
    :class="cn('hm-page bg-background text-foreground relative z-10', props.class)"
    @click="onPress"
  >
    <slot />
    <div v-if="phase.engaged.value" class="hm-dim pointer-events-none absolute inset-0 z-50 bg-black" aria-hidden="true" />
  </div>
</template>

<style>
/*
 * Timings and the curve are measured from the reference recording: the page
 * edge, the content and the dim all move together on the Drawer's own curve
 * (cubic-bezier(.32, .72, 0, 1)), 720ms in both directions; the dim ends at 30%.
 */
.hm-page {
  --hm-dur: 720ms;
  --hm-ease: cubic-bezier(0.32, 0.72, 0, 1);
  --hm-inset: 0.625rem;
  --hm-radius: 1.5rem;
}
.hm-page[data-underlay] {
  clip-path: inset(var(--hm-top, 0px) 0 var(--hm-bottom, 0px) 0 round 0);
  transition: clip-path var(--hm-dur) var(--hm-ease);
}
.hm-page[data-underlay][data-state="open"] {
  clip-path: inset(calc(var(--hm-top, 0px) + var(--hm-inset)) var(--hm-panel) calc(var(--hm-bottom, 0px) + var(--hm-inset)) 0 round var(--hm-radius));
}
.hm-page .hm-dim {
  opacity: 0;
  transition: opacity var(--hm-dur) var(--hm-ease);
}
.hm-page[data-state="open"] .hm-dim {
  opacity: 0.3;
}
@media (prefers-reduced-motion: reduce) {
  .hm-page[data-underlay],
  .hm-page .hm-dim {
    transition: none;
  }
}
</style>
