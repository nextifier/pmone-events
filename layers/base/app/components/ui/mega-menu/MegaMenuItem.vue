<script setup lang="ts">
import { cn } from "@/lib/utils";
import { NavigationMenuItem } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { inject, provide, useId } from "vue";
import { megaMenuItemKey, megaMenuKey } from "./context";

const props = defineProps<{
  class?: HTMLAttributes["class"];
  /** Identifies the item. Required on items that carry a MegaMenuContent. */
  value?: string;
}>();

const menu = inject(megaMenuKey)!;
const value = props.value ?? useId();
provide(megaMenuItemKey, { value });
</script>

<template>
  <NavigationMenuItem
    v-if="menu.mode.value === 'desktop'"
    :value="value"
    data-slot="mega-menu-item"
    :class="cn('list-none', props.class)"
  >
    <slot />
  </NavigationMenuItem>
  <li v-else data-slot="mega-menu-item" :class="cn('list-none', props.class)">
    <slot />
  </li>
</template>
