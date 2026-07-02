<template>
  <div
    class="border-foreground/10 group flex flex-col overflow-hidden rounded-2xl border"
  >
    <button
      type="button"
      :style="{ backgroundColor: hex }"
      :class="[
        'relative flex aspect-[4/5] w-full flex-col justify-between p-4 text-left',
        textOn === 'dark' ? 'text-white' : 'text-black',
      ]"
      :aria-label="`Copy ${hex} to clipboard`"
      @click="handleCopy"
    >
      <span class="text-sm font-medium tracking-tight">
        {{ name }}
      </span>

      <div
        class="flex items-center justify-between gap-2 text-base font-medium tracking-tighter"
      >
        <span class="font-mono">{{ hex }}</span>
        <Icon
          :name="copied ? 'lucide:check' : 'hugeicons:copy-01'"
          class="size-4 shrink-0"
        />
      </div>
    </button>

    <div class="bg-background flex flex-col gap-y-3 p-3 sm:p-4">
      <p class="text-body text-sm !leading-snug tracking-tight text-pretty">
        {{ usage }}
      </p>

      <div class="flex flex-col gap-y-2 text-sm tracking-tight">
        <div class="flex flex-col gap-y-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-x-2">
          <span class="text-muted-foreground font-mono">Hex</span>
          <div class="flex min-w-0 items-center gap-x-1">
            <span class="text-foreground truncate font-mono">{{ hex }}</span>
            <ButtonCopy :text="hex" />
          </div>
        </div>

        <div class="flex flex-col gap-y-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-x-2">
          <span class="text-muted-foreground font-mono">OKLCH</span>
          <div class="flex min-w-0 items-center gap-x-1">
            <span class="text-foreground truncate font-mono">{{ oklch }}</span>
            <ButtonCopy :text="oklch" />
          </div>
        </div>

        <div
          v-if="cssVar"
          class="flex flex-col gap-y-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-x-2"
        >
          <span class="text-muted-foreground font-mono">CSS</span>
          <div class="flex min-w-0 items-center gap-x-1">
            <span class="text-foreground truncate font-mono">{{ cssVar }}</span>
            <ButtonCopy :text="cssVar" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useClipboard } from "@vueuse/core";
import { toast } from "vue-sonner";

const props = defineProps({
  name: { type: String, required: true },
  hex: { type: String, required: true },
  oklch: { type: String, required: true },
  usage: { type: String, required: true },
  cssVar: { type: String, default: "" },
  textOn: {
    type: String,
    default: "dark",
    validator: (v) => ["light", "dark"].includes(v),
  },
});

const { copy, copied } = useClipboard({ copiedDuring: 1500 });

const handleCopy = async () => {
  await copy(props.hex);
  toast.success(`Copied ${props.hex}`);
};
</script>
