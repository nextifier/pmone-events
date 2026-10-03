<script setup lang="ts">
/**
 * The sheet. It starts under the header, so the header stays visible and the
 * menu button stays reachable, and it closes on a swipe toward its edge, on
 * Escape, on a tap on the backdrop, and on the back button.
 */
import { cn } from "@/lib/utils";
import {
  DrawerClose,
  DrawerDescription,
  DrawerPopup,
  DrawerTitle,
  injectDrawerRootContext,
} from "@/components/ui/drawer";
import type { HTMLAttributes } from "vue";
import { useEventListener } from "@vueuse/core";
import { computed, inject, nextTick, provide, ref, watch } from "vue";
import { HEADER_MENU_UNDERLAY_WIDTH, headerMenuKey, headerMenuPanelKey } from "./context";

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    /** Classes for the scrolling area that holds the content. */
    bodyClass?: HTMLAttributes["class"];
    /** Classes for the backdrop, merged over its defaults: `bg-black/80` for a darker one. */
    overlayClass?: HTMLAttributes["class"];
    /** Widest the sheet gets on a screen wider than a phone. Defaults to md, and to sm when floating. Sheets from the top or bottom, and the full variant, take the whole width. */
    size?: "sm" | "md" | "lg" | "xl" | "2xl";
    title?: string;
    description?: string;
  }>(),
  { class: undefined, bodyClass: undefined, overlayClass: undefined, size: undefined, title: "Menu", description: "Navigation menu" },
);

/** Written out in full so Tailwind can see them. */
const SIZES = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
} as const;

const menu = inject(headerMenuKey, null);
const config = computed(() => menu?.() ?? { side: "right", variant: "straight", offset: "3.5rem", portalTo: undefined, open: undefined, underlay: undefined, underlayWidth: HEADER_MENU_UNDERLAY_WIDTH });
const underlay = computed(() => Boolean(config.value.underlay?.value));
const open = computed(() => Boolean(config.value.open?.value));
let revealIndex = 0;
provide(headerMenuPanelKey, { nextIndex: () => revealIndex++ });
const contained = computed(() => Boolean(config.value.portalTo));

const style = computed(() => ({ "--hm-offset": config.value.offset }));

const viewportClass = computed(() =>
  cn(
    contained.value ? 'absolute inset-x-0 top-(--hm-offset) bottom-0' : 'top-(--hm-offset)',
    config.value.variant === "floating" && "sm:p-3",
  ),
);

const backdropClass = computed(() =>
  cn(
    "top-(--hm-offset) bg-black/40 ease-(--panel-ease) duration-(--panel-open-dur) data-ending-style:duration-(--panel-close-dur) motion-reduce:transition-none!",
    contained.value && "absolute",
    config.value.variant === "glass" && "bg-black/30 backdrop-blur-[2px]",
    props.overlayClass,
  ),
);

const popupClass = computed(() => {
  const { variant, side } = config.value;
  const vertical = side === "top" || side === "bottom";
  const width =
    variant === "full" || vertical ? "max-w-none" : SIZES[props.size ?? (variant === "floating" ? "sm" : "md")];
  return cn(
    "w-full after:hidden ease-(--panel-ease) duration-(--panel-open-dur) data-ending-style:duration-(--panel-close-dur) motion-reduce:transition-none!",
    width,
    variant === "straight" && "bg-background text-foreground shadow-none dark:sm:border",
    variant === "straight" && (side === "right" ? "border-s-0" : side === "left" ? "border-e-0" : ""),
    variant === "floating" && "bg-popover text-popover-foreground sm:rounded-2xl sm:border sm:shadow-xl",
    variant === "floating" && !vertical && "self-start",
    variant === "glass" && "bg-background/75 text-foreground supports-backdrop-filter:bg-background/60 backdrop-blur-xl shadow-none",
    variant === "full" && "bg-background text-foreground shadow-none",
    props.class,
  );
});

const underlayEl = ref<HTMLElement | null>(null);
useEventListener(document, "keydown", (event: KeyboardEvent) => {
  if (event.key === "Escape" && underlay.value && open.value) config.value.close?.();
});
const root = injectDrawerRootContext();
watch(open, async (isOpen, wasOpen) => {
  if (!underlay.value) return;
  // The drawer hands focus back to its button on its own; this panel is not a drawer, so it does.
  if (!isOpen && wasOpen) (root.triggerElement.value as HTMLElement | undefined)?.focus({ preventScroll: true });
  if (!isOpen) return;
  await nextTick();
  setTimeout(() => underlayEl.value?.querySelector<HTMLElement>("a[href], button")?.focus({ preventScroll: true }), 120);
});

const underlayStyle = computed(() => ({ "--hm-panel": config.value.underlayWidth }));

const drawerVariant = computed(() => (config.value.variant === "floating" ? "inset" : "straight"));
</script>

<template>
  <Teleport v-if="underlay" :to="config.portalTo ?? 'body'">
    <!-- A white layer under the whole page: the page insets from it at the top and
         bottom and rounds its corners, and what shows around it is this. The panel
         sits at its right edge. -->
    <div
      ref="underlayEl"
      data-slot="header-menu-panel"
      :data-state="open ? 'open' : 'closed'"
      :inert="!open || undefined"
      :aria-hidden="!open"
      :style="underlayStyle"
      :class="
        cn(
          'hm-underlay bg-background text-foreground z-0 overflow-hidden',
          contained ? 'absolute inset-0' : 'fixed inset-0',
          props.class,
        )
      "
    >
      <div :class="cn('@container absolute inset-y-0 right-0 flex w-(--hm-panel) flex-col', bodyClass)">
        <slot :underlay="true" />
      </div>
    </div>
  </Teleport>
  <DrawerPopup
    v-else
    data-slot="header-menu-panel"
    :variant="drawerVariant"
    :viewport-class="viewportClass"
    :viewport-style="style"
    :overlay-class="backdropClass"
    :overlay-style="style"
    :portal-to="config.portalTo"
    :class="popupClass"
    tabindex="-1"
  >
    <DrawerTitle class="sr-only">{{ title }}</DrawerTitle>
    <DrawerDescription class="sr-only">{{ description }}</DrawerDescription>
    <div :class="cn('min-h-0 flex-1 touch-auto overflow-y-auto overscroll-contain', bodyClass)">
      <slot :underlay="false" />
    </div>
  </DrawerPopup>
</template>

<style>
/*
 * Lines of the underlay panel arrive one after another, each sliding in from
 * the right while it fades in, starting a moment after the page begins to
 * move: no wait for the first, then 50ms per line. They leave together, quickly, without the
 * slide. Same curve and length as the page.
 */
.hm-underlay {
  --hm-dur: 720ms;
  --hm-ease: cubic-bezier(0.32, 0.72, 0, 1);
  --hm-reveal-x: 4.5rem;
}
.hm-underlay [data-hm-reveal] {
  opacity: 0;
  transform: translateX(var(--hm-reveal-x));
  transition:
    opacity 200ms ease-out,
    transform 0s linear 200ms;
}
.hm-underlay[data-state="open"] [data-hm-reveal] {
  opacity: 1;
  transform: translateX(0);
  transition:
    opacity var(--hm-dur) var(--hm-ease) calc(var(--hm-i, 0) * 50ms),
    transform var(--hm-dur) var(--hm-ease) calc(var(--hm-i, 0) * 50ms);
}
.hm-underlay:not([data-state="open"]) {
  visibility: hidden;
  transition: visibility 0s linear 720ms;
}
@media (prefers-reduced-motion: reduce) {
  .hm-underlay [data-hm-reveal],
  .hm-underlay[data-state="open"] [data-hm-reveal] {
    transition: none;
  }
}
</style>
