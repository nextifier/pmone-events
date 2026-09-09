<script setup lang="ts">
import type { ContextMenuContentEmits, ContextMenuContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  ContextMenuContent,

  ContextMenuPortal,
  useForwardPropsEmits,
} from "reka-ui"
import { cn, hasSlotContent } from "@/lib/utils"

const props = defineProps<ContextMenuContentProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<ContextMenuContentEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <!-- Nothing in it, nothing to open. Every item here is conditional at
       some call site, and when they all evaluate to false reka still portalled
       a padded, shadowed, dismissable box with no content - which reads as a
       glitch and eats the next click. -->
  <ContextMenuPortal v-if="hasSlotContent($slots.default)">
    <ContextMenuContent
      data-slot="context-menu-content"
      v-bind="forwarded"
      :class="cn(
        'cn-context-menu-content cn-context-menu-content-logical cn-menu-target cn-menu-translucent z-50 max-h-(--reka-context-menu-content-available-height) origin-(--reka-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto',
        props.class,
      )"
    >
      <slot />
    </ContextMenuContent>
  </ContextMenuPortal>
</template>
