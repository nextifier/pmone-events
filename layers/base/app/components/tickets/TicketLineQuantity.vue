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

  <!-- An icon, not the word "Remove". Stacked under a struck-through price in
       the same destructive red, the word read as a second piece of pricing text
       rather than as the one control on the row. The trash is the same glyph the
       cart bar and the ticket card already use to take a line out, so removing
       looks like one action wherever the buyer meets it.

       `-me-1.5` cancels the button's own padding so the GLYPH, not its box, sits
       on the same right edge as the price above it.

       The painted box is `size-7` while the tap target stays full size through
       `after:-inset-1.5`, which is invisible but hit-tests. Those are two
       different jobs: at the button's own 36px the hover background reached up
       over the price on the line above, and the box also set the height of the
       whole row, pushing the day and date a third of a line off the ticket name.
       Shrinking what is DRAWN fixes both without taking anything off the target.

       Destructive in BOTH tones, not just on the light surface. The cart bar
       paints `bg-foreground` and remaps `--destructive-foreground` to a red that
       reads on it, so the token is already correct there - the old
       `text-background/70` opted out of that and came back grey, sitting next to
       the bar's own red clear button as if the two did different things. -->
  <Button
    v-else-if="isSingle"
    type="button"
    variant="ghost"
    size="icon"
    class="relative size-7 -me-1.5 after:absolute after:-inset-1.5"
    :class="
      inverted
        ? 'text-destructive-foreground hover:bg-destructive/20'
        : 'text-destructive-foreground hover:bg-destructive/10'
    "
    :aria-label="t('tickets.remove')"
    v-tippy="t('tickets.remove')"
    @click="removeLine"
  >
    <Icon name="hugeicons:delete-01" class="size-4 shrink-0 sm:size-5" />
  </Button>

  <NumberField
    v-else
    :model-value="line.qty"
    :min="0"
    :max="cap"
    class="w-24 shrink-0 pointer-fine:w-20"
    @update:model-value="onUpdate"
  >
    <!-- The stepper's bulk is its arrows: the ui component pads them 12px
         around a 16px glyph, so each button is 40x40 and the control reads
         taller than the 36px chevron and trash beside it. Tightened on a fine
         pointer only - `pointer-fine:`, not `sm:`, because the input method
         decides how big a target has to be, not the viewport.
         On touch they come down to 36px rather than 32: that is the full height
         of the field and the same size as the chevron and trash in the row
         below, so the bar has one target size throughout. -->
    <NumberFieldContent
      class="[&_[data-slot=decrement]]:p-2.5 [&_[data-slot=increment]]:p-2.5 pointer-fine:[&_[data-slot=decrement]]:p-2 pointer-fine:[&_[data-slot=increment]]:p-2"
      :class="
        inverted
          ? 'text-background [&_[data-slot=decrement]]:text-background/70 [&_[data-slot=increment]]:text-background/70 [&_[data-slot=decrement]:hover]:text-background [&_[data-slot=increment]:hover]:text-background'
          : ''
      "
    >
      <NumberFieldDecrement :aria-label="t('tickets.decreaseQty')" />
      <!-- Height stated here, not left to the tone: `.cn-input` sizes the
           checkout aside's field on its own (36px) while the bar's was 32, so
           the same control was two different heights on one page. -->
      <!-- `text-base` on touch, not `text-sm`: iOS zooms the whole page in when
           a focused input is under 16px, and this one IS focusable - a
           deliberate tap on the number is how a buyer types a quantity.
           `pointer-fine:` rather than `sm:`, because the input method decides
           this, not the viewport. Matches `.cn-input`'s own scale. -->
      <NumberFieldInput
        :aria-label="t('tickets.quantity')"
        class="h-8 text-base pointer-fine:text-sm"
        :class="
          inverted
            ? 'bg-background/10 dark:bg-background/6 focus-visible:border-background/50 focus-visible:ring-background/30'
            : ''
        "
      />
      <NumberFieldIncrement :aria-label="t('tickets.increaseQty')" />
    </NumberFieldContent>
  </NumberField>
</template>
