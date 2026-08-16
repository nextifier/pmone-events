<template>
  <div class="border-border divide-border divide-y rounded-xl border">
    <div
      v-for="tier in pricing.tiers"
      :key="tier.id"
      class="flex items-baseline justify-between gap-4 px-4 py-3"
    >
      <div class="min-w-0">
        <p class="text-sm font-medium tracking-tight">{{ tier.label }}</p>
        <p v-if="tier.conditions" class="text-muted-foreground text-xs tracking-tight sm:text-sm">
          {{ tier.conditions }}
        </p>
      </div>
      <p class="shrink-0 tracking-tight tabular-nums">
        <span class="font-medium">{{ formatFull(tier.amount) }}</span>
        <span class="text-muted-foreground text-sm">{{ unitLabel(pricing.unit) }}</span>
      </p>
    </div>

    <div
      v-for="extra in extras"
      :key="extra.id"
      class="bg-muted/40 flex items-baseline justify-between gap-4 px-4 py-3"
    >
      <div class="min-w-0">
        <p class="text-sm tracking-tight">{{ extra.label }}</p>
        <p v-if="extra.note" class="text-muted-foreground text-xs tracking-tight sm:text-sm">
          {{ extra.note }}
        </p>
      </div>
      <p class="text-muted-foreground shrink-0 text-sm tracking-tight tabular-nums">
        +{{ formatFull(extra.amount) }}{{ unitLabel(extra.unit) }}
      </p>
    </div>

    <ul v-if="notes.length" class="text-muted-foreground space-y-1.5 px-4 py-3">
      <li
        v-for="note in notes"
        :key="note"
        class="flex gap-x-2 text-xs tracking-tight text-pretty sm:text-sm"
      >
        <Icon name="hugeicons:information-circle" class="mt-0.5 size-3.5 shrink-0" />
        {{ note }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Pricing } from "~/data/types";

const props = defineProps<{ pricing: Pricing }>();

const { formatFull, unitLabel } = usePriceDisplay();

const extras = computed(() =>
  [props.pricing.extraPax, props.pricing.extraBed].filter(
    (extra): extra is NonNullable<typeof extra> => extra !== null,
  ),
);

/**
 * Constraints that are stored as structured fields are worth repeating in the
 * notes list, because that is where a reader looks for "what's the catch".
 */
const notes = computed(() => {
  const out = [...props.pricing.notes];

  if (props.pricing.includedPax) {
    out.unshift(`Sudah termasuk ${props.pricing.includedPax} orang.`);
  }
  if (props.pricing.minPax && !out.some((note) => note.toLowerCase().includes("minimal"))) {
    out.push(`Minimal ${props.pricing.minPax} orang.`);
  }

  return out;
});
</script>
