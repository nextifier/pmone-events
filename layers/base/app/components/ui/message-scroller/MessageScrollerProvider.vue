<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, watch } from "vue";
import type { MessageScrollerDefaultScrollPosition } from "./engine";
import { createMessageScrollerEngine } from "./engine";
import { MessageScrollerContextKey } from "./context";

const props = withDefaults(
  defineProps<{
    autoScroll?: boolean;
    defaultScrollPosition?: MessageScrollerDefaultScrollPosition;
    scrollEdgeThreshold?: number;
    scrollPreviousItemPeek?: number;
    scrollMargin?: number;
  }>(),
  {
    autoScroll: false,
    defaultScrollPosition: "end",
  }
);

const engine = createMessageScrollerEngine({
  autoScroll: props.autoScroll,
  defaultScrollPosition: props.defaultScrollPosition,
  scrollEdgeThreshold: props.scrollEdgeThreshold,
  scrollPreviousItemPeek: props.scrollPreviousItemPeek,
  scrollMargin: props.scrollMargin,
});

provide(MessageScrollerContextKey, engine);

// The opening position is a one-shot read at creation, so without this a host
// that switches it has to remount the provider for anything to happen.
watch(
  () => props.defaultScrollPosition,
  (value) => engine.setDefaultScrollPosition(value)
);

onMounted(() => {
  engine.initialize();
});

onBeforeUnmount(() => {
  engine.destroy();
});
</script>

<template>
  <slot />
</template>
