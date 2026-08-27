<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { Label } from '@/components/ui/label'

const props = defineProps<{
  class?: HTMLAttributes["class"]
  /**
   * Declared rather than left to attribute fallthrough.
   *
   * `<FieldLabel required>` already worked: this component's root IS <Label>,
   * which declares `required` as a prop, and nothing here sets
   * `inheritAttrs: false`, so the attribute reached it on its own. Declaring it
   * changes no behaviour today - it makes the prop part of this component's
   * stated API instead of a side effect of its internals, so adding
   * `inheritAttrs: false` or wrapping the root in a div later cannot silently
   * strip the asterisk off every required field in the app.
   *
   * The main.css fallback (which marks a label whose ADJACENT SIBLING is a
   * native required control) stands down wherever this draws a marker, via
   * `:not(:has([data-slot=label-required]))`. So the two never double up.
   */
  required?: boolean
}>()
</script>

<template>
  <Label
    data-slot="field-label"
    :required="props.required"
    :class="cn(
      'cn-field-label group/field-label peer/field-label flex w-fit leading-snug',
      'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col',
      props.class,
    )"
  >
    <slot />
  </Label>
</template>
