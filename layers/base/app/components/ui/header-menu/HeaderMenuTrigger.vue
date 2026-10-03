<script setup lang="ts">
/**
 * The menu button. It is also the close control: the bars morph into a cross
 * while the sheet is open. `pointer-events-auto` because the scroll lock turns
 * the page inert, and the header sits outside the sheet.
 *
 * Give it `text` for a labelled button, "Menu" and a hamburger.
 */
import { cn } from "@/lib/utils";
import { DrawerTrigger, injectDrawerRootContext } from "@/components/ui/drawer";
import type { HTMLAttributes } from "vue";
import { computed } from "vue";
import HeaderMenuBurger from "./HeaderMenuBurger.vue";

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    barClass?: HTMLAttributes["class"];
    /** Accessible name of the button. */
    label?: string;
    /** A visible label next to the icon. */
    text?: string;
  }>(),
  { class: undefined, barClass: undefined, label: "Menu", text: undefined },
);

const root = injectDrawerRootContext();
const open = computed(() => Boolean(root.open.value));
</script>

<template>
  <DrawerTrigger toggle as-child>
    <button
      type="button"
      data-slot="header-menu-trigger"
      :aria-label="label"
      :class="
        cn(
          'focus-visible:ring-ring pointer-events-auto relative flex shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-lg outline-none focus-visible:ring-2',
          text ? 'h-8 gap-0.5 ps-2.5 pe-0.5 text-sm font-medium tracking-tight' : 'size-8',
          props.class,
        )
      "
    >
      <span v-if="text" aria-hidden="true">{{ text }}</span>
      <HeaderMenuBurger :open="open" :bar-class="barClass" />
    </button>
  </DrawerTrigger>
</template>
