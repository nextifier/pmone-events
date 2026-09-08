<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

/** The date a run of messages belongs to, stated once above it. */
const props = defineProps<{
  label: string;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div
    data-slot="chat-day-divider"
    :class="cn('my-2 flex items-center justify-center', props.class)"
    role="separator"
    :aria-label="label"
  >
    <span class="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-sm tracking-tight">
      {{ label }}
    </span>
  </div>
</template>
