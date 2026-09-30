<script setup lang="ts">
import { cn } from "@/lib/utils";
import { inject, onBeforeUnmount, onMounted, ref, type HTMLAttributes } from "vue";
import { TABS_CONTEXT } from "./context";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();

const ctx = inject(TABS_CONTEXT, null);
const carouselRef = ref<HTMLElement | null>(null);

let rootEl: HTMLElement | null = null;
let observer: MutationObserver | null = null;
let scrollTimeout: ReturnType<typeof setTimeout> | undefined;
let settleTimeout: ReturnType<typeof setTimeout> | undefined;
let scrollFrame = 0;

// A tap on a tab glides for this long. Native `behavior: "smooth"` picks its
// own duration (350-470ms on desktop, longer on Android with snap on), and the
// pill follows the scroll, so a tap feels late.
const TAB_SCROLL_MS = 220;

// Guards to avoid a scroll <-> activate feedback loop.
let isProgrammaticScroll = false;
let isProgrammaticActivate = false;

function getTriggers(): HTMLElement[] {
  if (!rootEl) return [];
  return Array.from(
    rootEl.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])'),
  ).filter((t) => t.closest("[data-slot='tabs']") === rootEl);
}

function getActiveIndex(triggers: HTMLElement[]): number {
  return triggers.findIndex((t) => t.dataset.state === "active");
}

// scroll -> activate the matching tab via reka-ui's own API.
function onScrollEnd(): void {
  const el = carouselRef.value;
  if (!el) return;

  // Toggling scroll-snap-type can fire a stray scrollend mid-glide.
  if (scrollFrame) return;

  if (isProgrammaticScroll) {
    isProgrammaticScroll = false;
    return;
  }

  const width = el.clientWidth;
  if (width === 0) return;

  const idx = Math.round(el.scrollLeft / width);
  const triggers = getTriggers();
  const next = triggers[idx];
  if (!next) return;
  if (idx === getActiveIndex(triggers)) return;

  isProgrammaticActivate = true;
  // reka-ui TabsTrigger switches on @mousedown.left; click after so consumer
  // @click handlers still fire. Mirrors the existing swipe path in Tabs.vue.
  next.dispatchEvent(
    new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 0 }),
  );
  next.click();
}

function cancelScrollAnimation(): void {
  if (!scrollFrame) return;
  cancelAnimationFrame(scrollFrame);
  scrollFrame = 0;
  carouselRef.value?.style.removeProperty("scroll-snap-type");
}

// Snap is off while we drive scrollLeft, otherwise it fights every frame.
function animateScrollTo(el: HTMLElement, left: number): void {
  cancelScrollAnimation();

  const from = el.scrollLeft;
  const distance = left - from;
  // A hidden document runs no animation frames, so the glide would never end.
  if (
    document.hidden ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    el.scrollLeft = left;
    return;
  }

  const start = performance.now();
  el.style.scrollSnapType = "none";

  const step = (now: number): void => {
    const progress = Math.min(1, (now - start) / TAB_SCROLL_MS);
    el.scrollLeft = from + distance * (1 - Math.pow(1 - progress, 3));
    if (progress < 1) {
      scrollFrame = requestAnimationFrame(step);
      return;
    }
    scrollFrame = 0;
    el.style.removeProperty("scroll-snap-type");
  };
  scrollFrame = requestAnimationFrame(step);
}

// active -> scroll the matching panel into view.
function onActiveChange(): void {
  if (isProgrammaticActivate) {
    // Activation originated from a scroll gesture: already in position.
    isProgrammaticActivate = false;
    return;
  }

  const el = carouselRef.value;
  if (!el) return;

  const triggers = getTriggers();
  const activeIdx = getActiveIndex(triggers);
  if (activeIdx === -1) return;

  const panel = el.children[activeIdx] as HTMLElement | undefined;
  if (!panel) return;

  if (Math.abs(el.scrollLeft - panel.offsetLeft) <= 1) return;

  isProgrammaticScroll = true;
  animateScrollTo(el, panel.offsetLeft);

  // Safety net: clear the guard if scrollend never fires (e.g. no movement).
  clearTimeout(settleTimeout);
  settleTimeout = setTimeout(() => {
    isProgrammaticScroll = false;
  }, 700);
}

function onScroll(): void {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(onScrollEnd, 300);
}

onMounted(() => {
  const el = carouselRef.value;
  if (!el || !ctx?.swipeable.value) return;
  el.addEventListener("touchstart", cancelScrollAnimation, { passive: true });
  el.addEventListener("wheel", cancelScrollAnimation, { passive: true });
  rootEl = el.closest<HTMLElement>("[data-slot='tabs']");

  if ("onscrollend" in window) {
    el.addEventListener("scrollend", onScrollEnd);
  } else {
    // Polyfill for browsers without scrollend (e.g. Safari).
    el.addEventListener("scroll", onScroll, { passive: true });
  }

  if (rootEl) {
    observer = new MutationObserver(onActiveChange);
    observer.observe(rootEl, {
      attributes: true,
      attributeFilter: ["data-state"],
      subtree: true,
    });
  }
});

onBeforeUnmount(() => {
  const el = carouselRef.value;
  cancelScrollAnimation();
  el?.removeEventListener("touchstart", cancelScrollAnimation);
  el?.removeEventListener("wheel", cancelScrollAnimation);
  el?.removeEventListener("scrollend", onScrollEnd);
  el?.removeEventListener("scroll", onScroll);
  observer?.disconnect();
  clearTimeout(scrollTimeout);
  clearTimeout(settleTimeout);
});
</script>

<template>
  <div
    ref="carouselRef"
    data-slot="tabs-carousel"
    :class="
      cn(
        'relative flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
