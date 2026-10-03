<script setup lang="ts">
/**
 * Where the open content is shown. Put it inside the menu, after the list.
 *
 * placement "inline": part of the host card, in normal flow, growing the card.
 * placement "floating": a panel under the list. `align` decides where:
 *   trigger-start lines the panel's left edge up with the active trigger, and
 *   flips to line its right edge up with the trigger when it would otherwise be
 *   cut off by the menu's right edge. trigger-center and trigger-end follow the
 *   trigger too. start / center sit against the menu's own edge or middle, and
 *   stretch fills the menu's width.
 */
import { cn } from "@/lib/utils";
import { NavigationMenuViewport } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { MEGA_MENU_BREAKPOINT_CLASSES, megaMenuKey } from "./context";

type Align = "trigger-start" | "trigger-center" | "trigger-end" | "start" | "center" | "stretch";

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    placement?: "inline" | "floating";
    align?: Align;
  }>(),
  { placement: "floating", align: "trigger-start" },
);

const menu = inject(megaMenuKey)!;
const classes = computed(() => MEGA_MENU_BREAKPOINT_CLASSES[menu.breakpoint.value]);

const followsTrigger = computed(() => props.align.startsWith("trigger-"));
const rekaAlign = computed(() =>
  props.align === "trigger-center" ? "center" : props.align === "trigger-end" ? "end" : "start",
);
const alignAttr = computed(() => (followsTrigger.value ? "trigger" : props.align));

const wrapperRef = ref<HTMLElement | null>(null);
const viewportRef = ref<{ $el: HTMLElement } | null>(null);
const bridge = ref<Record<string, string> | null>(null);

/**
 * A strip from the bottom of the active trigger to the top of the panel. The
 * pointer is outside both while it crosses the bar's padding and the gap, and
 * reka-ui starts closing the moment it leaves the trigger. Entering the strip
 * tells the viewport the pointer is back, so lingering there keeps the panel.
 */
function updateBridge() {
  const wrapper = wrapperRef.value;
  const trigger = wrapper
    ?.closest("[data-slot=mega-menu]")
    ?.querySelector<HTMLElement>("[data-slot=mega-menu-trigger][data-state=open]");
  if (!wrapper || !trigger || !menu.openValue.value) {
    bridge.value = null;
    return;
  }
  const w = wrapper.getBoundingClientRect();
  const t = trigger.getBoundingClientRect();
  const gap = Number.parseFloat(getComputedStyle(wrapper).paddingTop) || 0;
  const height = w.top + gap - t.bottom;
  bridge.value =
    height > 0
      ? {
          left: `${t.left - w.left}px`,
          width: `${t.width}px`,
          top: `${t.bottom - w.top}px`,
          height: `${height}px`,
        }
      : null;
}

/**
 * Positions a floating panel against the active trigger. reka-ui only keeps the
 * panel inside the window, so the edge-aware left/right choice is made here,
 * against the menu itself.
 */
function place() {
  const wrapper = wrapperRef.value;
  const viewport = viewportRef.value?.$el;
  if (!wrapper || !(viewport instanceof Element) || props.placement !== "floating" || !followsTrigger.value) return;
  const root = wrapper.closest("[data-slot=mega-menu]");
  const trigger = root?.querySelector<HTMLElement>("[data-slot=mega-menu-trigger][data-state=open]");
  const content = viewport.querySelector<HTMLElement>("[data-slot=mega-menu-content][data-state=open]");
  if (!root || !trigger || !content) return;
  const r = root.getBoundingClientRect();
  const t = trigger.getBoundingClientRect();
  const width = content.offsetWidth;
  const maxRight = Math.min(r.right, window.innerWidth) - r.left;
  const start = t.left - r.left;
  const end = t.right - r.left - width;
  let left: number;
  if (props.align === "trigger-end") left = end;
  else if (props.align === "trigger-center") left = start + t.width / 2 - width / 2;
  else left = start + width > maxRight ? end : start;
  const gutter = 16;
  left = Math.min(Math.max(left, gutter), Math.max(maxRight - width - gutter, gutter));
  viewport.style.setProperty("--mm-left", `${Math.round(left)}px`);
  viewport.style.setProperty("--mm-origin", `${Math.round(start + t.width / 2 - left)}px`);
}

let sizeObserver: ResizeObserver | null = null;

function forward(type: "pointerenter" | "pointerleave") {
  const el = viewportRef.value?.$el;
  if (el instanceof Element) el.dispatchEvent(new PointerEvent(type, { pointerType: "mouse" }));
}

/**
 * The viewport's root is a comment node while the menu is closed and a new
 * element each time it opens, so the size observer is re-attached on every open.
 */
function observeViewport() {
  sizeObserver?.disconnect();
  sizeObserver = null;
  const el = viewportRef.value?.$el;
  if (el instanceof Element) {
    sizeObserver = new ResizeObserver(place);
    sizeObserver.observe(el);
  }
}

function update() {
  observeViewport();
  updateBridge();
  place();
}

watch(
  () => menu.openValue.value,
  () => nextTick(update),
);
onMounted(() => window.addEventListener("resize", update));
onBeforeUnmount(() => {
  window.removeEventListener("resize", update);
  sizeObserver?.disconnect();
});

const wrapperClass = computed(() =>
  props.placement === "inline"
    ? "relative w-full"
    : cn(
        "pointer-events-none absolute inset-x-0 top-full z-50 flex pt-(--mm-gap) *:pointer-events-auto",
        props.align === "center" && "justify-center",
        props.align === "stretch" && "justify-stretch",
      ),
);
</script>

<template>
  <div
    v-if="menu.mode.value === 'desktop'"
    ref="wrapperRef"
    data-slot="mega-menu-viewport-wrapper"
    :class="cn(wrapperClass, classes.desktopOnly)"
  >
    <div
      v-if="bridge"
      data-slot="mega-menu-bridge"
      class="pointer-events-auto absolute"
      :style="bridge"
      aria-hidden="true"
      @pointerenter="forward('pointerenter')"
      @pointerleave="forward('pointerleave')"
    />
    <NavigationMenuViewport
      ref="viewportRef"
      data-slot="mega-menu-viewport"
      :data-placement="placement"
      :data-align="alignAttr"
      :align="rekaAlign"
      :class="cn(placement === 'floating' && 'cn-menu-surface text-popover-foreground ring-foreground/10 rounded-lg shadow-(--mm-shadow) ring-1', props.class)"
    />
  </div>
</template>
