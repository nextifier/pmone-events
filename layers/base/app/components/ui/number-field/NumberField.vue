<script setup lang="ts">
import type { NumberFieldRootEmits, NumberFieldRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { NumberFieldRoot, useForwardPropsEmits } from "reka-ui"
import { cn } from "@/lib/utils"

/**
 * `focusOnChange` defaults to FALSE here, where reka defaults it to true.
 *
 * reka's root focuses the <input> on every step (`if (props.focusOnChange)
 * inputEl.focus()`), and our Increment/Decrement commit on `click` rather than
 * on `pointerdown` so that a swipe starting on a button cannot change the value.
 * On a touch screen a click IS an activation-triggering event, which is exactly
 * what a browser waits for before raising the on-screen keyboard - so every tap
 * on + or - popped up the numeric keypad.
 *
 * The buttons hand focus back themselves, but only for a mouse; see
 * usePressHold. A call site can still pass `:focus-on-change="true"` to opt back
 * into reka's behaviour.
 */
const props = withDefaults(
  defineProps<NumberFieldRootProps & { class?: HTMLAttributes["class"] }>(),
  { focusOnChange: false },
)
const emits = defineEmits<NumberFieldRootEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <NumberFieldRoot v-bind="forwarded" :class="cn('grid gap-1.5', props.class)">
    <slot />
  </NumberFieldRoot>
</template>
