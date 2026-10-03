<script setup lang="ts">
/**
 * MegaMenu: a hover (or click) navigation menu whose panel is one shared
 * surface. Moving between triggers slides the outgoing content away and the
 * incoming content in from the side you moved toward, while the surface
 * resizes to fit. Built on reka-ui NavigationMenu, so keyboard handling,
 * hover intent and ARIA come from the primitive.
 *
 * Below `breakpoint` (measured on the menu's own width, not the window) the
 * same markup becomes a toggle plus an accordion list.
 */
import { cn } from "@/lib/utils";
import { HeaderMenu, type HeaderMenuSide, type HeaderMenuVariant } from "@/components/ui/header-menu";
import { NavigationMenuRoot } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { computed, onBeforeUnmount, onMounted, provide, ref, useId, watch } from "vue";
import {
  MEGA_MENU_BREAKPOINTS,
  megaMenuKey,
  type MegaMenuBreakpoint,
  type MegaMenuMode,
} from "./context";

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    modelValue?: string;
    defaultValue?: string;
    /** Container width at which the menu turns into the mobile layout. "none" never does. */
    breakpoint?: MegaMenuBreakpoint;
    /** "click" keeps the panel open until a click elsewhere or Escape. */
    openOn?: "hover" | "click";
    /** Reveal the content one element at a time. */
    stagger?: boolean;
    /**
     * "none" switches off the built-in layout and motion of the panel, for a
     * menu that brings its own: the panel is still mounted and unmounted by
     * reka-ui, and data-state / data-motion stay on every part to style against.
     */
    motion?: "default" | "none";
    delayDuration?: number;
    skipDelayDuration?: number;
    /** Edge the mobile sheet slides in from. */
    sheetSide?: HeaderMenuSide;
    /**
     * Look of the menu sheet: straight, floating, glass, full, or underlay, which at
     * desktop width leaves the panel in place and slides the page away from it.
     * Underlay shows the menu button at every width and the sheet holds whatever
     * you put in MegaMenuSheet.
     */
    sheetVariant?: HeaderMenuVariant;
    /** Height of the header the mobile sheet hangs under, so the header is never covered. */
    headerHeight?: string;
    /** Keep the mobile sheet inside this element instead of on the page. */
    sheetContainer?: string | HTMLElement | null;
    /** Width of the underlay panel, any CSS length. A percentage is of the page. */
    sheetWidth?: string;
    /** Share the sheet's state under a name, so a HeaderMenuPage elsewhere in the layout can follow it. */
    sheetName?: string;
  }>(),
  {
    modelValue: undefined,
    defaultValue: undefined,
    breakpoint: "md",
    openOn: "hover",
    stagger: true,
    motion: "default",
    delayDuration: 120,
    skipDelayDuration: 300,
    sheetSide: "right",
    sheetVariant: "straight",
    headerHeight: "3.5rem",
    sheetContainer: undefined,
    sheetName: undefined,
    sheetWidth: undefined,
  },
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const rootRef = ref<{ $el: HTMLElement } | null>(null);
const mode = ref<MegaMenuMode>("desktop");
const mobileOpen = ref(false);
const mobileValue = ref("");
const sheets = ref(0);
const hasSheet = computed(() => sheets.value > 0);
const toggleAlways = computed(() => props.sheetVariant === "underlay" || hasSheet.value);
const panelId = useId();
const breakpoint = computed(() => props.breakpoint);
const openOn = computed(() => props.openOn);
const openValue = ref(props.modelValue ?? props.defaultValue ?? "");
watch(
  () => props.modelValue,
  (value) => {
    if (value !== undefined) openValue.value = value;
  },
);

let observer: ResizeObserver | null = null;
let frame = 0;

function measure() {
  const el = rootRef.value?.$el;
  if (!el) return;
  mode.value = el.clientWidth < MEGA_MENU_BREAKPOINTS[props.breakpoint] ? "mobile" : "desktop";
}

/** Switching layout resizes the menu, so measure on the next frame instead of inside the observer callback. */
function scheduleMeasure() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(measure);
}

watch(mobileOpen, (open) => {
  if (!open) mobileValue.value = "";
});
watch(mode, (value) => {
  if (value === "desktop") {
    mobileOpen.value = false;
    mobileValue.value = "";
  }
});
watch(() => props.breakpoint, measure);

onMounted(() => {
  measure();
  const el = rootRef.value?.$el;
  if (!el) return;
  observer = new ResizeObserver(scheduleMeasure);
  observer.observe(el);
});
onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  observer?.disconnect();
});

function closeMobile() {
  mobileOpen.value = false;
  mobileValue.value = "";
}

provide(megaMenuKey, {
  mode,
  breakpoint,
  openOn,
  openValue,
  mobileOpen,
  mobileValue,
  panelId,
  closeMobile,
  hasSheet,
  toggleAlways,
  registerSheet: () => {
    sheets.value++;
    onBeforeUnmount(() => {
      sheets.value--;
    });
  },
  toggleMobileValue: (value) => {
    mobileValue.value = mobileValue.value === value ? "" : value;
  },
});

function onUpdate(value: string) {
  openValue.value = value;
  emit("update:modelValue", value);
}

</script>

<template>
  <NavigationMenuRoot
    ref="rootRef"
    data-slot="mega-menu"
    :data-mode="mode"
    :data-stagger="stagger"
    :data-motion-preset="motion"
    :model-value="modelValue"
    :default-value="defaultValue"
    :delay-duration="delayDuration"
    :skip-delay-duration="skipDelayDuration"
    :disable-hover-trigger="openOn === 'click'"
    :disable-pointer-leave-close="openOn === 'click'"
    :class="cn('mega-menu @container relative', props.class)"
    @update:model-value="onUpdate"
  >
    <HeaderMenu
      v-model:open="mobileOpen"
      :side="sheetSide"
      :variant="sheetVariant"
      :offset="headerHeight"
      :portal-to="sheetContainer ?? undefined"
      :name="sheetName"
      :underlay-width="sheetWidth"
    >
      <slot :mode="mode" />
    </HeaderMenu>
  </NavigationMenuRoot>
</template>

<style>
/*
 * Motion. Every value comes from the transitions.dev motion tokens (defined
 * here so the component carries them with it), mapped by usage:
 *   panel slide between triggers  -> "Page side-by-side": duration-fast, distance-base, blur-medium
 *   links and labels rising in    -> "Texts reveal": distance-medium, blur-medium, duration-stagger
 *   panel growing and shrinking   -> "Card resize" / "Accordion": duration-fast, ease-smooth-out
 *   floating panel                -> "Menu dropdown": duration-fast open, duration-quick close, scale-medium / scale-tiny
 *   notch                         -> "Tabs sliding": duration-fast
 *   mobile sections               -> "Accordion expand": 0fr to 1fr, blur-small, chevron scaleY(-1)
 * Override the --mm-* values to retune; they default to the tokens.
 */
.mega-menu {
  --duration-stagger: 40ms;
  --duration-micro: 80ms;
  --duration-quick: 150ms;
  --duration-fast: 250ms;
  --ease-smooth-out: cubic-bezier(0.22, 1, 0.36, 1);
  --distance-base: 8px;
  --distance-medium: 12px;
  --scale-medium: 0.97;
  --scale-tiny: 0.99;
  --blur-small: 2px;
  --blur-medium: 3px;

  --mm-ease: var(--ease-smooth-out);
  --mm-in: var(--duration-fast);
  --mm-out: var(--duration-fast);
  --mm-resize: var(--duration-fast);
  --mm-collapse: var(--duration-fast);
  --mm-fade-out: var(--duration-quick);
  --mm-reveal: var(--duration-fast);
  --mm-step: var(--duration-stagger);
  --mm-group-step: var(--duration-micro);
  --mm-shift: var(--distance-base);
  --mm-reveal-y: var(--distance-medium);
  --mm-blur: var(--blur-medium);
  --mm-gap: 8px;
  --mm-shadow-sm: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --mm-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}
.dark .mega-menu {
  --mm-shadow-sm: 0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3);
  --mm-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4);
}

/* Viewport: the shared surface. It takes its size from whichever content is
   open, and that size is what animates. */
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-viewport"] {
  position: relative;
  overflow: hidden;
  /* 0px, not auto: a transition cannot start from auto, and this is what makes the card grow on first open. */
  height: var(--reka-navigation-menu-viewport-height, 0px);
}
/* Inline: the surface is part of the host card and grows downward. */
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-viewport"][data-placement="inline"] {
  width: 100%;
  transition: height var(--mm-resize) var(--mm-ease);
}
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-viewport"][data-placement="inline"][data-state="closed"] {
  animation: mm-collapse var(--mm-collapse) var(--mm-ease) both;
}
/* Floating: appears at its final size, and only animates size and position
   when you move from one trigger to another. It grows from the trigger. */
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-viewport"][data-placement="floating"] {
  width: var(--reka-navigation-menu-viewport-width);
  transform-origin: var(--mm-origin, 50%) 0;
  /* No opacity here: it would make the viewport a backdrop root and the glass
     surface's backdrop blur would see nothing behind it. */
  will-change: transform;
}
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-viewport"][data-placement="floating"][data-align="trigger"] {
  transform: translateX(var(--mm-left, var(--reka-navigation-menu-viewport-left, 0px)));
}
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-viewport"][data-placement="floating"][data-align="stretch"] {
  width: 100%;
}
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-viewport"][data-placement="floating"]:has([data-motion]) {
  transition:
    width var(--mm-resize) var(--mm-ease),
    height var(--mm-resize) var(--mm-ease),
    transform var(--mm-resize) var(--mm-ease);
}
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-viewport"][data-placement="floating"][data-state="open"] {
  /* backwards, not both: a finished animation holding its last frame keeps
     the viewport a backdrop root and the glass blur would see nothing. */
  animation: mm-pop-in var(--duration-fast) var(--mm-ease) backwards;
}
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-viewport"][data-placement="floating"][data-state="closed"] {
  animation: mm-pop-out var(--duration-quick) var(--mm-ease) both;
}

/* Content: absolutely stacked so outgoing and incoming overlap while the
   viewport resizes underneath. */
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-content"] {
  position: absolute;
  top: 0;
  left: 0;
  --mm-delay: var(--duration-micro);
}
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-viewport"][data-placement="inline"] [data-slot="mega-menu-content"] {
  width: 100%;
}
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-content"][data-motion="from-end"] {
  --mm-delay: 0ms;
  animation: mm-enter-from-end var(--mm-in) var(--mm-ease) both;
  will-change: transform, opacity, filter;
}
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-content"][data-motion="from-start"] {
  --mm-delay: 0ms;
  animation: mm-enter-from-start var(--mm-in) var(--mm-ease) both;
  will-change: transform, opacity, filter;
}
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-content"][data-motion="to-start"] {
  animation: mm-exit-to-start var(--mm-out) var(--mm-ease) both;
  pointer-events: none;
}
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-content"][data-motion="to-end"] {
  animation: mm-exit-to-end var(--mm-out) var(--mm-ease) both;
  pointer-events: none;
}
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-content"]:not([data-motion])[data-state="open"] {
  animation: mm-fade-in var(--duration-fast) var(--mm-ease) both;
}
/* The exit is one quiet fade with no travel, so closing never replays the reveal backwards. */
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-content"]:not([data-motion])[data-state="closed"] {
  animation: mm-fade-out var(--mm-fade-out) var(--mm-ease) both;
}

/* Reveal: columns (groups) start a beat apart and the links inside each start a
   smaller beat apart, so the next group begins while the previous one is still
   arriving instead of waiting for it to finish. Item beats stop growing after
   the sixth so a long list does not drag. */
.mega-menu:not([data-motion-preset="none"])[data-stagger="true"] [data-slot="mega-menu-content"][data-state="open"] [data-reveal] {
  animation: mm-reveal var(--mm-reveal) var(--mm-ease) both;
  animation-delay: calc(
    var(--mm-delay) + var(--mm-g, 0) * var(--mm-group-step) + min(var(--mm-i, 0), 5) * var(--mm-step)
  );
  will-change: transform, opacity, filter;
}
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-content"][data-plain] [data-reveal],
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-content"][data-plain] [data-slot="mega-menu-column"][data-tinted]::before {
  animation: none !important;
  will-change: auto;
}
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-column"][data-tinted] {
  position: relative;
  isolation: isolate;
}
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-column"][data-tinted]::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--mm-tint, var(--muted));
}
.mega-menu:not([data-motion-preset="none"])[data-stagger="true"]
  [data-slot="mega-menu-content"][data-state="open"]
  [data-slot="mega-menu-column"][data-tinted]::before {
  animation: mm-fade-in var(--mm-reveal) var(--mm-ease) both;
  animation-delay: calc(
    var(--mm-delay) + var(--mm-g, 0) * var(--mm-group-step) + min(var(--mm-i, 0), 5) * var(--mm-step)
  );
}

/* Mobile: the whole list and each section open the way an accordion does, by
   growing a grid row from 0fr to 1fr. The inner block fades and un-blurs, and
   padding lives inside it so a closed track is truly flat. */
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-collapse"] {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--mm-collapse) var(--mm-ease);
}
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-collapse"][data-state="open"] {
  grid-template-rows: 1fr;
}
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-collapse"] > div {
  min-height: 0;
  overflow: hidden;
  opacity: 0;
  filter: blur(var(--blur-small));
  transition:
    opacity var(--mm-collapse) var(--mm-ease),
    filter var(--mm-collapse) var(--mm-ease);
}
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-collapse"][data-state="open"] > div {
  opacity: 1;
  filter: blur(0);
}
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-collapse"][data-state="closed"] > div {
  visibility: hidden;
  transition:
    opacity var(--mm-collapse) var(--mm-ease),
    filter var(--mm-collapse) var(--mm-ease),
    visibility 0s linear var(--mm-collapse);
}
/* Chevron: flip vertically instead of rotating. scaleY(-1) passes through a flat
   line at the midpoint and animates in every browser. */
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-chevron"] {
  transform: scaleY(1);
  transform-origin: center;
  transition: transform var(--duration-fast) var(--mm-ease);
}
.mega-menu:not([data-motion-preset="none"]) [data-slot="mega-menu-chevron"] path {
  vector-effect: non-scaling-stroke;
}
.mega-menu:not([data-motion-preset="none"]) [data-state="open"] > [data-slot="mega-menu-chevron"],
.mega-menu:not([data-motion-preset="none"]) [aria-expanded="true"] > [data-slot="mega-menu-chevron"] {
  transform: scaleY(-1);
}

@keyframes mm-enter-from-end {
  from {
    opacity: 0;
    transform: translateX(var(--mm-shift));
    filter: blur(var(--mm-blur));
  }
  to {
    opacity: 1;
    transform: none;
    filter: blur(0);
  }
}
@keyframes mm-enter-from-start {
  from {
    opacity: 0;
    transform: translateX(calc(var(--mm-shift) * -1));
    filter: blur(var(--mm-blur));
  }
  to {
    opacity: 1;
    transform: none;
    filter: blur(0);
  }
}
@keyframes mm-exit-to-start {
  from {
    opacity: 1;
    transform: none;
    filter: blur(0);
  }
  to {
    opacity: 0;
    transform: translateX(calc(var(--mm-shift) * -1));
    filter: blur(var(--mm-blur));
  }
}
@keyframes mm-exit-to-end {
  from {
    opacity: 1;
    transform: none;
    filter: blur(0);
  }
  to {
    opacity: 0;
    transform: translateX(var(--mm-shift));
    filter: blur(var(--mm-blur));
  }
}
@keyframes mm-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes mm-fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@keyframes mm-reveal {
  from {
    opacity: 0;
    transform: translateY(var(--mm-reveal-y));
    filter: blur(var(--mm-blur));
  }
  to {
    opacity: 1;
    transform: none;
    filter: blur(0);
  }
}
@keyframes mm-collapse {
  from {
    height: var(--reka-navigation-menu-viewport-height, 0px);
  }
  to {
    height: 0;
  }
}
@keyframes mm-pop-in {
  from {
    opacity: 0;
    scale: var(--scale-medium);
  }
  to {
    opacity: 1;
    scale: 1;
  }
}
@keyframes mm-pop-out {
  from {
    opacity: 1;
    scale: 1;
  }
  to {
    opacity: 0;
    scale: var(--scale-tiny);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mega-menu *,
  .mega-menu *::before {
    animation: none !important;
    transition: none !important;
  }
}
</style>
