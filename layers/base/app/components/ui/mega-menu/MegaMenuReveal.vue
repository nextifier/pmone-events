<script setup lang="ts">
/**
 * Wraps any block of a content panel so it takes part in the staggered
 * reveal. Outside a MegaMenuColumn the block is a group of its own.
 */
import { useRevealStyle } from "./useReveal";

const props = withDefaults(defineProps<{ as?: string }>(), { as: "div" });

const style = useRevealStyle();
</script>

<template>
  <component :is="props.as" data-reveal :style="style">
    <slot />
  </component>
</template>
