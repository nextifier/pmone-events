<script setup lang="ts">
/**
 * The panel body for one item. On desktop it is mounted into the shared
 * viewport; on mobile it is the body of that item's accordion section.
 * `mobileClass` swaps the layout classes for the stacked mobile version.
 */
import { cn } from "@/lib/utils";
import { NavigationMenuContent } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { computed, inject } from "vue";
import { megaMenuItemKey, megaMenuKey } from "./context";
import MegaMenuContentBody from "./MegaMenuContentBody.vue";

const props = defineProps<{
  class?: HTMLAttributes["class"];
  mobileClass?: HTMLAttributes["class"];
  /** A short list of links: the panel itself animates, its contents do not. */
  plain?: boolean;
}>();

const menu = inject(megaMenuKey)!;
const item = inject(megaMenuItemKey)!;
const open = computed(() => menu.mobileValue.value === item.value);
</script>

<template>
  <NavigationMenuContent
    v-if="menu.mode.value === 'desktop'"
    data-slot="mega-menu-content"
    :data-plain="plain ? '' : undefined"
    :class="props.class"
  >
    <MegaMenuContentBody>
      <slot />
    </MegaMenuContentBody>
  </NavigationMenuContent>
  <div
    v-else
    data-slot="mega-menu-collapse"
    :data-state="open ? 'open' : 'closed'"
    :inert="!open || undefined"
  >
    <div>
      <div :class="cn('pt-1 pb-2', props.mobileClass)">
        <MegaMenuContentBody>
          <slot />
        </MegaMenuContentBody>
      </div>
    </div>
  </div>
</template>
