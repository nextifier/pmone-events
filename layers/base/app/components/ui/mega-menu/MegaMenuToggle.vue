<script setup lang="ts">
/** Opens and closes the mobile sheet. Only visible below the breakpoint. */
import { HeaderMenuTrigger } from "@/components/ui/header-menu";
import type { HTMLAttributes } from "vue";
import { computed, inject } from "vue";
import { MEGA_MENU_BREAKPOINT_CLASSES, megaMenuKey } from "./context";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
  /** Colour of the icon bars. */
  barClass?: HTMLAttributes["class"];
  /** A visible label next to the icon, "Menu". */
  text?: string;
}>();

const menu = inject(megaMenuKey)!;
const classes = computed(() => MEGA_MENU_BREAKPOINT_CLASSES[menu.breakpoint.value]);
</script>

<template>
  <HeaderMenuTrigger :class="cn(!menu.toggleAlways.value && classes.mobileOnly, props.class)" :bar-class="barClass" :text="text" />
</template>
