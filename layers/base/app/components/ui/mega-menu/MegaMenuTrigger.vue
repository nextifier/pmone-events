<script setup lang="ts">
import { cn } from "@/lib/utils";
import { NavigationMenuTrigger } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { computed, inject } from "vue";
import { megaMenuItemKey, megaMenuKey } from "./context";

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    /** Hide the chevron, for triggers that draw their own indicator. */
    hideIcon?: boolean;
    /** Classes for the chevron, merged over the default size and tone. */
    iconClass?: HTMLAttributes["class"];
  }>(),
  { hideIcon: false },
);

const menu = inject(megaMenuKey)!;
const item = inject(megaMenuItemKey)!;
const open = computed(() => menu.mobileValue.value === item.value);

/**
 * A panel opened by hover is already what the click was going to ask for, so a
 * mouse click on an open trigger keeps it open instead of closing it. Keyboard
 * and touch still toggle, and click mode toggles as usual.
 */
function onClickCapture(event: MouseEvent) {
  const el = event.currentTarget as HTMLElement;
  if (
    menu.openOn.value === "hover" &&
    el.dataset.state === "open" &&
    (event as PointerEvent).pointerType === "mouse"
  ) {
    event.stopImmediatePropagation();
  }
}

const base =
  "group/mm-trigger inline-flex h-9 cursor-pointer items-center gap-1 rounded-full px-3 text-sm font-medium tracking-tight whitespace-nowrap outline-none transition-colors hover:bg-black/[0.035] dark:hover:bg-white/8 focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-black/[0.035] dark:data-[state=open]:bg-white/8";
const chevron = "size-4 shrink-0 opacity-60";
</script>

<template>
  <NavigationMenuTrigger
    v-if="menu.mode.value === 'desktop'"
    data-slot="mega-menu-trigger"
    :class="cn(base, props.class)"
    @click.capture="onClickCapture"
  >
    <slot />
    <Icon v-if="!hideIcon" name="hugeicons:arrow-down-01" data-slot="mega-menu-chevron" :class="cn(chevron, props.iconClass)" aria-hidden="true" />
  </NavigationMenuTrigger>
  <button
    v-else
    type="button"
    data-slot="mega-menu-trigger"
    :aria-expanded="open"
    :class="cn(base, 'h-11 w-full justify-between rounded-lg px-3 text-base', props.class)"
    @click="menu.toggleMobileValue(item.value)"
  >
    <slot />
    <Icon v-if="!hideIcon" name="hugeicons:arrow-down-01" data-slot="mega-menu-chevron" :class="cn(chevron, props.iconClass)" aria-hidden="true" />
  </button>
</template>
