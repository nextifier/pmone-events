<script setup lang="ts">
/**
 * A close button for inside the panel, with a label and the cross the menu button
 * turns into.
 *
 * With `anchor` it sits exactly where the menu button is on screen, so the one
 * button you pressed to open the menu is the one you press to close it: the
 * menu button slides out under the page and this takes its place.
 */
import { cn } from "@/lib/utils";
import { DrawerClose, injectDrawerRootContext } from "@/components/ui/drawer";
import { useEventListener } from "@vueuse/core";
import type { HTMLAttributes } from "vue";
import { computed, inject, nextTick, ref, watch } from "vue";
import { headerMenuKey, headerMenuPanelKey } from "./context";
import HeaderMenuBurger from "./HeaderMenuBurger.vue";

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    text?: string;
    barClass?: HTMLAttributes["class"];
    /** Place it over the menu button instead of in the flow of the panel. */
    anchor?: boolean;
  }>(),
  { class: undefined, text: "Close", barClass: undefined, anchor: false },
);

const menu = inject(headerMenuKey, null);
const panel = inject(headerMenuPanelKey, null);
const root = injectDrawerRootContext();
const open = computed(() => Boolean(menu?.().open.value));

const button = ref<HTMLElement | null>(null);
const position = ref<{ top: string; right: string } | null>(null);

function place() {
  const trigger = root.triggerElement.value as HTMLElement | undefined;
  const parent = button.value?.offsetParent as HTMLElement | null | undefined;
  if (!props.anchor || !trigger || !parent) return;
  const t = trigger.getBoundingClientRect();
  const p = parent.getBoundingClientRect();
  position.value = { top: `${t.top - p.top}px`, right: `${p.right - t.right}px` };
}
watch(
  open,
  (isOpen) => {
    if (isOpen) nextTick(place);
  },
  { immediate: true },
);
useEventListener(typeof window === "undefined" ? undefined : window, "resize", place);
</script>

<template>
  <DrawerClose as-child>
    <button
      ref="button"
      type="button"
      data-slot="header-menu-close"
      :data-hm-reveal="anchor && panel ? '' : undefined"
      :aria-label="text"
      :style="anchor ? { position: 'absolute', zIndex: 10, '--hm-i': 0, ...position } : undefined"
      :class="
        cn(
          'focus-visible:ring-ring flex h-8 cursor-pointer touch-manipulation items-center gap-0.5 rounded-lg ps-2.5 text-sm font-medium tracking-tight outline-none focus-visible:ring-2',
          anchor ? 'pe-0' : 'pe-0.5',
          props.class,
        )
      "
    >
      <span aria-hidden="true">{{ text }}</span>
      <HeaderMenuBurger :open="open" :bar-class="barClass" />
    </button>
  </DrawerClose>
</template>
