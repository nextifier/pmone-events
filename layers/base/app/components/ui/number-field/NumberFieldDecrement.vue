<script setup lang="ts">
import type { NumberFieldDecrementProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { Minus } from "@lucide/vue"
import { injectNumberFieldRootContext } from "reka-ui"
import { computed } from "vue"
import { cn } from "@/lib/utils"
import { usePressHold } from "./usePressHold"

const props = defineProps<NumberFieldDecrementProps & { class?: HTMLAttributes["class"] }>()

// A plain button rather than reka's NumberFieldDecrement: see usePressHold for
// why the trigger had to move off pointerdown. Everything that decides WHAT
// happens still comes from reka's root context.
const rootContext = injectNumberFieldRootContext()

const isDisabled = computed(
  () =>
    rootContext.disabled?.value
    || rootContext.readonly.value
    || props.disabled
    || rootContext.isDecreaseDisabled.value,
)

const { isPressed, onPointerdown, onPointermove, onPointerup, onPointercancel, onClick }
  = usePressHold(() => rootContext.handleDecrease(), () => !!isDisabled.value)
</script>

<template>
  <button
    data-slot="decrement"
    type="button"
    tabindex="-1"
    aria-label="Decrease"
    :disabled="isDisabled"
    :data-disabled="isDisabled ? '' : undefined"
    :data-pressed="isPressed ? 'true' : undefined"
    :style="{ userSelect: isPressed ? 'none' : undefined }"
    :class="cn('absolute top-1/2 -translate-y-1/2 left-0 p-3 disabled:cursor-not-allowed disabled:opacity-20', props.class)"
    @pointerdown="onPointerdown"
    @pointermove="onPointermove"
    @pointerup="onPointerup"
    @pointercancel="onPointercancel"
    @click="onClick"
    @contextmenu.prevent
  >
    <slot>
      <Minus class="h-4 w-4" />
    </slot>
  </button>
</template>
