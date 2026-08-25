<script setup>
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Field, FieldLabel } from "../ui/field";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { BlurImage } from "../ui/blur-image";
import TicketLineQuantity from "./TicketLineQuantity.vue";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { useTicketCartStore } from "../../stores/ticketCart";
import { computed, ref, watch } from "vue";
import { useDebounceFn, useTimeoutFn } from "@vueuse/core";

const props = defineProps({
  // Map of ticket_id -> ticket object, so we can render posters/days/limits.
  ticketsById: { type: Object, default: () => ({}) },
  // Allow editing quantities directly from the summary (checkout uses this).
  editable: { type: Boolean, default: false },
  /**
   * Hold the last cart on screen instead of following the store into empty.
   * Checkout turns this on the moment it starts handing off to the receipt or
   * the payment gateway: the order is placed, the store is cleared, and the
   * browser keeps painting this page until the next document loads.
   */
  frozen: { type: Boolean, default: false },
});

const emit = defineEmits(["promo-applied", "promo-cleared"]);

const { t, te } = useI18n();
const cart = useTicketCartStore();

const ticketFor = (id) => props.ticketsById[id] ?? null;

/**
 * The store merges local quantity with server pricing; this only decorates each
 * line with what needs the ticket record: title fallback, poster, and the
 * day/session sub-label. When the preview has not landed yet the store cannot
 * know a price, so fall back to the ticket's own.
 */
const liveLines = computed(() =>
  cart.mergedLines.map((l) => {
    const ticket = ticketForLine(ticketFor(l.ticket_id), l);
    const unit = l.unit || Number(ticket?.price) || 0;
    return {
      ...l,
      ticket,
      unit,
      subtotal: l.subtotal || unit * l.qty,
      title: l.title || ticket?.title || t("tickets.ticket"),
      subLabel:
        cartLineSubLabel(ticket, l.item) ||
        (lineMissingDay(ticket, l.item) ? t("tickets.dayMissing") : ""),
      missingDay: lineMissingDay(ticket, l.item),
    };
  }),
);

const anyPending = computed(() => cart.pricingPending);
const liveSubtotal = computed(() =>
  cart.previewLines?.length
    ? cart.displaySubtotal
    : liveLines.value.reduce((sum, l) => sum + l.subtotal, 0),
);
const liveDiscount = computed(() => cart.displayDiscount);
const liveTotal = computed(() =>
  Math.max(0, liveSubtotal.value - liveDiscount.value),
);

/**
 * The last cart worth showing. Kept up to date while there is one, so the
 * freeze has something to fall back on the instant the store empties.
 */
const snapshot = ref(null);
watch(
  liveLines,
  (next) => {
    if (!next.length) return;
    snapshot.value = {
      lines: next,
      subtotal: liveSubtotal.value,
      discount: liveDiscount.value,
      total: liveTotal.value,
    };
  },
  { immediate: true },
);

const showingSnapshot = computed(
  () => props.frozen && !liveLines.value.length && !!snapshot.value,
);

// Everything below - and the whole template - reads these, so the freeze is one
// decision made in one place rather than a condition sprinkled through the markup.
const lines = computed(() =>
  showingSnapshot.value ? snapshot.value.lines : liveLines.value,
);
const subtotal = computed(() =>
  showingSnapshot.value ? snapshot.value.subtotal : liveSubtotal.value,
);
const discount = computed(() =>
  showingSnapshot.value ? snapshot.value.discount : liveDiscount.value,
);
const total = computed(() =>
  showingSnapshot.value ? snapshot.value.total : liveTotal.value,
);

/** A snapshot is a picture of a placed order; nothing in it is still editable. */
const linesEditable = computed(() => props.editable && !showingSnapshot.value);

/**
 * What this line would have cost at the ticket's full price. `original_price` is
 * sent only while the live phase is actually cheaper, so a line at the normal
 * price has nothing to strike through and returns 0.
 */
const originalSubtotal = (line) => {
  const original = Number(line.ticket?.original_price);
  if (!Number.isFinite(original) || original <= 0) return 0;

  const full = original * line.qty;
  return full > line.subtotal ? full : 0;
};

/**
 * The same saving stated once for the whole cart. Lines already at full price
 * contribute their own subtotal, so a mixed cart still adds up to a real number
 * rather than to the discounted lines alone.
 */
const originalTotal = computed(() => {
  const full = lines.value.reduce(
    (sum, line) => sum + (originalSubtotal(line) || line.subtotal),
    0,
  );

  return full > total.value ? full : 0;
});

// --- Promo code ---
// Collapsed by default: a visible empty coupon field on a checkout page sends
// buyers off to hunt for a code, and many do not come back.
const promoOpen = ref(false);
const promoInput = ref("");
const appliedPromo = ref("");
const promoApplying = ref(false);
const promoError = ref("");

const { start: startPromoErrorTimer, stop: stopPromoErrorTimer } = useTimeoutFn(
  () => {
    promoError.value = "";
  },
  6000,
  { immediate: false },
);

function showPromoError(message) {
  promoError.value = message;
  stopPromoErrorTimer();
  startPromoErrorTimer();
}

/** Translated message for a backend error code, falling back to the backend's own text. */
function promoMessage(info) {
  const key = promoErrorKey(info?.error_code);
  if (key && te(key)) return t(key);
  return info?.message || t("tickets.promoError");
}

async function applyPromo() {
  // Uppercase once, here. The store re-sends `appliedPromo` on every cart change,
  // so a lowercase apply followed by a quantity tap used to re-send a different
  // string than the one that was accepted.
  const code = promoInput.value?.trim().toUpperCase();
  if (!code) return;
  promoInput.value = code;
  promoApplying.value = true;
  promoError.value = "";
  stopPromoErrorTimer();
  try {
    await cart.fetchPreview({ promoCode: code });
    if (cart.promoInfo?.error_code) {
      // Invalid / not applicable: surface the reason and revert to plain pricing.
      showPromoError(promoMessage(cart.promoInfo));
      appliedPromo.value = "";
      await cart.fetchPreview();
    } else {
      appliedPromo.value = code;
      emit("promo-applied", appliedPromo.value);
    }
  } catch {
    showPromoError(t("tickets.promoError"));
  } finally {
    promoApplying.value = false;
  }
}

function removePromo() {
  appliedPromo.value = "";
  promoInput.value = "";
  promoError.value = "";
  stopPromoErrorTimer();
  cart.fetchPreview();
  emit("promo-cleared");
}

// Typing is an attempt at a new code; the previous verdict no longer applies.
watch(promoInput, () => {
  if (promoError.value) {
    promoError.value = "";
    stopPromoErrorTimer();
  }
});

// Re-price whenever the cart changes. Debounced because the optimistic quantity
// already covers the gap, so a burst of taps should cost one request, not five.
const repriceDebounced = useDebounceFn(() => {
  if (cart.isEmpty) return;
  cart.fetchPreview({ promoCode: appliedPromo.value || null }).then(() => {
    // Re-check rather than blanket-clear: a MIN_PURCHASE_NOT_MET that becomes
    // true again after a quantity drop genuinely needs to be shown again.
    if (appliedPromo.value && cart.promoInfo?.error_code) {
      showPromoError(promoMessage(cart.promoInfo));
      appliedPromo.value = "";
      emit("promo-cleared");
    }
  });
}, 250);

watch(
  () =>
    cart.items
      .map(
        (i) =>
          `${i.ticket_id}:${i.ticket_session_id}:${i.selected_event_day_id}:${i.qty}`,
      )
      .join(","),
  () => {
    promoError.value = "";
    stopPromoErrorTimer();
    repriceDebounced();
  },
);

defineExpose({ appliedPromo });
</script>

<template>
  <div class="space-y-4">
    <!-- The same Empty the ticket list uses for its own nothing-to-show states,
         so an empty panel looks like a considered state rather than a sentence
         that failed to load. Header only: there is nothing to explain and no
         action to offer here - the page around it already owns the way back. -->
    <Empty v-if="!lines.length" class="py-4">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon name="hugeicons:shopping-cart-01" />
        </EmptyMedia>
        <EmptyTitle>{{ t("tickets.emptyCartTitle") }}</EmptyTitle>
      </EmptyHeader>
    </Empty>

    <ul v-else class="space-y-4">
      <li
        v-for="line in lines"
        :key="line.key"
        class="flex items-center gap-2 text-sm tracking-tight sm:gap-3"
      >
        <div
          v-if="posterSrc(line.ticket)"
          class="bg-muted outline-inside size-14 shrink-0 overflow-hidden rounded-lg"
        >
          <BlurImage
            :src="posterSrc(line.ticket)"
            :lqip="line.ticket?.poster?.lqip"
            alt=""
            image-class="object-cover"
          />
        </div>

        <div class="min-w-0 flex-1">
          <!-- Two columns, each keeping its own rhythm, centred against each
               other and against the poster. A grid was tried here so that the
               name/price and date/control pairs would share rows exactly - but
               forcing shared rows means the taller cell sets the height for
               both, which pushed the day and date away from the ticket name and
               left the price almost touching the control.

               The "2 x Rp350.000" line this replaces carried one fact the row did
               not already state - the unit price - and one it stated twice: the
               quantity, 40px from the stepper that owns it. At quantity 1 it read
               "1 x Rp350.000" beside "Rp350.000", two identical numbers asking to
               be compared. The bar has never shown a unit price and nobody has
               missed it. -->
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="min-w-0 flex-1 space-y-0.5">
              <p class="text-foreground font-medium">{{ line.title }}</p>
              <p
                v-if="line.subLabel"
                class="text-sm leading-snug tracking-tight"
                :class="
                  line.missingDay
                    ? 'text-destructive-foreground'
                    : 'text-muted-foreground'
                "
              >
                {{ line.subLabel }}
              </p>
              <!-- No cap or stock note here. This is a review surface: the row
                   already shows the quantity with no control beside it, so the
                   limit is legible in the absence of one. That sentence belongs
                   where the buyer can still act on it, beside the Add button on
                   the ticket card. -->
            </div>

            <div class="flex shrink-0 flex-col items-end gap-1.5">
              <!-- Struck price FIRST, payable price on the trailing edge. That
                   edge is the whole point of a right-aligned price column: put
                   the strike there instead and the number people actually owe
                   shifts left by the width of the strike, so a discounted line
                   stops lining up with an undiscounted one and with the total.
                   `flex-nowrap`, because if this pair ever wrapped the struck
                   price would take the first line and the real one would drop
                   beneath it. -->
              <div class="flex flex-nowrap items-baseline justify-end gap-x-2">
                <span
                  v-if="originalSubtotal(line)"
                  class="text-destructive-foreground min-w-0 truncate text-sm tracking-tight tabular-nums line-through"
                >
                  {{ fmtIdr(originalSubtotal(line)) }}
                </span>
                <span
                  class="shrink-0 font-medium tabular-nums tracking-tight transition-opacity"
                  :class="{ 'opacity-60': line.pending }"
                  :aria-busy="line.pending || undefined"
                >
                  {{ fmtIdr(line.subtotal) }}
                </span>
              </div>
              <!-- Same control the sticky bar uses, so a line cannot behave one
                   way in the aside and another in the bar. Rendered even when
                   read-only: it falls back to a plain "x2", and dropping it
                   entirely left a read-only summary with no quantity at all -
                   the number used to come from the "2 x Rp350.000" line that is
                   now gone. -->
              <TicketLineQuantity :line="line" :editable="linesEditable" />
            </div>
          </div>
        </div>
      </li>
    </ul>

    <div v-if="lines.length" class="space-y-3 border-t pt-3">
      <div
        v-if="cart.accessCode"
        class="text-success-foreground flex items-center gap-1.5 text-sm tracking-tight"
      >
        <Icon name="hugeicons:ticket-star" class="size-4 shrink-0" />
        <span>{{ t("tickets.accessApplied", { code: cart.accessCode }) }}</span>
      </div>

      <!-- Only once a discount has moved it. Without one, Subtotal and Total
           are the same number printed twice, one line apart. -->
      <div v-if="discount > 0" class="flex items-baseline justify-between">
        <span class="text-muted-foreground text-sm tracking-tight">
          {{ t("tickets.subtotal") }}
        </span>
        <span class="text-muted-foreground text-sm tabular-nums tracking-tight">
          {{ fmtIdr(subtotal) }}
        </span>
      </div>

      <div
        v-if="discount > 0"
        class="text-success-foreground flex items-baseline justify-between transition-opacity"
        :class="{ 'opacity-60': anyPending }"
        :aria-busy="anyPending || undefined"
      >
        <span class="text-sm tracking-tight">{{ t("tickets.discount") }}</span>
        <span class="text-sm font-medium tabular-nums tracking-tight">
          -{{ fmtIdr(discount) }}
        </span>
      </div>

      <!-- The rule above Total only earns its place when something sits between
           it and the list's own rule. With no breakdown the two ran 12px apart
           with nothing in between. -->
      <div
        class="flex items-baseline justify-between transition-opacity"
        :class="[
          { 'opacity-60': anyPending },
          discount > 0 || cart.accessCode ? 'border-t pt-3' : '',
        ]"
        :aria-busy="anyPending || undefined"
      >
        <span class="text-sm font-medium tracking-tight">
          {{ t("tickets.total") }}
        </span>
        <div class="flex flex-nowrap items-baseline justify-end gap-x-2">
          <!-- The whole cart's full price, ahead of the payable one for the same
               reason as the lines above: the trailing edge belongs to the number
               being charged, so every amount in this column lines up. -->
          <span
            v-if="originalTotal"
            class="text-destructive-foreground text-sm tracking-tight tabular-nums line-through"
          >
            {{ fmtIdr(originalTotal) }}
          </span>
          <span
            class="text-base font-semibold tabular-nums tracking-tight"
            aria-live="polite"
            aria-atomic="true"
          >
            {{ fmtIdr(total) }}
          </span>
        </div>
      </div>

      <Collapsible v-model:open="promoOpen">
        <!-- An imperative, not a question. "Have a promo code?" told the buyer
             nothing about what to do if the answer was yes; the plus/minus and
             the control-weight type are what make it read as pressable. -->
        <CollapsibleTrigger v-if="!appliedPromo" as-child>
          <Button variant="ghost" size="sm" class="-ml-3 gap-1.5">
            <Icon
              :name="promoOpen ? 'hugeicons:minus-sign' : 'hugeicons:plus-sign'"
              class="size-4 shrink-0"
            />
            {{ t("tickets.promoDisclose") }}
          </Button>
        </CollapsibleTrigger>

        <p
          v-else
          class="bg-success/10 text-success-foreground flex items-start gap-1.5 rounded-md px-3 py-2 text-sm tracking-tight"
          role="status"
        >
          <Icon name="lucide:check" class="mt-0.5 size-4 shrink-0" />
          <span class="flex-1">
            {{ t("tickets.promoApplied", { code: appliedPromo }) }}
          </span>
          <Button
            variant="link"
            size="xs"
            class="text-success-foreground -my-1 h-auto shrink-0 px-0"
            @click="removePromo"
          >
            {{ t("tickets.remove") }}
          </Button>
        </p>

        <CollapsibleContent v-if="!appliedPromo" class="mt-3 space-y-2">
          <div class="flex items-end gap-2">
            <Field class="flex-1">
              <FieldLabel for="promo_code">
                {{ t("tickets.promoLabel") }}
              </FieldLabel>
              <Input
                id="promo_code"
                v-model="promoInput"
                maxlength="60"
                autocapitalize="characters"
                autocomplete="off"
                spellcheck="false"
                :disabled="promoApplying"
                @keydown.enter.prevent="
                  promoInput?.trim() && !promoApplying && applyPromo()
                "
              />
            </Field>
            <Button
              type="button"
              variant="outline"
              class="h-(--cn-input-h) shrink-0"
              :loading="promoApplying"
              :disabled="!promoInput?.trim() || promoApplying"
              @click="applyPromo"
            >
              {{ t("tickets.apply") }}
            </Button>
          </div>

          <p
            v-if="promoError"
            role="alert"
            class="bg-destructive/10 text-destructive-foreground flex items-start gap-1.5 rounded-md px-3 py-2 text-sm tracking-tight"
          >
            <Icon
              name="hugeicons:alert-circle"
              class="mt-0.5 size-4 shrink-0"
            />
            <span>{{ promoError }}</span>
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  </div>
</template>
