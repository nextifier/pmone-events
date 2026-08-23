<script setup>
import { Button } from "../ui/button";

/**
 * The Add / stepper control on a ticket card. Identical markup used to sit
 * inline in both the entry-ticket layout and the add-on layout of
 * `TicketList.vue`, which is how the `+` button ended up capped in one place and
 * not the other.
 *
 * The parent owns every decision (it knows the ticket); this owns the shape.
 */
defineProps({
  qty: { type: Number, default: 0 },
  /** No headroom left: `max_quantity`, remaining stock, or the other days' hold. */
  atMax: { type: Boolean, default: false },
  /**
   * Nobody may buy more than one, so there is nothing to step through. Add flips
   * straight to Remove rather than showing two arrows that can never move.
   */
  single: { type: Boolean, default: false },
  /** Add is left clickable but dimmed, so a tap can explain what is missing. */
  dimmed: { type: Boolean, default: false },
});

defineEmits(["add", "increase", "decrease"]);

const { t } = useI18n();
</script>

<template>
  <Button
    v-if="!qty"
    size="sm"
    :class="{ 'opacity-60': dimmed }"
    @click="$emit('add')"
  >
    <Icon name="hugeicons:plus-sign" class="size-4 shrink-0" />
    {{ t("tickets.add") }}
  </Button>

  <Button
    v-else-if="single"
    size="sm"
    variant="outline"
    class="text-destructive-foreground"
    @click="$emit('decrease')"
  >
    <Icon name="hugeicons:tick-02" class="size-4 shrink-0" />
    {{ t("tickets.added") }}
  </Button>

  <div v-else class="flex items-center gap-1.5">
    <button
      type="button"
      class="border-border hover:bg-muted focus-visible:ring-ring flex size-8 items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none"
      :aria-label="t('tickets.decreaseQty')"
      @click="$emit('decrease')"
    >
      <Icon name="hugeicons:minus-sign" class="size-4" />
    </button>
    <span
      class="min-w-6 text-center text-sm font-medium tabular-nums"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ qty }}
    </span>
    <button
      type="button"
      class="border-border hover:bg-muted focus-visible:ring-ring flex size-8 items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
      :disabled="atMax"
      :aria-label="t('tickets.increaseQty')"
      @click="$emit('increase')"
    >
      <Icon name="hugeicons:plus-sign" class="size-4" />
    </button>
  </div>
</template>
