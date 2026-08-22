<script setup>
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Field, FieldLabel } from "../ui/field";
import { BlurImage } from "../ui/blur-image";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { useTicketCartStore } from "../../stores/ticketCart";
import { computed, ref, watch } from "vue";
import { useDebounceFn, useTimeoutFn } from "@vueuse/core";
import { toast } from "vue-sonner";

const props = defineProps({
  // Map of ticket_id -> ticket object, so we can render posters/days/limits.
  ticketsById: { type: Object, default: () => ({}) },
  // Allow editing quantities directly from the summary (checkout uses this).
  editable: { type: Boolean, default: false },
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
const lines = computed(() =>
  cart.mergedLines.map((l) => {
    const ticket = ticketFor(l.ticket_id);
    const unit = l.unit || Number(ticket?.price) || 0;
    return {
      ...l,
      ticket,
      unit,
      subtotal: l.subtotal || unit * l.qty,
      title: l.title || ticket?.title || t("tickets.ticket"),
      subLabel: cartLineSubLabel(ticket, l.item),
    };
  }),
);

const anyPending = computed(() => cart.pricingPending);
const subtotal = computed(() =>
  cart.previewLines?.length
    ? cart.displaySubtotal
    : lines.value.reduce((sum, l) => sum + l.subtotal, 0),
);
const discount = computed(() => cart.displayDiscount);
const total = computed(() => Math.max(0, subtotal.value - discount.value));

// --- Quantity limits (shared with the ticket listing, so both agree) ---
const lineMax = (line) => maxFor(line.ticket ?? {});
const lineMin = (line) => minFor(line.ticket ?? {});
const atMax = (line) => line.qty >= lineMax(line);
const lowStock = (line) => {
  const available = line.ticket?.available;
  return available != null && available > 0 && available <= 10;
};

function setQty(line, qty) {
  cart.setQty(
    line.ticket_id,
    line.ticket_session_id,
    qty,
    line.selected_event_day_id,
  );
}

function removeLine(line, index) {
  const snapshot = { ...cart.items[index] };
  cart.removeItem(
    line.ticket_id,
    line.ticket_session_id,
    line.selected_event_day_id,
  );
  toast(t("tickets.itemRemoved", { title: line.title }), {
    action: {
      label: t("tickets.undo"),
      onClick: () => cart.restoreItem(snapshot, index),
    },
  });
}

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
    <div
      v-if="!lines.length"
      class="text-muted-foreground text-sm tracking-tight"
    >
      {{ t("tickets.emptyCart") }}
    </div>

    <ul v-else class="space-y-4">
      <li
        v-for="(line, index) in lines"
        :key="line.key"
        class="flex items-start gap-3 text-sm tracking-tight"
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
          <div class="flex items-start gap-2">
            <div class="min-w-0 flex-1 space-y-0.5">
              <p class="text-foreground font-medium">{{ line.title }}</p>
              <p
                v-if="line.subLabel"
                class="text-muted-foreground text-sm tracking-tight"
              >
                {{ line.subLabel }}
              </p>
            </div>

            <span
              class="shrink-0 font-medium tabular-nums tracking-tight transition-opacity"
              :class="{ 'opacity-60': line.pending }"
              :aria-busy="line.pending || undefined"
            >
              {{ fmtIdr(line.subtotal) }}
            </span>

            <Button
              v-if="editable"
              type="button"
              variant="ghost"
              size="iconSm"
              class="text-muted-foreground hover:text-destructive-foreground focus-visible:text-destructive-foreground -mt-1 -mr-1 shrink-0"
              :aria-label="t('tickets.removeItem')"
              @click="removeLine(line, index)"
            >
              <Icon name="hugeicons:cancel-01" class="size-4" />
            </Button>
          </div>

          <div class="mt-2 flex items-center justify-between gap-3">
            <!-- gap-2 is load-bearing: every Button carries a 44px coarse-pointer
                 hit area, so at size-9 the targets tile edge to edge. Tighter and
                 they overlap, and the later element wins the hit test - which is
                 how tapping the right edge of "-" used to increment. -->
            <div v-if="editable" class="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                :disabled="line.qty <= lineMin(line)"
                :aria-label="t('tickets.decreaseQty')"
                @click="setQty(line, line.qty - 1)"
              >
                <Icon name="hugeicons:minus-sign" class="size-4" />
              </Button>
              <span
                class="min-w-6 text-center tabular-nums"
                aria-live="polite"
                aria-atomic="true"
                >{{ line.qty }}</span
              >
              <Button
                type="button"
                variant="outline"
                size="icon"
                :disabled="atMax(line)"
                :aria-label="t('tickets.increaseQty')"
                @click="setQty(line, line.qty + 1)"
              >
                <Icon name="hugeicons:plus-sign" class="size-4" />
              </Button>
            </div>

            <!-- A price, so never text-xs (STYLE_GUIDE: no text-xs on values). -->
            <span
              class="text-muted-foreground ml-auto text-sm tabular-nums tracking-tight"
            >
              {{ line.qty }} &times; {{ fmtIdr(line.unit) }}
            </span>
          </div>

          <p
            v-if="editable && atMax(line)"
            class="text-muted-foreground mt-1.5 text-sm tracking-tight"
          >
            {{ t("tickets.maxPerOrder", { count: lineMax(line) }) }}
          </p>
          <p
            v-else-if="editable && lowStock(line)"
            class="text-muted-foreground mt-1.5 text-sm tracking-tight"
          >
            {{ t("tickets.spotsLeft", { count: line.ticket.available }) }}
          </p>
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

      <div class="flex items-baseline justify-between">
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

      <div
        class="flex items-baseline justify-between border-t pt-3 transition-opacity"
        :class="{ 'opacity-60': anyPending }"
        :aria-busy="anyPending || undefined"
      >
        <span class="text-sm font-medium tracking-tight">
          {{ t("tickets.total") }}
        </span>
        <span
          class="text-base font-semibold tabular-nums tracking-tight"
          aria-live="polite"
          aria-atomic="true"
        >
          {{ fmtIdr(total) }}
        </span>
      </div>

      <Collapsible v-model:open="promoOpen">
        <!-- An imperative, not a question. "Have a promo code?" told the buyer
             nothing about what to do if the answer was yes; the plus/minus and
             the control-weight type are what make it read as pressable. -->
        <CollapsibleTrigger
          v-if="!appliedPromo"
          class="text-foreground hover:text-foreground/80 focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-sm text-sm font-medium tracking-tight transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <Icon
            :name="promoOpen ? 'hugeicons:minus-sign' : 'hugeicons:plus-sign'"
            class="size-4 shrink-0"
          />
          {{ t("tickets.promoDisclose") }}
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
          <button
            type="button"
            class="focus-visible:ring-ring shrink-0 rounded-sm underline underline-offset-2 focus-visible:ring-2 focus-visible:outline-none"
            @click="removePromo"
          >
            {{ t("tickets.remove") }}
          </button>
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
