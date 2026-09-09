<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import type { AttachmentMediaVariants } from ".";
import { cn } from "@/lib/utils";
import { attachmentMediaVariants } from ".";

/**
 * `variant` needs a real default, not just the one cva falls back to: without
 * it `data-variant` is absent on the default case while the class list still
 * says `icon`, so any CSS written against `[data-variant="icon"]` misses.
 */
const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    variant?: AttachmentMediaVariants["variant"];
  }>(),
  { variant: "icon" }
);
</script>

<template>
  <div
    data-slot="attachment-media"
    :data-variant="variant"
    :class="cn(attachmentMediaVariants({ variant }), props.class)"
  >
    <slot />
  </div>
</template>
