<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { formatMessageTime } from "./time";

/** The clock beside one turn. Context you read without asking, so it never fades. */
const props = defineProps<{
  at: string;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <span
    data-slot="chat-timestamp"
    :class="cn('text-muted-foreground text-sm tracking-tight tabular-nums', props.class)"
  >
    {{ formatMessageTime(at) }}
  </span>
</template>
