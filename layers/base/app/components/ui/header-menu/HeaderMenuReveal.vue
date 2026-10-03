<script setup lang="ts">
/**
 * One line of an underlay panel. Each one rises into place a beat after the
 * one before it: it slides in from the right while it fades in. It leaves in
 * one go, with no slide. Outside the underlay panel it is a plain element.
 */
import { computed, inject } from "vue";
import { headerMenuPanelKey } from "./context";

const props = withDefaults(defineProps<{ as?: string }>(), { as: "div" });

const panel = inject(headerMenuPanelKey, null);
const index = panel?.nextIndex() ?? 0;
const style = computed(() => ({ "--hm-i": index }));
</script>

<template>
  <component :is="props.as" :data-hm-reveal="panel ? '' : undefined" :style="panel ? style : undefined">
    <slot />
  </component>
</template>
