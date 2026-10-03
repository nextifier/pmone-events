<script setup lang="ts">
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "vue";
import { computed, inject, provide } from "vue";
import { megaMenuColumnKey, megaMenuContentKey } from "./context";
import MegaMenuReveal from "./MegaMenuReveal.vue";

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    /** Heading at the top of the column. */
    label?: string;
    labelClass?: HTMLAttributes["class"];
    /** Fill the column with --mm-tint (defaults to the muted colour). */
    tinted?: boolean;
  }>(),
  { label: undefined, labelClass: undefined, tinted: false },
);

// A column is one group in the reveal. Its label and links count inside it.
const group = inject(megaMenuContentKey, null)?.nextIndex() ?? 0;
let index = 0;
provide(megaMenuColumnKey, { nextIndex: () => index++ });
const style = computed(() => ({ "--mm-g": group }));
</script>

<template>
  <div
    data-slot="mega-menu-column"
    :data-tinted="tinted ? '' : undefined"
    :style="style"
    :class="props.class"
  >
    <MegaMenuReveal
      v-if="label"
      :class="cn('text-muted-foreground mb-2 px-3 text-sm tracking-tight', labelClass)"
    >
      {{ label }}
    </MegaMenuReveal>
    <slot />
  </div>
</template>
