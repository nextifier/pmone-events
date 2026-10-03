<script setup lang="ts">
/**
 * A notch that slides under the active trigger, pointing at it from the
 * panel. Style it with `class` (position) and `arrowClass` (the shape).
 */
import { cn } from "@/lib/utils";
import { NavigationMenuIndicator } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { inject } from "vue";
import { megaMenuKey } from "./context";

const props = defineProps<{
  class?: HTMLAttributes["class"];
  arrowClass?: HTMLAttributes["class"];
}>();

const menu = inject(megaMenuKey)!;
</script>

<template>
  <NavigationMenuIndicator
    v-if="menu.mode.value === 'desktop'"
    data-slot="mega-menu-indicator"
    :class="
      cn(
        'absolute top-full left-0 z-60 flex h-2 w-(--reka-navigation-menu-indicator-size) translate-x-(--reka-navigation-menu-indicator-position) items-end justify-center overflow-hidden transition-[width,translate,opacity] duration-(--mm-resize) ease-(--mm-ease) data-[state=hidden]:opacity-0 data-[state=visible]:opacity-100 motion-reduce:transition-none',
        props.class,
      )
    "
  >
    <div
      :class="
        cn(
          'bg-popover relative top-[60%] size-3 rotate-45 rounded-tl-[3px] border',
          props.arrowClass,
        )
      "
    />
  </NavigationMenuIndicator>
</template>
