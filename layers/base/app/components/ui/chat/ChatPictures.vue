<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { Lightbox } from "@/components/ui/lightbox";
import { cn } from "@/lib/utils";

/**
 * Pictures are shown, not named.
 *
 * A chat that answers a screenshot with the word "screenshot.png" makes the
 * reader open something to remember what they sent. Each picture opens in the
 * lightbox; anything without a URL belongs in `ChatFileChips` instead.
 */
const props = defineProps<{
  items: Array<{ url: string; name?: string | null }>;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div
    v-if="items.length"
    data-slot="chat-pictures"
    :class="cn('flex flex-wrap justify-start gap-1.5', props.class)"
  >
    <Lightbox
      v-for="(picture, i) in items"
      :key="i"
      :items="[{ url: picture.url }]"
      :alt="picture.name || 'Attached image'"
    >
      <template #trigger="{ open }">
        <button
          type="button"
          class="border-border bg-muted block cursor-zoom-in overflow-hidden rounded-xl border"
          :aria-label="`Open ${picture.name || 'the attached image'}`"
          @click="open"
        >
          <img
            :src="picture.url"
            :alt="picture.name || 'Attached image'"
            loading="lazy"
            class="max-h-56 w-auto max-w-full object-cover"
          />
        </button>
      </template>
    </Lightbox>
  </div>
</template>
