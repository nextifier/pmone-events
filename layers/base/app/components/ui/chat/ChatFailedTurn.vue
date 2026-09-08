<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A turn that never reached the server.
 *
 * It keeps the reader's own words where they wrote them, says what went wrong,
 * and sends the same thing again on request. Removing the bubble and refilling
 * the box meant the reader watched their own message vanish and had to work out
 * that the box refilling was a failure, not a bug.
 */
const props = defineProps<{
  error: string;
  /** While another turn is in flight. */
  disabled?: boolean;
  class?: HTMLAttributes["class"];
}>();

const emit = defineEmits<{
  retry: [];
  discard: [];
}>();
</script>

<template>
  <div
    data-slot="chat-failed-turn"
    :class="cn('mt-1.5 flex flex-wrap items-center justify-end gap-x-2 gap-y-1', props.class)"
  >
    <span class="text-destructive-foreground inline-flex items-center gap-1.5 text-sm tracking-tight">
      <Icon name="hugeicons:alert-02" class="size-4 shrink-0" />
      {{ error }}
    </span>

    <div class="flex items-center gap-x-1">
      <Button
        variant="outline"
        size="xs"
        class="rounded-full"
        :disabled="disabled"
        @click="emit('retry')"
      >
        <Icon name="hugeicons:refresh" />
        Retry
      </Button>
      <Button
        variant="ghost"
        size="xs"
        class="rounded-full"
        :disabled="disabled"
        @click="emit('discard')"
      >
        Discard
      </Button>
    </div>
  </div>
</template>
