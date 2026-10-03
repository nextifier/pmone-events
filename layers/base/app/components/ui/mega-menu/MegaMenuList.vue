<script setup lang="ts">
/**
 * Desktop: the row of triggers. Mobile: the same items as an accordion in the header
 * sheet, unless a MegaMenuSheet brings its own content. `mobileClass` styles that list.
 */
import { cn } from "@/lib/utils";
import { NavigationMenuList } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { HeaderMenuPanel } from "@/components/ui/header-menu";
import { computed, inject } from "vue";
import { MEGA_MENU_BREAKPOINT_CLASSES, megaMenuKey } from "./context";

const props = defineProps<{
  class?: HTMLAttributes["class"];
  /** Classes for the accordion list in the mobile sheet. */
  mobileClass?: HTMLAttributes["class"];
  /** Classes for the scrolling area of the mobile sheet. */
  bodyClass?: HTMLAttributes["class"];
}>();

const menu = inject(megaMenuKey)!;
const classes = computed(() => MEGA_MENU_BREAKPOINT_CLASSES[menu.breakpoint.value]);
</script>

<template>
  <NavigationMenuList
    v-if="menu.mode.value === 'desktop'"
    data-slot="mega-menu-list"
    :class="cn('flex list-none items-center gap-1', classes.desktopOnly, props.class)"
  >
    <slot />
  </NavigationMenuList>
  <HeaderMenuPanel v-else-if="!menu.hasSheet.value" :id="menu.panelId" class="mega-menu" :body-class="bodyClass">
    <ul data-slot="mega-menu-mobile-list" :class="cn('flex list-none flex-col gap-0.5 p-3', props.mobileClass)">
      <slot />
    </ul>
  </HeaderMenuPanel>
</template>
