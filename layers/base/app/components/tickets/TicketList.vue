<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { toast } from "vue-sonner";
import { useTicketCartStore } from "../../stores/ticketCart";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DatePicker } from "../ui/date-picker";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { Input } from "../ui/input";
import { Lightbox } from "../ui/lightbox";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import TicketCardQuantity from "./TicketCardQuantity.vue";
import TicketListSkeleton from "./TicketListSkeleton.vue";
import TicketSlotPicker from "./TicketSlotPicker.vue";
import TicketStub from "./TicketStub.vue";

const props = defineProps({
  eventSlug: { type: String, required: true },
});

const { t, locale } = useI18n();
const { $dayjs } = useNuxtApp();
const route = useRoute();
const cart = useTicketCartStore();
const event = useEvent();
const accessCodeErrors = useAccessCodeErrors();

// Event lifecycle drives the closed-sale label: a ticket with no live/upcoming
// sale phase reads as "Coming soon" until the event itself is over, and only
// then as "Sales ended". Status is client-only (null until mounted), so the
// safe default before mount is the optimistic "Coming soon".
const eventStartTime = computed(() => new Date(event.startTime));
const eventEndTime = computed(() => new Date(event.endTime));
const { status: eventStatus } = useEventStatus(eventStartTime, eventEndTime);

// Tickets always come from PM One; there is no static fallback. The locale is
// forwarded so ticket copy + meta.terms come back localized. On failure we show
// a clear error/empty state rather than fabricating ticket data.
const { data, pending, error, refresh } = await useTicketsListing(
  () => props.eventSlug,
);

const tickets = computed(() => data.value?.data ?? []);

// A 404 with this code means the organizer has not enabled ticketing yet, shown
// as a calm "coming soon" rather than a real (retryable) load failure. The Nitro
// adapter may surface the PM One body either directly or nested under `data`.
const ticketsDisabled = computed(() => {
  const body = error.value?.data;
  return (
    body?.error_code === "TICKETS_DISABLED" ||
    body?.data?.error_code === "TICKETS_DISABLED"
  );
});

// Tickets revealed by a valid access code (may include `hidden` ones absent from
// the public listing). Merged over the listing, deduped by id.
const revealedTickets = ref([]);
const unlockedIds = ref([]);

const mergedTickets = computed(() => {
  const byId = new Map();
  for (const tk of tickets.value) byId.set(tk.id, tk);
  for (const tk of revealedTickets.value) byId.set(tk.id, tk);
  return Array.from(byId.values());
});

const entryTickets = computed(() =>
  mergedTickets.value.filter((tk) => tk.kind === "entry"),
);
const addOnTickets = computed(() =>
  mergedTickets.value.filter((tk) => tk.kind === "add_on"),
);

// A code_required ticket stays locked (no Add button) until unlocked. Hidden
// tickets only ever appear once revealed, so they are never "locked" here.
function isLocked(ticket) {
  return (
    ticket.visibility === "code_required" &&
    !unlockedIds.value.includes(ticket.id)
  );
}

// --- Access code (unlock gated tickets + optional price effect) ---
const accessCodeInput = ref("");
const accessApplying = ref(false);
const accessError = ref("");
const appliedAccessCode = ref("");
const accessPriceEffect = ref(null);

// The access-code box stays hidden for the public ("Don't make the user think").
// It only surfaces when a code_required ticket is visibly locked in the listing,
// or once a code has been applied (so the buyer can review/remove it). Hidden
// tickets are reached via an invite link (?code=), which auto-applies on mount.
const hasGatedVisible = computed(() =>
  mergedTickets.value.some((tk) => tk.visibility === "code_required"),
);
// Also surface the box when an invite-link code failed (accessError), so an
// invited buyer learns why their link did not work - public visitors never
// carry a ?code= and so never trip this.
const showAccessBox = computed(
  () =>
    !!appliedAccessCode.value || !!accessError.value || hasGatedVisible.value,
);

async function applyAccessCode(rawCode) {
  const code = (rawCode ?? accessCodeInput.value)?.trim();
  if (!code) return;
  accessApplying.value = true;
  accessError.value = "";
  try {
    const res = await $fetch("/api/tickets/validate-access-code", {
      method: "POST",
      body: { event_id: event.id, code },
    });
    const dataRes = res?.data ?? res;
    if (!dataRes?.valid) {
      accessError.value =
        accessCodeErrors[dataRes?.error_code] ||
        dataRes?.message ||
        t("tickets.accessInvalid");
      return;
    }
    revealedTickets.value = dataRes.tickets ?? [];
    unlockedIds.value = (dataRes.unlocks ?? []).map((u) => u.ticket_id);
    appliedAccessCode.value = code.toUpperCase();
    accessPriceEffect.value =
      dataRes.price_effect && dataRes.price_effect !== "none"
        ? dataRes.price_effect
        : null;
    cart.setEventContext({ eventId: event.id, eventSlug: props.eventSlug });
    cart.setAccessCode(code);
  } catch (err) {
    const payload = err?.data?.data ?? err?.data ?? {};
    accessError.value =
      accessCodeErrors[payload?.error_code] ||
      payload?.message ||
      t("tickets.accessInvalid");
  } finally {
    accessApplying.value = false;
  }
}

function removeAccessCode() {
  accessCodeInput.value = "";
  appliedAccessCode.value = "";
  accessError.value = "";
  accessPriceEffect.value = null;
  revealedTickets.value = [];
  unlockedIds.value = [];
  cart.clearAccessCode();
}

/**
 * Check the persisted cart against the tickets this page actually loaded.
 * `hydrate()` runs before any ticket has been fetched, so until this ran a line
 * survived its ticket being switched off, sold out, or losing the day it was
 * booked on - for a full 24 hours, and it went to the preview and to the order
 * endpoint on every load.
 */
function reconcileCart() {
  if (!import.meta.client || !mergedTickets.value.length) return;
  const { removed } = cart.reconcile(
    Object.fromEntries(mergedTickets.value.map((tk) => [tk.id, tk])),
  );
  if (removed.length) {
    const titles = removed
      .map((r) => r || t("tickets.ticket"))
      .join(", ");
    toast.error(t("tickets.cartUpdated", { titles }));
  }
}

// An access code reveals tickets that were not in the first response, so re-run
// it - those lines must not be dropped for having been absent a moment ago.
watch(mergedTickets, reconcileCart);

onMounted(() => {
  cart.hydrate();
  cart.setEventContext({ eventId: event.id, eventSlug: props.eventSlug });
  reconcileCart();

  // Auto-apply a code from a magic invite link (?invite=XXXX) or a persisted cart.
  const invite = route.query.invite || route.query.code;
  const initial = (typeof invite === "string" && invite) || cart.accessCode;
  if (initial) {
    accessCodeInput.value = String(initial);
    applyAccessCode(String(initial));
  }
});


// Per-add-on chosen session (add-ons with >1 session require a pick first).
const selectedSession = reactive({});
// Per-entry chosen day (a "Day Pass" requires a single-day pick before buying).
const selectedDay = reactive({});

function sessionsFor(ticket) {
  return ticket.sessions ?? [];
}

function resolveSessionId(ticket) {
  const sessions = sessionsFor(ticket);
  if (sessions.length <= 1) return sessions[0]?.id ?? null;
  return selectedSession[ticket.id] ?? null;
}

function daysFor(ticket) {
  return ticket.valid_days ?? [];
}

/**
 * The server's predicate, verbatim (`Ticket::offersDaySelection`): an entry
 * ticket flagged `requires_day_selection`. The old version left `kind` out and
 * added `valid_days.length > 1`, so a day-required ticket with an empty
 * `valid_days` relation skipped the picker entirely, skipped the Add guard that
 * depends on it, and added a day-less line through the front door.
 */
function mustPickDay(ticket) {
  return ticket?.kind === "entry" && Boolean(ticket?.requires_day_selection);
}

/** A single valid day is implied rather than chosen, so no picker is shown. */
function requiresDayPick(ticket) {
  return mustPickDay(ticket) && daysFor(ticket).length > 1;
}

/**
 * The day this ticket's cart line belongs to: the chosen day, the single implied
 * day, or `undefined` for **unresolved**.
 *
 * `undefined` rather than `null` is the whole point. `null` is a real cart
 * identity - the key of a line with no day - so returning it for "nothing picked
 * yet" pointed the stepper at exactly the broken line this work is about, and
 * `+`/`-` then edited it.
 */
function resolveDayId(ticket) {
  if (!mustPickDay(ticket)) return null;
  const days = daysFor(ticket);
  if (days.length === 1) return days[0].id;
  return selectedDay[ticket.id] ?? undefined;
}

/** Every cart line for this ticket, so the card can show what other days hold. */
function dayLinesFor(ticket) {
  return cart.items
    .filter((i) => i.ticket_id === ticket.id && i.selected_event_day_id)
    .map((i) => {
      const day = daysFor(ticket).find((d) => d.id === i.selected_event_day_id);
      return day
        ? {
            id: day.id,
            qty: i.qty,
            label: $dayjs(day.date).locale(locale.value).format("ddd, D MMM"),
          }
        : null;
    })
    .filter(Boolean);
}

// A day pass with more than 4 valid days uses a DatePicker locked to those
// dates; these map a chosen Date back to the matching day option, and the
// current selection back to a Date for the picker's model.
function dayDates(ticket) {
  return daysFor(ticket)
    .map((d) => isoToLocalDate(d.date))
    .filter(Boolean);
}

function dateKey(d) {
  return d ? `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}` : "";
}

function selectedDayDate(ticket) {
  const id = selectedDay[ticket.id];
  if (!id) return null;
  const day = daysFor(ticket).find((d) => d.id === id);
  return day ? isoToLocalDate(day.date) : null;
}

function onDayDatePick(ticket, date) {
  if (!date) {
    selectedDay[ticket.id] = null;
    return;
  }
  const key = dateKey(date);
  const day = daysFor(ticket).find(
    (d) => dateKey(isoToLocalDate(d.date)) === key,
  );
  selectedDay[ticket.id] = day ? day.id : null;
}



function qtyOf(ticket) {
  const dayId = resolveDayId(ticket);
  if (dayId === undefined) return 0;
  return cart.qtyFor(ticket.id, resolveSessionId(ticket), dayId);
}

/**
 * How many more of this ticket the buyer may take on the day they are looking
 * at. Stock and `max_quantity` are per ticket, not per day, so what the other
 * days already hold has to come off the top - otherwise a two-day pass could
 * take the maximum twice and the server would refuse the whole order at submit.
 */
function headroom(ticket) {
  const dayId = resolveDayId(ticket);
  if (dayId === undefined) return 0;
  return lineCapFor(ticket, cart.items, resolveSessionId(ticket), dayId);
}

/** Everything this ticket already holds in the cart, across every day. */
function qtyHeldFor(ticket) {
  return cart.items
    .filter((i) => i.ticket_id === ticket.id)
    .reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
}

function atMax(ticket) {
  return qtyOf(ticket) >= headroom(ticket);
}

/**
 * A ticket nobody may buy more than one of has nothing to step through, so the
 * card shows Add, then a single Remove - not two permanently dead arrows around
 * a number that cannot move.
 */
function isSingle(ticket) {
  return singleQuantity(ticket);
}


// Staff preview: `?force-checkout-ticket` lets a switched-off or not-yet-open
// ticket be added and bought, so checkout can be smoke-tested on production
// before sales open. Stock is NOT bypassed - the server still refuses a
// genuinely sold-out ticket, so soldOut() below stays as it is.
const forceCheckout = useForceShow("force-checkout-ticket");

function saleOpen(ticket) {
  return Boolean(ticket.on_sale) || forceCheckout.value;
}

/** Whether this ticket is only reachable because of the preview flag. */
function isAdminPreviewOnly(ticket) {
  return forceCheckout.value && (ticket.is_active === false || !ticket.on_sale);
}

/**
 * Names the reason, so staff can tell a switched-off ticket from an early one.
 *
 * Deliberately not translated: this only ever renders for a staff member who
 * typed ?force-checkout-ticket, and five locale entries of untranslated English
 * would be worse than one honest literal. Every string a visitor can reach on
 * this page goes through t().
 */
function adminPreviewLabel(ticket) {
  return ticket.is_active === false ? "Inactive" : "Not on sale";
}

/** The Add button / quantity stepper branch, shared by both layouts. */
function canBuyNow(ticket) {
  return (
    ticket.purchase_type === "first_party" &&
    saleOpen(ticket) &&
    !soldOut(ticket) &&
    !dayless(ticket)
  );
}

// A ticket is buyable (so the Add button + day/session pickers make sense) only
// when it is a first-party ticket whose sale phase is live, with stock left and
// not gated behind an access code.
function isBuyable(ticket) {
  return canBuyNow(ticket) && !isLocked(ticket);
}

function canAdd(ticket) {
  if (isLocked(ticket)) return false;
  if (soldOut(ticket)) return false;
  if (dayless(ticket)) return false;
  const sessions = sessionsFor(ticket);
  if (sessions.length > 1 && !selectedSession[ticket.id]) return false;
  if (requiresDayPick(ticket) && !selectedDay[ticket.id]) return false;
  return true;
}

/**
 * A ticket that must be bought for a specific day but carries no valid days at
 * all. Nothing the buyer can do makes it addable, so it is routed through the
 * unavailable state instead of offering an Add button that can only ever fail.
 */
function dayless(ticket) {
  return mustPickDay(ticket) && daysFor(ticket).length === 0;
}

function addToCart(ticket) {
  // The Add button is left clickable (only dimmed) when a day/session pick is
  // still missing, so the buyer gets a toast telling them what to do instead of
  // a dead button. Sold-out is the only hard-disabled case.
  if (ticket.available != null && ticket.available <= 0) return;
  if (sessionsFor(ticket).length > 1 && !selectedSession[ticket.id]) {
    toast.error(t("tickets.selectSessionFirst"));
    return;
  }
  if (requiresDayPick(ticket) && !selectedDay[ticket.id]) {
    toast.error(t("tickets.selectDayFirst"));
    return;
  }
  if (dayless(ticket)) return;
  if (headroom(ticket) < minFor(ticket)) {
    // Name the rule that actually bound. `maxFor` is the minimum of three
    // different limits, so announcing any one of them blindly told the buyer a
    // number that belonged to a different rule. Most specific first: a per-email
    // cap is the one nobody guesses, and during a free pre-registration it is
    // usually 1.
    const held = qtyHeldFor(ticket);
    const perEmail = ticket.max_per_buyer;
    const perOrder = ticket.max_quantity;
    if (perEmail != null && held >= Number(perEmail)) {
      toast.error(t("tickets.maxPerEmail", { count: perEmail }));
    } else if (perOrder != null && held >= Number(perOrder)) {
      toast.error(t("tickets.maxPerOrder", { count: perOrder }));
    } else {
      toast.error(t("tickets.spotsLeft", { count: ticket.available ?? 0 }));
    }
    return;
  }
  cart.setEventContext({ eventId: event.id, eventSlug: props.eventSlug });
  cart.addItem(
    ticket.id,
    resolveSessionId(ticket),
    minFor(ticket),
    resolveDayId(ticket),
  );
}

function inc(ticket) {
  const next = qtyOf(ticket) + 1;
  if (next > headroom(ticket)) return;
  cart.setQty(ticket.id, resolveSessionId(ticket), next, resolveDayId(ticket));
}

function dec(ticket) {
  const next = qtyOf(ticket) - 1;
  cart.setQty(
    ticket.id,
    resolveSessionId(ticket),
    Math.max(0, next),
    resolveDayId(ticket),
  );
}

/** Jump the card to a day the cart already holds, from the per-day chips. */
function focusDay(ticket, dayId) {
  selectedDay[ticket.id] = dayId;
}

// Price stays a price: the live phase price when on sale, otherwise a muted
// preview of the upcoming phase. Status words ("Coming soon"/"Sold out") never
// appear here - they live on the action button instead.
function priceLabel(ticket) {
  const price = ticket.on_sale ? ticket.price : ticket.display_price;
  if (price == null) return "";
  return price > 0 ? fmtIdr(price) : t("tickets.free");
}

/** The price the card is currently showing, as a number. Null when unpriced. */
function effectivePrice(ticket) {
  const price = ticket.on_sale ? ticket.price : ticket.display_price;
  return price == null ? null : Number(price);
}

function isFreeNow(ticket) {
  return effectivePrice(ticket) === 0;
}

/**
 * External tickets leave the site entirely, so the CTA has to say what happens
 * next. "Get Ticket" next to a Rp0 price read like a purchase the visitor was
 * about to be charged for; "Buy ticket" next to a real price is honest about it.
 */
function externalCtaLabel(ticket) {
  return isFreeNow(ticket) ? t("tickets.register") : t("tickets.buyTicket");
}

/** First-party: a free phase is a registration, a priced one is a cart add. */
function addCtaLabel(ticket) {
  return isFreeNow(ticket) ? t("tickets.register") : t("tickets.add");
}

// A countdown that hits zero used to just vanish, leaving the card advertising
// the phase that had already ended - old price, old button - until someone
// reloaded. The listing is response-cached for 300s upstream, so one refresh at
// the boundary can still come back pre-boundary; retry until the phase the
// payload reports actually moves, then stop.
const boundaryRetries = ref(0);
let boundaryTimer = null;

function phaseSignature() {
  return tickets.value
    .map((tk) => `${tk.id}:${tk.sales_status}:${tk.sales_phase_label ?? ""}`)
    .join("|");
}

async function onPhaseBoundary() {
  if (boundaryTimer) return;
  const before = phaseSignature();
  boundaryRetries.value = 0;

  const attempt = async () => {
    boundaryTimer = null;
    await refresh();
    if (phaseSignature() !== before) return;
    if (boundaryRetries.value >= 6) return;
    boundaryRetries.value += 1;
    boundaryTimer = setTimeout(attempt, 30000);
  };

  await attempt();
}

onBeforeUnmount(() => {
  if (boundaryTimer) clearTimeout(boundaryTimer);
});

// Single source of truth for the unavailable state, shared by the label, icon,
// and toast so they never contradict. "Sales ended" is only valid once the
// event is actually over; before that (event upcoming/live) a closed sale phase
// reads as "Coming soon". Sold out always wins.
function unavailableState(ticket) {
  if (soldOut(ticket)) return "sold_out";
  // A day-required ticket with no valid days cannot be bought on any day, which
  // reads to a buyer exactly like stock having run out.
  if (dayless(ticket)) return "sold_out";
  if (ticket.sales_status === "upcoming") return "coming_soon";
  return eventStatus.value === "completed" ? "sales_ended" : "coming_soon";
}

// Status label that replaces the Add button when a ticket can't be bought now.
function unavailableLabel(ticket) {
  const state = unavailableState(ticket);
  if (state === "sold_out") return t("tickets.soldOut");
  if (state === "coming_soon") return t("tickets.comingSoon");
  return t("tickets.salesEnded");
}

function onUnavailableClick(ticket) {
  const state = unavailableState(ticket);
  if (state === "sold_out") {
    toast.error(t("tickets.soldOutToast"));
    return;
  }
  if (state === "coming_soon") {
    // Only an upcoming sale phase carries a known start date; an event that just
    // hasn't opened sales yet falls back to the generic "not started" message.
    const when = ticket.sales_starts_at
      ? $dayjs(ticket.sales_starts_at).format("MMMM D, YYYY")
      : null;
    toast.info(
      when
        ? t("tickets.comingSoonToastDated", { date: when })
        : t("tickets.comingSoonToast"),
    );
    return;
  }
  toast.info(t("tickets.salesEndedToast"));
}

// Countdown label adapts to the sale phase: a named promo phase reads
// "Pre-sale starts in" / "Early Bird ends in", while a generic phase
// ("Normal", "Standard", ...) or an unnamed one falls back to the cleaner
// "Ticket sales start/end in". `mode` is "start" (open) or "end" (close).
const GENERIC_PHASE_LABELS = new Set([
  "normal",
  "standard",
  "regular",
  "reguler",
  "default",
  "general",
  "umum",
  "biasa",
]);

function phasePrefix(ticket, mode) {
  const label = (ticket.sales_phase_label || "").trim();
  if (label && !GENERIC_PHASE_LABELS.has(label.toLowerCase())) {
    return t(
      mode === "start" ? "tickets.phaseStartsIn" : "tickets.phaseEndsIn",
      { phase: label },
    );
  }
  return t(mode === "start" ? "tickets.salesStartsIn" : "tickets.salesEndsIn");
}

// Navigation to checkout moved to TicketCartBarHost, which owns the one bar that
// spans both ticket routes.

const ticketsById = computed(() => {
  const byId = new Map();
  for (const tk of mergedTickets.value) {
    byId.set(tk.id, tk);
  }
  return byId;
});



</script>

<template>
  <!-- Loading: a skeleton shaped like the real ticket cards. Only when there is
       nothing to show yet — /tickets is prerendered and re-fetches on mount to
       pick up a sale that opened since the build, and that refresh flips
       `pending` back to true. Without the length check every visit would flash a
       skeleton over the ticket list it had already painted. -->
  <TicketListSkeleton v-if="pending && !tickets.length" />

  <!-- Load failure or ticketing not enabled. We never fabricate ticket data:
       a real failure is retryable, a disabled event reads as "coming soon".
       Also gated on having nothing to show: when the on-mount refresh fails,
       tickets that were already painted must stay on screen rather than being
       replaced by a retry box. -->
  <div v-else-if="error && !tickets.length" class="container">
    <EmptyState
      v-if="ticketsDisabled"
      :title="t('tickets.unavailableTitle')"
      :description="t('tickets.unavailableDescription')"
    >
      <template #image>
        <TicketListEmptyStateImage />
      </template>
    </EmptyState>
    <Empty v-else class="border-border bg-muted/30 mx-auto max-w-md border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon name="hugeicons:alert-02" class="text-destructive-foreground" />
        </EmptyMedia>
        <EmptyTitle>{{ t("tickets.loadErrorTitle") }}</EmptyTitle>
        <EmptyDescription>
          {{ t("tickets.loadErrorDescription") }}
        </EmptyDescription>
      </EmptyHeader>
      <Button variant="outline" :disabled="pending" @click="refresh()">
        <Icon v-if="pending" name="svg-spinners:180-ring" class="size-4" />
        {{ t("tickets.loadErrorRetry") }}
      </Button>
    </Empty>
  </div>

  <!-- Dynamic tickets -->
  <div v-else class="container">
    <!-- Access code box stays hidden for the public ("Don't make the user
         think"). Hidden tickets are reached via an invite link (?code=), which
         auto-applies on mount. The box only appears when a code_required ticket
         is visibly locked in the listing, or once a code has been applied. -->
    <div v-if="showAccessBox" class="mx-auto mb-8 max-w-md lg:mb-10">
      <div class="border-border bg-background rounded-2xl border p-4">
        <div v-if="appliedAccessCode" class="space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span
              class="bg-success/10 text-success-foreground flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm tracking-tight"
            >
              <Icon name="hugeicons:ticket-star" class="size-4 shrink-0" />
              {{ t("tickets.accessApplied", { code: appliedAccessCode }) }}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              @click="removeAccessCode"
            >
              {{ t("tickets.remove") }}
            </Button>
          </div>
          <p
            v-if="accessPriceEffect"
            class="text-muted-foreground text-xs tracking-tight"
          >
            {{ t("tickets.accessPriceNote") }}
          </p>
        </div>
        <div v-else class="space-y-2">
          <p class="text-foreground text-sm font-medium tracking-tight">
            {{ t("tickets.accessLabel") }}
          </p>
          <div class="flex gap-2">
            <Input
              v-model="accessCodeInput"
              :placeholder="t('tickets.accessPlaceholder')"
              class="flex-1 uppercase"
              maxlength="60"
              :disabled="accessApplying"
              @keydown.enter.prevent="
                accessCodeInput?.trim() && !accessApplying && applyAccessCode()
              "
            />
            <Button
              type="button"
              variant="outline"
              :disabled="!accessCodeInput?.trim() || accessApplying"
              @click="applyAccessCode()"
            >
              <Icon
                v-if="accessApplying"
                name="svg-spinners:180-ring"
                class="size-4"
              />
              {{ t("tickets.apply") }}
            </Button>
          </div>
          <p
            v-if="accessError"
            role="alert"
            class="bg-destructive/10 text-destructive-foreground flex items-start gap-1.5 rounded-md px-3 py-2 text-xs tracking-tight"
          >
            <Icon
              name="hugeicons:alert-circle"
              class="mt-0.5 size-4 shrink-0"
            />
            <span>{{ accessError }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Empty: the listing loaded fine but there are no tickets yet -->
    <EmptyState
      v-if="!entryTickets.length && !addOnTickets.length"
      :title="t('tickets.emptyTitle')"
      :description="t('tickets.noTickets')"
    >
      <template #image>
        <TicketListEmptyStateImage />
      </template>
    </EmptyState>

    <div v-else class="grid grid-cols-1 gap-y-10 lg:gap-y-16">
      <!-- Entry tickets -->
      <section v-if="entryTickets.length" id="entry-tickets">
        <div class="flex flex-col items-center gap-y-3 text-center">
          <h2
            class="text-foreground text-3xl font-semibold tracking-tighter sm:text-4xl"
          >
            {{ t("tickets.entryTitle") }}
          </h2>
          <p class="text-foreground tracking-tight text-balance">
            {{ t("tickets.entrySubtitle", { event: event.title }) }}
          </p>
        </div>

        <div
          class="mx-auto mt-6 grid grid-cols-1 gap-4 lg:mt-8"
          :class="{
            'max-w-lg': entryTickets.length === 1,
            'max-w-5xl lg:grid-cols-2': entryTickets.length === 2,
            'xl:grid-cols-3': entryTickets.length >= 3,
          }"
        >
          <TicketStub
            v-for="ticket in entryTickets"
            :id="ticket.slug"
            :key="ticket.id"
          >
            <div
              class="flex grow flex-col px-4 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-6"
            >
              <div class="flex items-center gap-x-3">
                <Lightbox
                  v-if="ticket.poster"
                  :items="posterLightboxItems(ticket)"
                  :full-key="POSTER_FULL_KEY"
                  :show-thumbnails="false"
                  :show-share="false"
                  :show-download="false"
                >
                  <template #trigger="{ openAt }">
                    <button
                      type="button"
                      class="group bg-muted border-border relative block size-16 shrink-0 cursor-zoom-in overflow-hidden rounded-xl lg:size-18"
                      :aria-label="ticket.title"
                      @click="openAt(0)"
                    >
                      <img
                        :src="posterSrc(ticket)"
                        :alt="ticket.title"
                        class="outline-inside size-full rounded-xl object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      <span
                        class="bg-foreground/0 group-hover:bg-foreground/20 absolute inset-0 flex items-center justify-center transition-colors"
                      >
                        <Icon
                          name="lucide:zoom-in"
                          class="text-background size-5 opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      </span>
                    </button>
                  </template>
                </Lightbox>
                <div class="flex flex-col items-start gap-y-1">
                  <p
                    class="text-foreground line-clamp-2 text-sm font-semibold tracking-tight"
                  >
                    {{ ticket.title }}
                  </p>
                  <!-- Staff preview only: this ticket is buyable here because
                       of ?force-checkout-ticket, not because it is on sale. -->
                  <Badge
                    v-if="isAdminPreviewOnly(ticket)"
                    variant="warning"
                    icon="hugeicons:view-off"
                  >
                    {{ adminPreviewLabel(ticket) }}
                  </Badge>
                  <!-- Sale countdown stays under the title. tabular-nums on the
                       HH:MM:SS digits (Countdown.vue) keeps the per-second width
                       constant, so the line never flips between one and two lines
                       as the seconds tick. -->
                  <Countdown
                    v-if="ticket.sales_starts_at"
                    variant="no-style"
                    class="text-muted-foreground text-sm tracking-tight"
                    :text-before-countdown="phasePrefix(ticket, 'start')"
                    :countdown-date="new Date(ticket.sales_starts_at)"
                    @complete="onPhaseBoundary"
                    v-tippy="
                      $dayjs(ticket.sales_starts_at).format(
                        'MMMM D, YYYY [at] h:mm A',
                      )
                    "
                  />
                  <Countdown
                    v-else-if="ticket.sales_ends_at"
                    variant="no-style"
                    class="text-muted-foreground text-sm tracking-tight"
                    :text-before-countdown="phasePrefix(ticket, 'end')"
                    :countdown-date="new Date(ticket.sales_ends_at)"
                    @complete="onPhaseBoundary"
                    v-tippy="
                      $dayjs(ticket.sales_ends_at).format(
                        'MMMM D, YYYY [at] h:mm A',
                      )
                    "
                  />
                </div>
              </div>

              <div
                v-if="ticket.day_pass || ticket.entrance || ticket.tier"
                class="mt-4 flex flex-wrap gap-1.5"
              >
                <Badge v-if="ticket.day_pass" icon="hugeicons:ticket-star">
                  {{ ticket.day_pass }}
                </Badge>
                <Badge
                  v-if="ticket.entrance"
                  icon="hugeicons:square-arrow-right-03"
                >
                  {{ ticket.entrance }}
                </Badge>
                <Badge
                  v-if="ticket.tier && !ticket.day_pass && !ticket.entrance"
                  variant="outline"
                >
                  {{ ticket.tier }}
                </Badge>
              </div>

              <div
                v-if="ticket.benefits && ticket.benefits.length"
                class="mt-4 flex flex-col gap-y-1"
              >
                <div
                  v-for="(benefit, i) in ticket.benefits"
                  :key="i"
                  class="flex gap-x-1.5"
                >
                  <Icon
                    name="lucide:check"
                    class="text-success-foreground h-4 shrink-0 sm:h-5"
                  />
                  <span
                    class="text-xs leading-normal! tracking-tight sm:text-sm"
                  >
                    {{ benefit }}
                  </span>
                </div>
              </div>

              <!-- Day picker: a Day Pass is valid on many days but the buyer
                   chooses one. Switching the day starts a fresh cart line.
                   <=4 days use pill toggles; more use a date picker locked to
                   the valid days. -->
              <div
                v-if="requiresDayPick(ticket) && isBuyable(ticket)"
                class="mt-4 space-y-2"
              >
                <p
                  :id="`day-label-${ticket.id}`"
                  class="text-muted-foreground text-xs font-medium tracking-tight sm:text-sm"
                >
                  {{ t("tickets.chooseDay") }}
                </p>
                <!-- One group, not three independent toggles: the days are
                     mutually exclusive, and the group carries the "Choose a day"
                     label so the options are announced with it.
                     Re-tapping the chosen day clears it, matching
                     TicketSlotPicker - a mis-tap has to be undoable. That used
                     to be dangerous, because `resolveDayId` answered `null` and
                     `null` is a real cart identity: the stepper bound to the
                     day-less line and edited it. It answers `undefined` now, so
                     "nothing picked" is its own state and clearing is safe. -->
                <ToggleGroup
                  v-if="daysFor(ticket).length <= 4"
                  type="single"
                  variant="pill"
                  :aria-labelledby="`day-label-${ticket.id}`"
                  :model-value="selectedDay[ticket.id] ?? ''"
                  @update:model-value="
                    (v) => (selectedDay[ticket.id] = v || null)
                  "
                >
                  <ToggleGroupItem
                    v-for="d in daysFor(ticket)"
                    :key="d.id"
                    indicator
                    :value="d.id"
                  >
                    {{ formatWeekdayDate(d.date, locale) }}
                  </ToggleGroupItem>
                </ToggleGroup>
                <DatePicker
                  v-else
                  :model-value="selectedDayDate(ticket)"
                  :allowed-dates="dayDates(ticket)"
                  :placeholder-date="dayDates(ticket)[0] || null"
                  :placeholder="t('tickets.selectDay')"
                  class="w-full"
                  @update:model-value="(v) => onDayDatePick(ticket, v)"
                />

                <!-- What the cart holds on the OTHER days. The card only ever
                     shows the day in focus, so adding 3 for Friday and switching
                     to Saturday used to look like the Friday tickets had been
                     lost. Tapping a chip brings that day back into focus. -->
                <div
                  v-if="dayLinesFor(ticket).length"
                  class="flex flex-wrap items-center gap-1.5 pt-0.5"
                >
                  <span class="text-muted-foreground text-sm tracking-tight">
                    {{ t("tickets.inCart") }}
                  </span>
                  <button
                    v-for="line in dayLinesFor(ticket)"
                    :key="line.id"
                    type="button"
                    class="bg-muted text-foreground hover:bg-muted/70 focus-visible:ring-ring rounded-full px-2.5 py-1 text-sm font-medium tracking-tight transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    :class="{ 'ring-primary ring-1': selectedDay[ticket.id] === line.id }"
                    @click="focusDay(ticket, line.id)"
                  >
                    {{ line.label }}
                    <span class="text-muted-foreground tabular-nums"
                      >&times;{{ line.qty }}</span
                    >
                  </button>
                </div>
              </div>
            </div>

            <template #footer>
              <div
                class="relative flex grow-0 items-center justify-between gap-x-3 px-5 py-3 sm:px-8 sm:py-4"
              >
                <div class="flex flex-wrap items-baseline gap-x-2">
                  <span
                    class="text-base font-semibold tracking-tighter"
                    :class="
                      ticket.on_sale ? 'text-foreground' : 'text-muted-foreground'
                    "
                  >
                    {{ priceLabel(ticket) }}
                  </span>
                  <!-- The full price this ticket eventually sells at, struck
                       through beside the live one. The API sends it only while
                       the current phase is actually cheaper, so a pre-sale price
                       reads as the discount it is instead of as the only price
                       there has ever been. -->
                  <span
                    v-if="ticket.original_price"
                    class="text-destructive-foreground text-xs tracking-tight line-through tabular-nums"
                  >
                    {{ fmtIdr(ticket.original_price) }}
                  </span>
                </div>

                <div class="shrink-0">
                  <!-- Locked: requires a valid access code -->
                  <span
                    v-if="isLocked(ticket)"
                    class="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium tracking-tight"
                  >
                    <Icon
                      name="hugeicons:square-lock-02"
                      class="size-4 shrink-0"
                    />
                    {{ t("tickets.locked") }}
                  </span>

                  <!-- External purchase. Gated on the sale window like every
                       other buy control: this branch sits ABOVE the unavailable
                       one, so without saleOpen() a ticket whose phase had not
                       opened yet still linked out. rel="noopener" is not
                       optional - target="_blank" alone hands a third-party
                       platform this page's window.opener. -->
                  <Button
                    v-else-if="
                      ticket.purchase_type === 'external' &&
                      ticket.external_url &&
                      saleOpen(ticket)
                    "
                    as-child
                    size="sm"
                  >
                    <a
                      :href="ticket.external_url"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ externalCtaLabel(ticket) }}
                      <Icon
                        name="hugeicons:link-square-02"
                        class="size-3.5 shrink-0 opacity-70"
                      />
                    </a>
                  </Button>

                  <!-- First-party, on sale, in stock -->
                  <TicketCardQuantity
                    v-else-if="canBuyNow(ticket)"
                    :qty="qtyOf(ticket)"
                    :at-max="atMax(ticket)"
                    :single="isSingle(ticket)"
                    :dimmed="!canAdd(ticket)"
                    :add-label="addCtaLabel(ticket)"
                    @add="addToCart(ticket)"
                    @increase="inc(ticket)"
                    @decrease="dec(ticket)"
                  />

                  <!-- Unavailable: sold out / coming soon / sales ended. Clickable
                       so a tap explains why (toast) instead of being a dead control. -->
                  <Button
                    v-else
                    variant="secondary"
                    size="sm"
                    @click="onUnavailableClick(ticket)"
                  >
                    <Icon
                      :name="
                        unavailableState(ticket) === 'sold_out'
                          ? 'hugeicons:ticket-02'
                          : unavailableState(ticket) === 'coming_soon'
                            ? 'hugeicons:clock-01'
                            : 'hugeicons:calendar-block-01'
                      "
                      class="size-4 shrink-0"
                    />
                    {{ unavailableLabel(ticket) }}
                  </Button>
                </div>
              </div>
            </template>
          </TicketStub>
        </div>
      </section>

      <!-- Add-on tickets -->
      <section v-if="addOnTickets.length" id="add-ons">
        <div class="flex flex-col items-center gap-y-3 text-center">
          <h2
            class="text-foreground text-3xl font-semibold tracking-tighter sm:text-4xl"
          >
            {{ t("tickets.addOnTitle") }}
          </h2>
          <p class="text-foreground tracking-tight text-balance">
            {{ t("tickets.addOnSubtitle") }}
          </p>
        </div>

        <div
          class="mx-auto mt-6 grid grid-cols-1 gap-4 lg:mt-8"
          :class="{
            'max-w-lg': addOnTickets.length === 1,
            'max-w-5xl lg:grid-cols-2': addOnTickets.length === 2,
            'xl:grid-cols-3': addOnTickets.length >= 3,
          }"
        >
          <TicketStub
            v-for="ticket in addOnTickets"
            :id="ticket.slug"
            :key="ticket.id"
          >
            <div
              class="flex grow flex-col px-4 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-6"
            >
              <div class="flex items-center gap-x-3">
                <Lightbox
                  v-if="ticket.poster"
                  :items="posterLightboxItems(ticket)"
                  :full-key="POSTER_FULL_KEY"
                  :show-thumbnails="false"
                  :show-share="false"
                  :show-download="false"
                >
                  <template #trigger="{ openAt }">
                    <button
                      type="button"
                      class="group bg-muted border-border relative block size-16 shrink-0 cursor-zoom-in overflow-hidden rounded-xl lg:size-18"
                      :aria-label="ticket.title"
                      @click="openAt(0)"
                    >
                      <img
                        :src="posterSrc(ticket)"
                        :alt="ticket.title"
                        class="outline-inside size-full rounded-xl object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      <span
                        class="bg-foreground/0 group-hover:bg-foreground/20 absolute inset-0 flex items-center justify-center transition-colors"
                      >
                        <Icon
                          name="lucide:zoom-in"
                          class="text-background size-5 opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      </span>
                    </button>
                  </template>
                </Lightbox>
                <div class="flex flex-col items-start gap-y-1">
                  <p
                    class="text-foreground line-clamp-2 text-sm font-semibold tracking-tight"
                  >
                    {{ ticket.title }}
                  </p>
                  <!-- Staff preview only: this ticket is buyable here because
                       of ?force-checkout-ticket, not because it is on sale. -->
                  <Badge
                    v-if="isAdminPreviewOnly(ticket)"
                    variant="warning"
                    icon="hugeicons:view-off"
                  >
                    {{ adminPreviewLabel(ticket) }}
                  </Badge>
                  <!-- Sale countdown stays under the title. tabular-nums on the
                       HH:MM:SS digits (Countdown.vue) keeps the per-second width
                       constant, so the line never flips between one and two lines
                       as the seconds tick. -->
                  <Countdown
                    v-if="ticket.sales_starts_at"
                    variant="no-style"
                    class="text-muted-foreground text-sm tracking-tight"
                    :text-before-countdown="phasePrefix(ticket, 'start')"
                    :countdown-date="new Date(ticket.sales_starts_at)"
                    @complete="onPhaseBoundary"
                    v-tippy="
                      $dayjs(ticket.sales_starts_at).format(
                        'MMMM D, YYYY [at] h:mm A',
                      )
                    "
                  />
                  <Countdown
                    v-else-if="ticket.sales_ends_at"
                    variant="no-style"
                    class="text-muted-foreground text-sm tracking-tight"
                    :text-before-countdown="phasePrefix(ticket, 'end')"
                    :countdown-date="new Date(ticket.sales_ends_at)"
                    @complete="onPhaseBoundary"
                    v-tippy="
                      $dayjs(ticket.sales_ends_at).format(
                        'MMMM D, YYYY [at] h:mm A',
                      )
                    "
                  />
                </div>
              </div>

              <div
                v-if="ticket.day_pass || ticket.entrance || ticket.tier"
                class="mt-4 flex flex-wrap gap-1.5"
              >
                <Badge v-if="ticket.day_pass" icon="hugeicons:ticket-star">
                  {{ ticket.day_pass }}
                </Badge>
                <Badge
                  v-if="ticket.entrance"
                  icon="hugeicons:square-arrow-right-03"
                >
                  {{ ticket.entrance }}
                </Badge>
                <Badge
                  v-if="ticket.tier && !ticket.day_pass && !ticket.entrance"
                  variant="outline"
                >
                  {{ ticket.tier }}
                </Badge>
              </div>

              <div
                v-if="ticket.benefits && ticket.benefits.length"
                class="mt-4 flex flex-col gap-y-1"
              >
                <div
                  v-for="(benefit, i) in ticket.benefits"
                  :key="i"
                  class="flex gap-x-1.5"
                >
                  <Icon
                    name="lucide:check"
                    class="text-success-foreground h-4 shrink-0 sm:h-5"
                  />
                  <span
                    class="text-xs leading-normal! tracking-tight sm:text-sm"
                  >
                    {{ benefit }}
                  </span>
                </div>
              </div>

              <!-- Time-slot picker (add-ons with more than one session) -->
              <div
                v-if="sessionsFor(ticket).length > 1 && isBuyable(ticket)"
                class="mt-4 space-y-2"
              >
                <p
                  class="text-muted-foreground text-xs font-medium tracking-tight sm:text-sm"
                >
                  {{ t("tickets.chooseSession") }}
                </p>
                <TicketSlotPicker
                  :sessions="sessionsFor(ticket)"
                  :model-value="selectedSession[ticket.id] ?? null"
                  @update:model-value="(v) => (selectedSession[ticket.id] = v)"
                />
              </div>
            </div>

            <template #footer>
              <div
                class="relative flex grow-0 items-center justify-between gap-x-3 px-5 py-3 sm:px-8 sm:py-4"
              >
                <div class="flex flex-wrap items-baseline gap-x-2">
                  <span
                    class="text-base font-semibold tracking-tighter"
                    :class="
                      ticket.on_sale ? 'text-foreground' : 'text-muted-foreground'
                    "
                  >
                    {{ priceLabel(ticket) }}
                  </span>
                  <!-- The full price this ticket eventually sells at, struck
                       through beside the live one. The API sends it only while
                       the current phase is actually cheaper, so a pre-sale price
                       reads as the discount it is instead of as the only price
                       there has ever been. -->
                  <span
                    v-if="ticket.original_price"
                    class="text-destructive-foreground text-xs tracking-tight line-through tabular-nums"
                  >
                    {{ fmtIdr(ticket.original_price) }}
                  </span>
                </div>

                <div class="shrink-0">
                  <span
                    v-if="isLocked(ticket)"
                    class="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium tracking-tight"
                  >
                    <Icon
                      name="hugeicons:square-lock-02"
                      class="size-4 shrink-0"
                    />
                    {{ t("tickets.locked") }}
                  </span>

                  <Button
                    v-else-if="
                      ticket.purchase_type === 'external' &&
                      ticket.external_url &&
                      saleOpen(ticket)
                    "
                    as-child
                    size="sm"
                  >
                    <a
                      :href="ticket.external_url"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ externalCtaLabel(ticket) }}
                      <Icon
                        name="hugeicons:link-square-02"
                        class="size-3.5 shrink-0 opacity-70"
                      />
                    </a>
                  </Button>

                  <TicketCardQuantity
                    v-else-if="canBuyNow(ticket)"
                    :qty="qtyOf(ticket)"
                    :at-max="atMax(ticket)"
                    :single="isSingle(ticket)"
                    :dimmed="!canAdd(ticket)"
                    :add-label="addCtaLabel(ticket)"
                    @add="addToCart(ticket)"
                    @increase="inc(ticket)"
                    @decrease="dec(ticket)"
                  />

                  <!-- Unavailable: sold out / coming soon / sales ended. Clickable
                       so a tap explains why (toast) instead of being a dead control. -->
                  <Button
                    v-else
                    variant="secondary"
                    size="sm"
                    @click="onUnavailableClick(ticket)"
                  >
                    <Icon
                      :name="
                        unavailableState(ticket) === 'sold_out'
                          ? 'hugeicons:ticket-02'
                          : unavailableState(ticket) === 'coming_soon'
                            ? 'hugeicons:clock-01'
                            : 'hugeicons:calendar-block-01'
                      "
                      class="size-4 shrink-0"
                    />
                    {{ unavailableLabel(ticket) }}
                  </Button>
                </div>
              </div>
            </template>
          </TicketStub>
        </div>
      </section>
    </div>

  </div>
</template>
