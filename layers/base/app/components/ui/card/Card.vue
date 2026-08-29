<script setup lang="ts">
/**
 * `@container/card` is declared here, not on the header.
 *
 * CardHeader needs to change its own column layout by width, and an element
 * cannot query a container it declares itself - the `@container/card-header` it
 * carries is for its children. Naming the container on the card gives the
 * header something above it to ask.
 */
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    size?: "default" | "sm";
  }>(),
  { size: "default" },
);
</script>

<template>
  <div
    data-slot="card"
    :data-size="size"
    :class="cn('cn-card group/card @container/card flex flex-col', props.class)"
  >
    <slot />
  </div>
</template>
