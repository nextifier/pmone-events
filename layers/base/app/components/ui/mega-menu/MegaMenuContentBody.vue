<script setup lang="ts">
/**
 * Internal. Gives every mount of a panel its own reveal counter. The wrapper
 * MegaMenuContent stays alive between opens while reka-ui unmounts the panel
 * body, so a counter kept on the wrapper would keep growing and push the
 * reveal delay out by seconds.
 */
import { provide } from "vue";
import { megaMenuContentKey } from "./context";

let index = 0;
provide(megaMenuContentKey, { nextIndex: () => index++ });
</script>

<template>
  <slot />
</template>
