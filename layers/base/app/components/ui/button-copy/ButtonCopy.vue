<template>
  <!-- Labelled form. Any call site that sits in a ROW of labelled actions needs
       this one: an unlabelled glyph beside labelled buttons reads as decoration
       rather than a control, and at size-7 it is also below the touch target the
       Button primitive gives its own controls for free. -->
  <Button
    v-if="label"
    type="button"
    :variant="variant"
    :aria-label="copied ? copiedText : label"
    @click="copy(text)"
  >
    <Icon
      :name="copied ? 'lucide:check' : 'hugeicons:copy-01'"
      :class="['size-4 shrink-0', copied ? 'text-success-foreground' : undefined]"
      aria-hidden="true"
    />
    {{ copied ? copiedText : label }}
  </Button>

  <!-- Icon-only form, unchanged: the inline control that sits beside a reference
       code, an API key or a URL, where the thing it copies is right next to it
       and a label would only repeat what the eye already has. -->
  <button
    v-else
    type="button"
    @click="copy(text)"
    :disabled="copied"
    :aria-label="copied ? 'Copied' : 'Copy to clipboard'"
    v-tippy="copied ? 'Copied' : 'Copy to clipboard'"
    class="text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-lg disabled:opacity-100"
  >
    <div :class="['transition-[opacity,transform]', copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0']">
      <Icon
        name="lucide:check"
        class="text-success-foreground size-4 shrink-0"
        aria-hidden="true"
      />
    </div>
    <div
      :class="['absolute transition-[opacity,transform]', copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100']"
    >
      <Icon name="hugeicons:copy-01" class="size-4 shrink-0" aria-hidden="true" />
    </div>
  </button>
</template>

<script setup>
import { computed } from "vue";
import { useClipboard } from "@vueuse/core";
import { Button } from "../button";

const { copy, copied } = useClipboard();

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  /**
   * Renders the labelled Button form instead of the bare icon. Empty by
   * default, so every existing call site keeps exactly the control it had.
   */
  label: {
    type: String,
    default: "",
  },
  /**
   * What the label becomes for the moment after the copy lands. The check icon
   * carries the same news, but on its own it is a 16px change a thumb covers;
   * the word is what actually confirms it on a phone.
   */
  copiedLabel: {
    type: String,
    default: "",
  },
  variant: {
    type: String,
    default: "outline",
  },
});

const copiedText = computed(() => props.copiedLabel || props.label);
</script>
