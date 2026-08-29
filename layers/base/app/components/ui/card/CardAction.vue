<script setup lang="ts">
/**
 * Beside the title on a wide card, on its own row under it on a narrow one.
 *
 * Pinned to column two at every width, an action as wide as a three-way
 * segmented switcher took the column it asked for and left the title wrapping
 * to four lines beside it. The switch is on the CARD's width, not the
 * viewport's: the same card is wide on its own and narrow in a two-column grid,
 * and only a container query can tell those apart.
 */
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="card-action"
    :class="cn('cn-card-action self-start pt-1 @lg/card:col-start-2 @lg/card:row-span-2 @lg/card:row-start-1 @lg/card:justify-self-end @lg/card:pt-0', props.class)"
  >
    <slot />
  </div>
</template>
