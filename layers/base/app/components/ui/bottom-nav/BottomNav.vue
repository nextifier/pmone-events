<script setup lang="ts">
import { cn } from "@/lib/utils";
import { useScroll } from "@vueuse/core";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
  type HTMLAttributes,
} from "vue";
import {
  BOTTOM_NAV_CONTEXT,
  BOTTOM_NAV_DEFAULTS,
  bottomNavBarClasses,
  bottomNavBarHeightClasses,
  bottomNavContainerClasses,
  bottomNavPillClasses,
  type BottomNavIndicator,
  type BottomNavLabel,
  type BottomNavLabelPlacement,
  type BottomNavPosition,
  type BottomNavSize,
  type BottomNavVariant,
} from "./context";

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    variant?: BottomNavVariant;
    indicator?: BottomNavIndicator;
    size?: BottomNavSize;
    labelDisplay?: BottomNavLabel;
    labelPlacement?: BottomNavLabelPlacement;
    position?: BottomNavPosition;
    hideOnScroll?: boolean;
    scrollTarget?: HTMLElement | string | null;
    ariaLabel?: string;
    class?: HTMLAttributes["class"];
  }>(),
  {
    variant: BOTTOM_NAV_DEFAULTS.variant,
    indicator: BOTTOM_NAV_DEFAULTS.indicator,
    size: BOTTOM_NAV_DEFAULTS.size,
    labelDisplay: BOTTOM_NAV_DEFAULTS.labelDisplay,
    labelPlacement: BOTTOM_NAV_DEFAULTS.labelPlacement,
    position: "fixed",
    hideOnScroll: false,
    scrollTarget: null,
    ariaLabel: "Bottom navigation",
  },
);

const emit = defineEmits<{ "update:modelValue": [value: string | number] }>();

provide(BOTTOM_NAV_CONTEXT, {
  variant: computed(() => props.variant),
  size: computed(() => props.size),
  indicator: computed(() => props.indicator),
  labelDisplay: computed(() => props.labelDisplay),
  labelPlacement: computed(() => props.labelPlacement),
  selectedValue: computed(() => props.modelValue),
  select: (value) => {
    if (value !== undefined) {
      emit("update:modelValue", value);
    }
  },
});

const route = useRoute();
const navRef = ref<HTMLElement | null>(null);
const indicatorRef = ref<HTMLElement | null>(null);

const showSlidingIndicator = computed(
  () => props.indicator === "pill" || props.indicator === "bar",
);

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function activeItem(): HTMLElement | undefined {
  const items = navRef.value?.querySelectorAll<HTMLElement>("[data-bottom-nav-item]") ?? [];
  return Array.from(items).find((el) => el.dataset.state === "active");
}

/**
 * Last geometry written to the indicator. Repeat calls with the same target
 * return early, which keeps the ResizeObserver (items resize when a beside
 * label opens) from snapping a slide that is still running.
 */
let indicatorTarget = "";

/** Offset of el inside ancestor. Offsets ignore transforms, so a running FLIP never skews it. */
function offsetWithin(el: HTMLElement, ancestor: HTMLElement): { left: number; top: number } {
  let left = 0;
  let top = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    left += node.offsetLeft;
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { left, top };
}

/**
 * Pill geometry. With labels under the icons the pill is a capsule around the
 * icon (64x32 at md), so it clears the label and the rounded corners of the
 * screen. On glass, with labels beside the icons, or with no labels, it fills
 * the item inset by --bottom-nav-pill-inset.
 */
function pillRect(nav: HTMLElement, item: HTMLElement): IndicatorRect {
  const inset = parseFloat(getComputedStyle(nav).getPropertyValue("--bottom-nav-pill-inset")) || 0;
  const box = {
    x: item.offsetLeft + inset,
    top: item.offsetTop + inset,
    width: item.offsetWidth - inset * 2,
    height: item.offsetHeight - inset * 2,
  };

  const icon = item.querySelector<HTMLElement>("[data-slot=bottom-nav-icon]");
  if (
    !icon ||
    props.variant === "glass" ||
    props.labelPlacement === "beside" ||
    props.labelDisplay === "none"
  ) {
    return box;
  }

  const padY = props.size === "sm" ? 2 : 4;
  const width = Math.min(icon.offsetWidth + 40, box.width);
  const height = Math.min(icon.offsetHeight + padY * 2, box.height);
  const at = offsetWithin(icon, nav);
  const top = at.top + (icon.offsetHeight - height) / 2;
  return {
    x: at.left + (icon.offsetWidth - width) / 2,
    top: Math.min(Math.max(top, box.top), box.top + box.height - height),
    width,
    height,
  };
}

interface IndicatorRect {
  x: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Sliding indicator, transitions-dev 16 (tabs sliding): JS writes the active
 * item's offset and width, CSS owns the tween. The first paint, resizes and
 * prop changes snap into place without a transition. The pill follows
 * pillRect; the bar spans the item on the top edge.
 */
function moveIndicator(animate: boolean): void {
  const nav = navRef.value;
  const indicator = indicatorRef.value;
  if (!nav || !indicator) {
    return;
  }
  const item = activeItem();
  if (!item) {
    indicator.style.opacity = "0";
    indicatorTarget = "";
    return;
  }

  const { x, width, top, height } =
    props.indicator === "pill"
      ? pillRect(nav, item)
      : { x: item.offsetLeft, width: item.offsetWidth, top: 0, height: 0 };

  const target = `${x}:${width}:${top}:${height}`;
  if (target === indicatorTarget) {
    return;
  }
  const snap = !animate || indicatorTarget === "";
  indicatorTarget = target;

  const apply = (): void => {
    indicator.style.transform = `translateX(${x}px)`;
    indicator.style.width = `${width}px`;
    if (props.indicator === "pill") {
      indicator.style.top = `${top}px`;
      indicator.style.height = `${height}px`;
    }
  };

  if (!snap) {
    apply();
    return;
  }

  const transition = indicator.style.transition;
  indicator.style.transition = "none";
  apply();
  indicator.style.opacity = "1";
  void indicator.offsetWidth;
  indicator.style.transition = transition;
}

/**
 * beside: showing the active label changes item widths at once. FLIP keeps it
 * smooth: capture where each item's content sits before the change, then play
 * it from there back to its new spot with the tabs-sliding tokens, in step
 * with the pill.
 */
const firstLefts = new Map<HTMLElement, number>();

function contentNodes(): HTMLElement[] {
  const nodes = navRef.value?.querySelectorAll<HTMLElement>("[data-slot=bottom-nav-content]") ?? [];
  return Array.from(nodes);
}

function captureContent(): void {
  firstLefts.clear();
  if (props.labelPlacement !== "beside") {
    return;
  }
  for (const node of contentNodes()) {
    firstLefts.set(node, node.getBoundingClientRect().left);
  }
}

function playContent(): void {
  if (props.labelPlacement !== "beside" || firstLefts.size === 0 || prefersReducedMotion()) {
    firstLefts.clear();
    return;
  }

  const nodes = contentNodes();
  for (const node of nodes) {
    node.style.transition = "none";
    node.style.transform = "";
  }

  const moved: HTMLElement[] = [];
  for (const node of nodes) {
    const first = firstLefts.get(node);
    if (first === undefined) {
      continue;
    }
    const dx = first - node.getBoundingClientRect().left;
    if (Math.abs(dx) >= 0.5) {
      node.style.transform = `translateX(${dx}px)`;
      moved.push(node);
    }
  }
  firstLefts.clear();
  if (moved.length === 0) {
    return;
  }

  void navRef.value?.offsetWidth;
  for (const node of moved) {
    node.style.transition = "transform var(--tabs-dur) var(--tabs-ease)";
    node.style.transform = "";
  }
}

let resizeObserver: ResizeObserver | null = null;
let stateObserver: MutationObserver | null = null;

onMounted(() => {
  nextTick(() => moveIndicator(false));

  if (navRef.value && typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => moveIndicator(false));
    resizeObserver.observe(navRef.value);
    navRef.value
      .querySelectorAll<HTMLElement>("[data-bottom-nav-item]")
      .forEach((item) => resizeObserver?.observe(item));
  }

  if (navRef.value && typeof MutationObserver !== "undefined") {
    stateObserver = new MutationObserver(() => nextTick(() => moveIndicator(true)));
    stateObserver.observe(navRef.value, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state"],
    });
  }
});

watch(() => [props.modelValue, route.path], captureContent, { flush: "pre" });

watch(
  () => [props.modelValue, route.path],
  () => {
    playContent();
    moveIndicator(true);
  },
  { flush: "post" },
);

watch(
  () => [props.indicator, props.size, props.labelDisplay, props.labelPlacement],
  () => {
    indicatorTarget = "";
    if (indicatorRef.value) {
      indicatorRef.value.style.top = "";
      indicatorRef.value.style.height = "";
      indicatorRef.value.style.opacity = "0";
    }
    nextTick(() => moveIndicator(false));
  },
  { flush: "post" },
);

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  stateObserver?.disconnect();
  stateObserver = null;
});

/**
 * hideOnScroll. Resolve the scroll source: explicit scrollTarget (element or
 * selector) wins, otherwise the window. Works in every position so a bar
 * inside a container can follow that container's scroll.
 */
const resolvedScrollSource = ref<HTMLElement | Window | null>(null);

function resolveScrollSource(): HTMLElement | Window | null {
  if (typeof window === "undefined") {
    return null;
  }
  if (!props.hideOnScroll) {
    return null;
  }
  const target = props.scrollTarget;
  if (typeof target === "string") {
    return document.querySelector<HTMLElement>(target) ?? window;
  }
  if (target instanceof HTMLElement) {
    return target;
  }
  return window;
}

const isHidden = ref(false);

const { y: scrollY, directions } = useScroll(resolvedScrollSource, {
  throttle: 50,
});

watch([() => directions.top, () => directions.bottom, scrollY], () => {
  if (!props.hideOnScroll) {
    isHidden.value = false;
    return;
  }
  if (scrollY.value <= 8) {
    isHidden.value = false;
    return;
  }
  if (directions.bottom) {
    isHidden.value = true;
  } else if (directions.top) {
    isHidden.value = false;
  }
});

onMounted(() => {
  resolvedScrollSource.value = resolveScrollSource();
});

watch(
  () => [props.scrollTarget, props.hideOnScroll, props.position],
  () => {
    resolvedScrollSource.value = resolveScrollSource();
  },
);

/**
 * Safe area: a --safe-area-inset-bottom set on an ancestor wins over the
 * device inset, so a container (or a device frame in docs) can supply its own.
 */
const rootVars =
  "[--bottom-nav-safe:var(--safe-area-inset-bottom,env(safe-area-inset-bottom))] [--bottom-nav-pill-inset:4px]";

const isOverlay = computed(() => props.position !== "static");
/** floating and glass sit away from the edges; the other variants span the bottom. */
const isFloatingOverlay = computed(
  () => (props.variant === "floating" || props.variant === "glass") && isOverlay.value,
);

const positionClass = computed(() => {
  if (!isOverlay.value) {
    return "relative w-full";
  }
  const layer = props.position === "fixed" ? "fixed z-40 lg:hidden" : "absolute z-40";
  return isFloatingOverlay.value
    ? cn(layer, "inset-x-4 bottom-[max(1rem,var(--bottom-nav-safe))]")
    : cn(layer, "inset-x-0 bottom-0 pb-(--bottom-nav-safe)");
});

/**
 * Hide and show follow transitions-dev 07 (panel reveal), the same motion as
 * the ticket cart bar: a short drop with a fade and blur, slower in than out.
 */
const visibilityClass = computed(() =>
  isHidden.value
    ? "pointer-events-none translate-y-4 opacity-0 blur-(--panel-blur) duration-(--panel-close-dur)"
    : "translate-y-0 opacity-100 blur-none duration-(--panel-open-dur)",
);

const containerClass = computed(() =>
  cn(
    "isolate flex items-stretch transition-[translate,opacity,filter] ease-(--panel-ease) motion-reduce:transition-none",
    rootVars,
    positionClass.value,
    bottomNavContainerClasses[props.variant],
    visibilityClass.value,
  ),
);

const indicatorVisualClass = computed(() =>
  props.indicator === "bar"
    ? cn("absolute top-0 z-0", bottomNavBarHeightClasses[props.size], bottomNavBarClasses)
    : cn("absolute z-0", bottomNavPillClasses[props.variant]),
);
</script>

<template>
  <nav
    ref="navRef"
    data-slot="bottom-nav"
    :data-variant="variant"
    :data-hidden="isHidden || undefined"
    :inert="isHidden || undefined"
    :aria-label="ariaLabel"
    :class="cn(containerClass, props.class)"
  >
    <span
      v-if="showSlidingIndicator"
      ref="indicatorRef"
      aria-hidden="true"
      data-slot="bottom-nav-indicator"
      :class="
        cn(
          indicatorVisualClass,
          'pointer-events-none left-0 opacity-0 transition-[transform,width] duration-(--tabs-dur) ease-(--tabs-ease) will-change-[transform,width] motion-reduce:transition-none',
        )
      "
    />
    <slot />
  </nav>
</template>
