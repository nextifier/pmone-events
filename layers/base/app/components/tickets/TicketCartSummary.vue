<script setup>
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useTicketCartStore } from "../../stores/ticketCart";
import { computed, ref, watch } from "vue";

const props = defineProps({
  // Map of ticket_id -> ticket object, so we can render titles/sessions.
  ticketsById: { type: Object, default: () => ({}) },
  // Allow editing quantities directly from the summary (checkout uses this).
  editable: { type: Boolean, default: false },
});

const emit = defineEmits(["promo-applied", "promo-cleared"]);

const { t } = useI18n();
const cart = useTicketCartStore();

const fmtRupiah = (n) => new Intl.NumberFormat("id-ID").format(Number(n) || 0);

function sessionLabel(item) {
  const ticket = props.ticketsById[item.ticket_id];
  if (!item.ticket_session_id || !ticket?.sessions?.length) return "";
  const s = ticket.sessions.find((x) => x.id === item.ticket_session_id);
  return s?.label || "";
}

function dayLabel(item) {
  const ticket = props.ticketsById[item.ticket_id];
  if (!item.selected_event_day_id || !ticket?.valid_days?.length) return "";
  const d = ticket.valid_days.find((x) => x.id === item.selected_event_day_id);
  return d?.label || "";
}

// Display lines: prefer the priced preview from the backend; otherwise fall
// back to the raw cart items so the summary still renders (titles only).
const lines = computed(() => {
  if (cart.previewLines?.length) {
    return cart.previewLines.map((l, idx) => {
      // previewLines come back in cart-item order, so match by index to keep
      // per-variant (session/day) lines of the same ticket distinct.
      const cartItem = cart.items[idx] ?? cart.items.find((i) => i.ticket_id === l.ticket_id);
      return {
        ticket_id: l.ticket_id,
        title: l.title || props.ticketsById[l.ticket_id]?.title || "Ticket",
        qty: l.quantity,
        unit: Number(l.unit_price) || 0,
        subtotal: Number(l.subtotal) || 0,
        phaseLabel: l.phase_label || "",
        session: cartItem ? sessionLabel(cartItem) : "",
        ticket_session_id: cartItem?.ticket_session_id ?? null,
        day: cartItem ? dayLabel(cartItem) : "",
        selected_event_day_id: cartItem?.selected_event_day_id ?? null,
      };
    });
  }
  return cart.items.map((i) => {
    const ticket = props.ticketsById[i.ticket_id];
    return {
      ticket_id: i.ticket_id,
      title: ticket?.title || "Ticket",
      qty: Number(i.qty) || 0,
      unit: Number(ticket?.price) || 0,
      subtotal: (Number(ticket?.price) || 0) * (Number(i.qty) || 0),
      phaseLabel: ticket?.phase_label || "",
      session: sessionLabel(i),
      ticket_session_id: i.ticket_session_id ?? null,
      day: dayLabel(i),
      selected_event_day_id: i.selected_event_day_id ?? null,
    };
  });
});

const subtotal = computed(() => {
  if (cart.previewLines?.length) return cart.cachedSubtotal;
  return lines.value.reduce((s, l) => s + l.subtotal, 0);
});

const discount = computed(() => Number(cart.cachedDiscount) || 0);
// total = subtotal - discount (computing directly avoids a 0-is-falsy bug when a
// 100%-off promo makes the cached total legitimately zero).
const total = computed(() => Math.max(0, subtotal.value - discount.value));

// --- Promo code (informational; the authoritative discount is applied at
// order creation). We re-run /preview with the code so the backend can echo a
// validated subtotal if it supports promo on preview. ---
const promoInput = ref("");
const appliedPromo = ref("");
const promoApplying = ref(false);
const promoError = ref("");

async function applyPromo() {
  const code = promoInput.value?.trim();
  if (!code) return;
  promoApplying.value = true;
  promoError.value = "";
  try {
    await cart.fetchPreview({ promoCode: code });
    if (cart.promoInfo?.error_code) {
      // Invalid / not applicable: surface the reason and revert to plain pricing.
      promoError.value = cart.promoInfo.message || t("tickets.promoError");
      appliedPromo.value = "";
      await cart.fetchPreview();
    } else {
      appliedPromo.value = code.toUpperCase();
      emit("promo-applied", appliedPromo.value);
    }
  } catch {
    promoError.value = t("tickets.promoError");
  } finally {
    promoApplying.value = false;
  }
}

function removePromo() {
  appliedPromo.value = "";
  promoInput.value = "";
  promoError.value = "";
  cart.fetchPreview();
  emit("promo-cleared");
}

// Re-price whenever the cart changes. The displayed lines + subtotal come from
// the server preview, so this MUST re-run on every quantity / removal change
// (not only when a promo is applied) or the editable summary shows stale qtys.
watch(
  () => cart.items.map((i) => `${i.ticket_id}:${i.ticket_session_id}:${i.selected_event_day_id}:${i.qty}`).join(","),
  () => {
    if (cart.isEmpty) return;
    cart.fetchPreview({ promoCode: appliedPromo.value || null });
  }
);

defineExpose({ appliedPromo });
</script>

<template>
  <div class="space-y-4">
    <div v-if="!lines.length" class="text-muted-foreground text-sm tracking-tight">
      {{ t("tickets.emptyCart") }}
    </div>

    <ul v-else class="space-y-3">
      <li
        v-for="line in lines"
        :key="`${line.ticket_id}:${line.ticket_session_id}:${line.selected_event_day_id}`"
        class="flex items-start justify-between gap-3 text-sm tracking-tight"
      >
        <div class="min-w-0 space-y-0.5">
          <p class="text-foreground font-medium">{{ line.title }}</p>
          <p v-if="line.day" class="text-muted-foreground text-xs tracking-tight sm:text-sm">
            {{ line.day }}
          </p>
          <p v-if="line.session" class="text-muted-foreground text-xs tracking-tight sm:text-sm">
            {{ line.session }}
          </p>
          <div class="text-muted-foreground flex items-center gap-2 text-xs tracking-tight sm:text-sm">
            <template v-if="editable">
              <div class="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="iconSm"
                  class="size-6 rounded-md"
                  :disabled="line.qty <= 1"
                  :aria-label="t('tickets.decreaseQty')"
                  @click="cart.setQty(line.ticket_id, line.ticket_session_id, line.qty - 1, line.selected_event_day_id)"
                >
                  <Icon name="hugeicons:minus-sign" class="size-3.5" />
                </Button>
                <span class="min-w-5 text-center tabular-nums">{{ line.qty }}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="iconSm"
                  class="size-6 rounded-md"
                  :aria-label="t('tickets.increaseQty')"
                  @click="cart.setQty(line.ticket_id, line.ticket_session_id, line.qty + 1, line.selected_event_day_id)"
                >
                  <Icon name="hugeicons:plus-sign" class="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="iconSm"
                  class="text-muted-foreground hover:text-destructive-foreground ml-1 size-6"
                  :aria-label="t('tickets.removeItem')"
                  @click="cart.removeItem(line.ticket_id, line.ticket_session_id, line.selected_event_day_id)"
                >
                  <Icon name="hugeicons:delete-02" class="size-4" />
                </Button>
              </div>
            </template>
            <template v-else>
              <span>{{ line.qty }} × Rp{{ fmtRupiah(line.unit) }}</span>
            </template>
          </div>
        </div>
        <span class="shrink-0 font-medium tabular-nums tracking-tight">
          Rp{{ fmtRupiah(line.subtotal) }}
        </span>
      </li>
    </ul>

    <div v-if="lines.length" class="space-y-3 border-t pt-3">
      <div class="space-y-2">
        <div class="flex gap-2">
          <Input
            v-model="promoInput"
            :placeholder="t('tickets.promoPlaceholder')"
            class="flex-1 uppercase"
            maxlength="60"
            :disabled="promoApplying || !!appliedPromo"
            @keydown.enter.prevent="!appliedPromo && promoInput?.trim() && !promoApplying && applyPromo()"
          />
          <Button
            v-if="!appliedPromo"
            type="button"
            variant="outline"
            :disabled="!promoInput?.trim() || promoApplying"
            @click="applyPromo"
          >
            <Icon v-if="promoApplying" name="svg-spinners:180-ring" class="size-4" />
            {{ t("tickets.apply") }}
          </Button>
          <Button v-else type="button" variant="outline" @click="removePromo">
            {{ t("tickets.remove") }}
          </Button>
        </div>
        <p
          v-if="appliedPromo"
          class="bg-success/10 text-success-foreground flex items-start gap-1.5 rounded-md px-3 py-2 text-xs tracking-tight sm:text-sm"
        >
          <Icon name="lucide:check" class="mt-0.5 size-4 shrink-0" />
          <span>{{ t("tickets.promoApplied", { code: appliedPromo }) }}</span>
        </p>
        <p
          v-if="promoError"
          role="alert"
          class="bg-destructive/10 text-destructive-foreground flex items-start gap-1.5 rounded-md px-3 py-2 text-xs tracking-tight sm:text-sm"
        >
          <Icon name="hugeicons:alert-circle" class="mt-0.5 size-4 shrink-0" />
          <span>{{ promoError }}</span>
        </p>
      </div>

      <div
        v-if="cart.accessCode"
        class="text-success-foreground flex items-center gap-1.5 border-t pt-3 text-xs tracking-tight sm:text-sm"
      >
        <Icon name="hugeicons:ticket-star" class="size-4 shrink-0" />
        <span>{{ t("tickets.accessApplied", { code: cart.accessCode }) }}</span>
      </div>

      <div
        class="flex items-baseline justify-between pt-3"
        :class="{ 'border-t': !cart.accessCode }"
      >
        <span class="text-sm tracking-tight">{{ t("tickets.subtotal") }}</span>
        <span
          class="tabular-nums tracking-tight"
          :class="discount > 0 ? 'text-sm' : 'text-base font-semibold'"
        >
          Rp{{ fmtRupiah(subtotal) }}
        </span>
      </div>

      <div v-if="discount > 0" class="text-success-foreground flex items-baseline justify-between">
        <span class="text-sm tracking-tight">{{ t("tickets.discount") }}</span>
        <span class="text-sm font-medium tabular-nums tracking-tight">
          -Rp{{ fmtRupiah(discount) }}
        </span>
      </div>

      <div v-if="discount > 0" class="flex items-baseline justify-between">
        <span class="text-sm font-medium tracking-tight">{{ t("tickets.total") }}</span>
        <span class="text-base font-semibold tabular-nums tracking-tight">
          Rp{{ fmtRupiah(total) }}
        </span>
      </div>

      <p class="text-muted-foreground text-xs tracking-tight">
        {{ t("tickets.taxNote") }}
      </p>
    </div>
  </div>
</template>
