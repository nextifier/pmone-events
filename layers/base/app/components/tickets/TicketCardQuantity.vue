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
  /**
   * What the empty-cart button says. The parent knows the price, and "Add" on a
   * free ticket reads like a purchase; it passes "Register" for those.
   */
  addLabel: { type: String, default: "" },
  /**
   * Icon for the empty-cart button. "+" states a cart operation, which is honest
   * for "Add" and nonsense next to "Register" - it reads as "add a register".
   * The parent passes an empty string for the free case and the button carries
   * its verb alone.
   */
  addIcon: { type: String, default: "hugeicons:plus-sign" },
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
    <Icon v-if="addIcon" :name="addIcon" class="size-4 shrink-0" />
    {{ addLabel || t("tickets.add") }}
  </Button>

  <!-- State and action, split. One button reading "Added" behind a tick, in the
       destructive colour, whose click REMOVED the ticket was three signals
       disagreeing: the word and the tick both say the job is done, the colour
       says danger, and the only thing you could do with it was undo the thing
       it was confirming. Nobody taps that on purpose. The chip now states, the
       trash acts, and the trash is the same glyph the cart bar already uses to
       take a line out. -->
  <div v-else-if="single" class="flex items-center gap-1.5">
    <!-- Deliberately unstyled as a control: it is a status, and a filled pill
         next to a real button reads as a second button. Flat text plus the tick
         says "this one is in your cart" without inviting a tap that does
         nothing. The trash beside it is the only thing here that acts. -->
    <span
      class="text-foreground inline-flex items-center gap-1.5 text-sm font-medium tracking-tight"
    >
      <Icon name="hugeicons:tick-02" class="size-4 shrink-0" />
      {{ t("tickets.added") }}
    </span>
    <Button
      type="button"
      size="icon"
      variant="ghost"
      class="text-muted-foreground hover:text-destructive-foreground hover:bg-destructive/10"
      :aria-label="t('tickets.remove')"
      v-tippy="t('tickets.remove')"
      @click="$emit('decrease')"
    >
      <!-- Same glyph and same sizing as the cart bar's own trash, so removing a
           line looks like one action wherever the buyer meets it. -->
      <Icon name="hugeicons:delete-01" class="size-4 shrink-0 sm:size-5" />
    </Button>
  </div>

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
