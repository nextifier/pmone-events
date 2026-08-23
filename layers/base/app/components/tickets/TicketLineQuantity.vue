<script setup>
import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from "../ui/number-field";
import { Button } from "../ui/button";
import { useTicketCartStore } from "../../stores/ticketCart";
import { lineCapFor, minFor, singleQuantity } from "../../composables/useTicketLine";
import { computed } from "vue";
import { toast } from "vue-sonner";

/**
 * The one quantity control for a cart line, shared by the sticky bar and the
 * checkout summary so the same line cannot behave differently depending on
 * which surface the buyer happens to be looking at.
 *
 * Three things it owns, all of which used to be duplicated or missing:
 *
 * - **The cap.** `lineCapFor` subtracts what this ticket already holds on its
 *   other days, so a day pass cannot take the maximum on Friday and the maximum
 *   again on Saturday and blow past `available` at submit.
 * - **Removal.** There is no separate delete button any more: stepping below the
 *   ticket's minimum removes the line and raises the Undo toast. One control,
 *   one mental model.
 * - **Undo by identity.** The snapshot index comes from `findIndex` over
 *   `cart.items`, never from the render index - `mergedLines` is server-ordered
 *   and filtered once a preview lands, so a render index can point at a
 *   different item entirely and Undo would restore the wrong one.
 */
const props = defineProps({
  /** A row from `cart.mergedLines`, decorated with `ticket` and `title` by the caller. */
  line: { type: Object, required: true },
  /** `false` on read-only surfaces; the quantity still renders, the controls do not. */
  editable: { type: Boolean, default: true },
  /**
   * `inverted` for the sticky bar, which paints `bg-foreground text-background`.
   * The default input styling is a light pill with dark glyphs, so on that
   * surface it renders as a blank white slab with invisible arrows.
   *
   * The fill is `--background` (the contrast colour on this surface) at a low
   * alpha, matching the bar's own chevron toggle. `dark:` is the light-bar case:
   * `--foreground` is cream in the dark theme, and a dark tint reads heavier on
   * cream than a light tint does on near-black, so it takes a lower alpha to
   * land at the same weight.
   */
  tone: { type: String, default: "default" },
});

const { t } = useI18n();
const cart = useTicketCartStore();

const inverted = computed(() => props.tone === "inverted");

const ticket = computed(() => props.line.ticket ?? {});
const sessionId = computed(() => props.line.ticket_session_id ?? null);
const dayId = computed(() => props.line.selected_event_day_id ?? null);

const min = computed(() => minFor(ticket.value));
const cap = computed(() =>
  lineCapFor(ticket.value, cart.items, sessionId.value, dayId.value),
);

/**
 * A ticket capped at one has nothing to step through, so the stepper collapses
 * to a plain remove control rather than two permanently disabled arrows around
 * a number that cannot move.
 */
const isSingle = computed(() => singleQuantity(ticket.value));

function snapshotIndex() {
  return cart.items.findIndex(
    (i) =>
      i.ticket_id === props.line.ticket_id &&
      (i.ticket_session_id ?? null) === sessionId.value &&
      (i.selected_event_day_id ?? null) === dayId.value,
  );
}

function removeLine() {
  const index = snapshotIndex();
  const snapshot = index >= 0 ? { ...cart.items[index] } : null;
  cart.removeItem(props.line.ticket_id, sessionId.value, dayId.value);
  if (!snapshot) return;
  toast(t("tickets.itemRemoved", { title: props.line.title }), {
    action: {
      label: t("tickets.undo"),
      onClick: () => cart.restoreItem(snapshot, index),
    },
  });
}

/**
 * Reka's NumberField is controlled: when it emits a value and the bound
 * `model-value` does not follow, it pushes its own state back and emits AGAIN
 * with the old number. Removal is exactly that case - the line disappears
 * instead of becoming 0 - so the bounce arrived as `setQty(1)` and silently
 * re-added the line the buyer had just deleted (moved to the end of the cart,
 * which is how it first showed up: the rows kept swapping order).
 *
 * One-way latch. The instance is unmounted on the next tick anyway, so the flag
 * only has to outlive the bounce.
 */
let settled = false;

/**
 * Below the ticket's minimum means "I don't want this any more", not "clamp me
 * back up" - a ticket with `min_quantity: 2` has no valid quantity of 1, so the
 * only honest destination is removal.
 */
function onUpdate(next) {
  if (settled) return;
  const n = Number(next);
  if (!Number.isFinite(n) || n < min.value) {
    settled = true;
    removeLine();
    return;
  }
  cart.setQty(props.line.ticket_id, sessionId.value, n, dayId.value);
}
</script>

<template>
  <div v-if="!editable" class="text-sm tabular-nums tracking-tight">
    &times;{{ line.qty }}
  </div>

  <Button
    v-else-if="isSingle"
    type="button"
    variant="ghost"
    size="sm"
    :class="
      inverted
        ? 'text-background/70 hover:text-background hover:bg-background/15'
        : 'text-destructive-foreground hover:bg-destructive/10'
    "
    @click="removeLine"
  >
    {{ t("tickets.remove") }}
  </Button>

  <NumberField
    v-else
    :model-value="line.qty"
    :min="0"
    :max="cap"
    class="w-26 shrink-0"
    @update:model-value="onUpdate"
  >
    <NumberFieldContent
      :class="
        inverted
          ? 'text-background [&_[data-slot=decrement]]:text-background/70 [&_[data-slot=increment]]:text-background/70 [&_[data-slot=decrement]:hover]:text-background [&_[data-slot=increment]:hover]:text-background'
          : ''
      "
    >
      <NumberFieldDecrement :aria-label="t('tickets.decreaseQty')" />
      <NumberFieldInput
        :aria-label="t('tickets.quantity')"
        :class="
          inverted
            ? 'bg-background/10 dark:bg-background/6 focus-visible:border-background/50 focus-visible:ring-background/30 h-9 text-sm pointer-fine:h-8'
            : ''
        "
      />
      <NumberFieldIncrement :aria-label="t('tickets.increaseQty')" />
    </NumberFieldContent>
  </NumberField>
</template>
