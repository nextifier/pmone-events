<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { toast } from "vue-sonner";
import { useTicketCartStore } from "../../stores/ticketCart";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "../ui/alert";
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
import { Field, FieldLabel } from "../ui/field";
import ResponsiveDialog from "../ui/responsive-dialog/ResponsiveDialog.vue";
import { Input } from "../ui/input";
import { Lightbox } from "../ui/lightbox";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import TicketCardQuantity from "./TicketCardQuantity.vue";
import TicketListSkeleton from "./TicketListSkeleton.vue";
import TicketSessionList from "./TicketSessionList.vue";
import TicketSlotPicker from "./TicketSlotPicker.vue";
import TicketStub from "./TicketStub.vue";

const props = defineProps({
  eventSlug: { type: String, required: true },
});

const { t, locale } = useI18n();
const { $dayjs } = useNuxtApp();
const route = useRoute();
const router = useRouter();
const cart = useTicketCartStore();
const event = useEvent();
const accessErrorMessage = useAccessCodeErrors();

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

// Nuxt clears `data` back to its default the moment a fetch fails - it does not
// merely populate `error` - so a failed refresh wipes the tickets that were
// already on screen. On /tickets that copy is the prerendered build-time
// snapshot, and it is exactly what is worth keeping when PM One is unreachable:
// the visitor sees the tickets as they stood at build time instead of
// "Couldn't load tickets" on a page whose HTML already contains them.
//
// Verified 19 Sep 2026 by serving a production build with the API pointed at a
// dead port: without this, the whole list vanished. Same pattern as the PM One
// dashboard's attendees/index.vue, which hit this during the polling rework.
const lastGoodListing = ref(data.value ?? null);

watch(data, (value) => {
  if (value) {
    lastGoodListing.value = value;
  }
});

const tickets = computed(
  () => (data.value ?? lastGoodListing.value)?.data ?? [],
);

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
// the public listing). Merged over the listing, deduped by id. They live in the
// cart store, because checkout and the cart bar need them too: a hidden ticket
// the checkout page could not look up used to be dropped from the cart there.
const revealedTickets = computed(() => (cart.accessApplied ? cart.accessTickets : []));
const unlockedIds = computed(() => (cart.accessApplied ? cart.accessUnlockedIds : []));
// Set by the applied code: an "exclusive" code turns this page into the
// invitation it came from, hiding every ticket it does not unlock.
const exclusiveDisplay = computed(() => cart.accessApplied && cart.accessExclusive);

const mergedTickets = computed(() => {
  const byId = new Map();
  for (const tk of tickets.value) byId.set(tk.id, tk);
  for (const tk of revealedTickets.value) byId.set(tk.id, tk);
  const all = Array.from(byId.values());

  if (!appliedAccessCode.value || !exclusiveDisplay.value) return all;

  // Entry tickets and add-ons alike: an organizer who wants an add-on to stay
  // visible ticks it under "Unlocks tickets". Anything already in the cart and
  // now hidden is dropped by reconcileCart(), which watches this computed.
  const only = all.filter((tk) => unlockedIds.value.includes(tk.id));

  // If the unlocked ticket has since been switched off there is nothing left to
  // show, and an exclusive code would turn the page into a bare "no tickets yet".
  // Fall back to the full listing rather than strand the guest on a dead end.
  return only.length ? only : all;
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
const accessBox = ref(null);
const removeConfirmOpen = ref(false);

// One terms dialog for every card. The ticket is kept after closing so the
// close animation still has its content to fade out with.
const termsOpen = ref(false);
const termsTicket = ref(null);

function openTerms(ticket) {
  termsTicket.value = ticket;
  termsOpen.value = true;
}
const accessCodeInput = ref("");
const accessApplying = ref(false);
const accessError = ref("");
const appliedAccessCode = computed(() => (cart.accessApplied ? cart.accessCode : ""));
const accessPriceEffect = computed(() => (cart.accessApplied ? cart.accessPriceEffect : null));
// True while a remembered code is being re-validated on load. Reconciling in
// that window would drop every line the code unlocks, before it is known.
const accessResolving = ref(false);

// `set_price` and `percentage` resolve to a unit price, so the card already
// shows what the holder pays with the old price struck through. Repeating
// "a special price at checkout" underneath that is both redundant and wrong
// about WHERE the discount lands. `amount` is the one effect that genuinely
// only appears in the cart total, so it keeps the note to itself.
const showAccessPriceNote = computed(() => accessPriceEffect.value === "amount");

// Said up front, so the buyer learns the per-order limit from the code itself
// rather than from a stepper that stops at 3 for no stated reason.
const accessLimitNote = computed(() => {
  const limit = Number(cart.accessMaxQty);
  if (!appliedAccessCode.value || !limit) return "";
  return t("tickets.accessMaxPerOrder", { count: limit }, limit);
});

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
    cart.setEventContext({ eventId: event.id, eventSlug: props.eventSlug });
    const result = await cart.validateAccessCode({ eventId: event.id, code });
    if (result.valid) return;

    // A 429 from the coarse ceiling in front of the endpoint carries no
    // error_code, only Laravel's own "Too Many Attempts." That string is
    // truthy, so it has to be intercepted BEFORE the server message or raw
    // framework English lands in a localised UI.
    const errorCode =
      result.errorCode || (result.status === 429 ? "TOO_MANY_ATTEMPTS" : null);
    accessError.value = accessErrorMessage(errorCode, result.message);

    // A remembered code that stopped working (revoked, used up, already used on
    // this browser) must not ride along to checkout, where it would refuse the
    // whole order. Forget it and drop the lines only it could buy.
    if (cart.accessCode === code.toUpperCase()) {
      cart.clearAccessCode();
    }
  } finally {
    accessApplying.value = false;
  }
}

async function removeAccessCode() {
  removeConfirmOpen.value = false;
  accessCodeInput.value = "";
  accessError.value = "";

  // Lines only the code could buy leave with it, named, instead of turning up
  // later as "no longer available".
  const removed = cart.clearAccessCode({ dropGatedLines: true });
  if (removed.length) {
    const titles = removed.map((r) => r || t("tickets.ticket")).join(", ");
    toast(t("tickets.accessLinesRemoved", { titles }));
  }

  // The code also lives in the address bar, and onMounted reads it back. Without
  // dropping it here, Remove survives exactly until the next reload and then the
  // code silently reapplies - which is not an undo, just a hidden state.
  if (route.query.code || route.query.invite) {
    await router.replace({
      query: { ...route.query, code: undefined, invite: undefined },
    });
  }

  // The button removed itself, so focus was left on <body>. Hand it to the input
  // that just took the button's place: same box, same spot on screen.
  await nextTick();
  accessBox.value?.querySelector("input")?.focus();
}

/**
 * Check the persisted cart against the tickets this page actually loaded.
 * `hydrate()` runs before any ticket has been fetched, so until this ran a line
 * survived its ticket being switched off, sold out, or losing the day it was
 * booked on - for a full 24 hours, and it went to the preview and to the order
 * endpoint on every load.
 */
function reconcileCart() {
  if (!import.meta.client || !mergedTickets.value.length || accessResolving.value) return;
  const { removed } = cart.reconcile(
    Object.fromEntries(mergedTickets.value.map((tk) => [tk.id, tk])),
  );
  if (removed.length) {
    const titles = removed.map((r) => r || t("tickets.ticket")).join(", ");
    toast.error(t("tickets.cartUpdated", { titles }));
  }
}

// An access code reveals tickets that were not in the first response, so re-run
// it - those lines must not be dropped for having been absent a moment ago.
watch(mergedTickets, reconcileCart);

onMounted(async () => {
  cart.hydrate();
  cart.setEventContext({ eventId: event.id, eventSlug: props.eventSlug });

  // Auto-apply a code from a magic invite link (?invite=XXXX) or a persisted cart.
  // Reconcile only once it has answered: the lines it unlocks are not in the
  // public listing yet, and reconciling first deleted them on every reload.
  const invite = route.query.invite || route.query.code;
  const initial = (typeof invite === "string" && invite) || cart.accessCode;
  if (initial) {
    accessCodeInput.value = String(initial);
    accessResolving.value = true;
    try {
      await applyAccessCode(String(initial));
    } finally {
      accessResolving.value = false;
    }
  }

  reconcileCart();
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
  const sessionId = resolveSessionId(ticket);
  return Math.min(
    lineCapFor(ticket, cart.items, sessionId, dayId),
    cart.accessCapFor(ticket.id, sessionId, dayId),
  );
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
  return singleQuantity(ticket) || (cart.accessUnlocks(ticket.id) && Number(cart.accessMaxQty) === 1);
}

// Staff preview: `?force-checkout-ticket` lets a switched-off or not-yet-open
// ticket be added and bought, so checkout can be smoke-tested on production
// before sales open. Stock is NOT bypassed - the server still refuses a
// genuinely sold-out ticket, so soldOut() below stays as it is.
// A token is itself a preview: `?force-checkout-ticket` on its own no longer
// unlocks anything server-side, so the card must follow the token rather than
// the flag or it would offer a Buy button the API then refuses.
const previewToken = usePreviewToken();
const forcedByFlag = useForceShow("force-checkout-ticket");
const forceCheckout = computed(() => forcedByFlag.value || previewToken.value !== null);

function saleOpen(ticket) {
  return Boolean(ticket.on_sale) || forceCheckout.value;
}

/**
 * A ticket the preview flag is showing that the organizer has switched OFF.
 *
 * It used to cover "not on sale" too, but that badge said nothing the card was
 * not already saying one line below it - "Pre-registration starts in 1 Day
 * 10:08" is the same fact with a date attached. A switched-off ticket has no
 * such line, so that is the only case worth a badge.
 *
 * The label is deliberately untranslated: it only ever renders for a staff
 * member who typed ?force-checkout-ticket, and five locale entries of
 * untranslated English would be worse than one honest literal. Every string a
 * visitor can reach on this page goes through t().
 */
function isSwitchedOffInPreview(ticket) {
  return forceCheckout.value && ticket.is_active === false;
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
    const dayId = resolveDayId(ticket);
    if (cart.accessCapFor(ticket.id, resolveSessionId(ticket), dayId) < minFor(ticket)) {
      toast.error(
        t("tickets.accessMaxPerOrder", { count: cart.accessMaxQty }, Number(cart.accessMaxQty)),
      );
    } else if (perEmail != null && held >= Number(perEmail)) {
      toast.error(
        t(
          isFreeNow(ticket) ? "tickets.maxPerEmailFree" : "tickets.maxPerEmail",
          { count: perEmail },
          Number(perEmail),
        ),
      );
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
// preview of the upcoming phase, or the price of a phase that just sold out.
// Status words ("Coming soon"/"Sold out") never appear here - they live on the
// action button instead.
function priceLabel(ticket) {
  const price = effectivePrice(ticket);
  if (price == null) return "";
  return price > 0 ? fmtIdr(price) : t("tickets.free");
}

/** The price the card is currently showing, as a number. Null when unpriced. */
function effectivePrice(ticket) {
  if (phaseSoldOut(ticket)) return Number(ticket.sold_out_phase_price);
  const price = ticket.on_sale ? ticket.price : ticket.display_price;
  return price == null ? null : Number(price);
}

/**
 * A phase sold out while a later one has yet to open ("Pre-sale" gone, "Normal
 * Registration" tomorrow). The card keeps the price that sold out, strikes the
 * next phase's price and names the phase that ran out, instead of counting
 * down to a phase it would otherwise read as sold out too.
 */
function phaseSoldOut(ticket) {
  return (
    Boolean(ticket.sold_out_phase_label) &&
    ticket.sold_out_phase_price != null &&
    !ticket.is_sold_out
  );
}

/**
 * The price struck through beside the shown one: the API's full price while a
 * cheaper phase is selling, or the next phase's price after one sold out.
 */
function struckPrice(ticket) {
  if (!phaseSoldOut(ticket)) return ticket.original_price ?? null;
  const next = Number(ticket.display_price);
  return next > effectivePrice(ticket) ? next : null;
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

/**
 * The per-email limit, stated where the buyer can still act on it.
 *
 * It used to exist in exactly two places, and neither of them worked. The toast
 * fires only AFTER someone tries to add a second one, so the rule could be
 * discovered only by breaking it. The checkout summary repeated it on a surface
 * that no longer has a quantity control to apply it to, where it cost three or
 * four wrapped lines on a phone and answered a question nobody was asking.
 * Here it sits beside the price, next to the button it constrains.
 */
function perEmailNote(ticket) {
  const perEmail = Number(ticket?.max_per_buyer);
  if (ticket?.max_per_buyer == null || !(perEmail > 0)) return "";

  return t(
    isFreeNow(ticket) ? "tickets.maxPerEmailFree" : "tickets.maxPerEmail",
    { count: perEmail },
    perEmail,
  );
}

/**
 * A free ticket that can only be taken once is a registration: "Register", no
 * plus sign, and a single remove control once it is in. The moment more than one
 * is allowed (a code that grants a team three free passes, say) it is a
 * quantity again, so it gets the same "+ Add" and stepper a priced ticket does.
 */
function registersOnce(ticket) {
  return isFreeNow(ticket) && isSingle(ticket);
}

/** First-party: a once-only free ticket is a registration, anything else a cart add. */
function addCtaLabel(ticket) {
  return registersOnce(ticket) ? t("tickets.register") : t("tickets.add");
}

// A countdown that hits zero used to just vanish, leaving the card advertising
// the phase that had already ended - old price, old button - until someone
// reloaded. The API's cache entry for the listing expires at the next phase
// boundary, so a refresh at the boundary normally gets the new phase. It can
// still come back pre-boundary when this device's clock runs ahead of the
// server's, so retry - soon at first, then backing off - until the phase the
// payload reports actually moves, then stop (about four minutes in all).
const BOUNDARY_RETRY_DELAYS_MS = [3000, 10000, 30000, 30000, 60000, 60000, 60000];

// Every browser aligns its tick to the whole second (useCurrentTime) and every
// countdown for a given phase completes on the same one, so an unjittered delay
// lands in the same millisecond in every visitor's browser at once. That turned
// each retry above into one synchronised burst against the origin - part of
// what saturated api.pmone.id on 19 Sep 2026. Spreading each delay across +/-40%
// turns those spikes back into traffic.
//
// The first attempt is deliberately NOT jittered: the countdown has just hit
// zero on screen and the card should flip now. That burst is absorbed by the
// Worker-side cache on /api/tickets/{slug} instead.
const BOUNDARY_RETRY_JITTER = 0.4;
const boundaryRetries = ref(0);
let boundaryTimer = null;
let boundaryRunning = false;

function boundaryRetryDelay(delay) {
  const spread = delay * BOUNDARY_RETRY_JITTER;

  return Math.round(delay - spread + Math.random() * spread * 2);
}

function phaseSignature() {
  return tickets.value
    .map((tk) => `${tk.id}:${tk.sales_status}:${tk.sales_phase_label ?? ""}`)
    .join("|");
}

async function onPhaseBoundary() {
  // `boundaryTimer` cannot guard re-entry on its own: it is null for as long as
  // an attempt is in flight. @complete is bound in four places (two layouts x
  // start/end) and they fire in the same flush, so several ladders could run at
  // once, share `boundaryRetries`, and march through the delays faster than
  // they read - while each overwrote the single `boundaryTimer`, leaking the
  // previous one past unmount.
  if (boundaryRunning) return;
  boundaryRunning = true;

  const before = phaseSignature();
  boundaryRetries.value = 0;

  const attempt = async () => {
    boundaryTimer = null;

    // refresh() resolves even when the request fails - useFetch routes that to
    // `error` - but a throw here would otherwise strand `boundaryRunning` at
    // true and stop the ladder for the life of the component. A failed refresh
    // leaves the signature unchanged, which is already "retry".
    try {
      await refresh();
    } catch {
      // Intentionally empty: handled by the signature check below.
    }

    if (phaseSignature() !== before) {
      boundaryRunning = false;

      return;
    }

    const delay = BOUNDARY_RETRY_DELAYS_MS[boundaryRetries.value];

    if (delay === undefined) {
      boundaryRunning = false;

      return;
    }

    boundaryRetries.value += 1;
    boundaryTimer = setTimeout(attempt, boundaryRetryDelay(delay));
  };

  await attempt();
}

// While a phase is sold out the countdown to the next one is not on screen, so
// nothing would flip the card when that phase opens. One timer, at the earliest
// such start, does what the countdown's @complete does.
let soldOutPhaseTimer = null;

watch(
  () =>
    tickets.value
      .filter(phaseSoldOut)
      .map((tk) => tk.sales_starts_at)
      .filter(Boolean)
      .sort()[0] ?? null,
  (next) => {
    if (soldOutPhaseTimer) clearTimeout(soldOutPhaseTimer);
    soldOutPhaseTimer = null;
    if (!next || !import.meta.client) return;
    const ms = new Date(next).getTime() - Date.now();
    // setTimeout overflows past ~24.8 days; a tab open that long reloads anyway.
    if (ms <= 0 || ms > 2_000_000_000) return;
    soldOutPhaseTimer = setTimeout(onPhaseBoundary, ms + 1000);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (boundaryTimer) clearTimeout(boundaryTimer);
  if (soldOutPhaseTimer) clearTimeout(soldOutPhaseTimer);
  boundaryRunning = false;
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
  // A phase sold out and the next one not open yet: sold out for now, and the
  // line under the title says which phase ran out.
  if (phaseSoldOut(ticket)) return "sold_out";
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
  // Only an upcoming sale phase carries a known start date; an event that just
  // hasn't opened sales yet falls back to the generic "not started" message.
  const when = ticket.sales_starts_at
    ? $dayjs(ticket.sales_starts_at).format("MMMM D, YYYY")
    : null;
  if (state === "sold_out") {
    // A sold-out phase is not the end of the sale: say when the next one opens.
    if (phaseSoldOut(ticket) && !soldOut(ticket)) {
      const lead = phaseSoldOutText(ticket, "toast");
      toast.error(
        when ? `${lead} ${t("tickets.comingSoonToastDated", { date: when })}` : lead,
      );
      return;
    }
    toast.error(t("tickets.soldOutToast"));
    return;
  }
  if (state === "coming_soon") {
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

// Names the phase that ran out, in place of the countdown ("Pre-sale tickets
// sold out") and in the toast. A generic label ("Normal", "Regular") would read
// oddly there, so it falls back to the plain sold-out copy.
function phaseSoldOutText(ticket, variant = "label") {
  const label = (ticket.sold_out_phase_label || "").trim();
  if (!label || GENERIC_PHASE_LABELS.has(label.toLowerCase())) {
    return t(variant === "toast" ? "tickets.soldOutToast" : "tickets.soldOut");
  }
  return t(
    variant === "toast" ? "tickets.phaseSoldOutToast" : "tickets.phaseSoldOut",
    { phase: label },
  );
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
    <!--
      max-w-lg, not max-w-md: the single-ticket grid below is max-w-lg, and the
      old 448-against-512 near-miss read as a bug rather than as a narrower
      notice. Same token, so the two edges line up exactly.
    -->
    <div v-if="showAccessBox" ref="accessBox" class="mx-auto mb-8 max-w-lg lg:mb-10">
      <!--
        Applied state is one status surface, the same shape the promo code uses
        in TicketCartSummary: check glyph, the sentence, Remove as a link inside
        the surface. It used to be a bordered card wrapping a filled pill with
        the button outside it, which is two boxes and two weights for one line,
        and the two halves of the same idea did not look alike.
      -->
      <!-- role="status" over Alert's own role="alert": this is a confirmation,
           and assertive live regions interrupt whatever a screen reader is
           already saying. Errors keep the interrupting one. -->
      <Alert v-if="appliedAccessCode" variant="success" role="status">
        <Icon name="lucide:circle-check" />
        <AlertTitle>
          <i18n-t keypath="tickets.accessApplied" tag="span" scope="global">
            <template #code>
              <span class="font-medium [overflow-wrap:anywhere]" dir="ltr">{{ appliedAccessCode }}</span>
            </template>
          </i18n-t>
        </AlertTitle>
        <!-- The success variant retints the description from its own hue, the
             way destructive does, so this stays readable instead of dropping to
             muted gray on a coloured surface. -->
        <AlertDescription v-if="showAccessPriceNote || accessLimitNote">
          <p v-if="accessLimitNote">{{ accessLimitNote }}</p>
          <p v-if="showAccessPriceNote">{{ t("tickets.accessPriceNote") }}</p>
        </AlertDescription>
        <AlertAction>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            @click="removeConfirmOpen = true"
          >
            {{ t("tickets.remove") }}
          </Button>
        </AlertAction>
      </Alert>

      <div
        v-else
        class="border-border bg-background rounded-2xl border p-4"
      >
        <div class="space-y-2">
          <!-- Field + FieldLabel + a loading Button, the same three parts the
               promo form in TicketCartSummary uses. The label used to be a loose
               paragraph, which left the input named only by its placeholder, and
               the spinner was hand-rolled beside a button that owns a loading
               state. The placeholder is gone with it: the label already says it. -->
          <div class="flex items-end gap-2">
            <Field class="flex-1">
              <FieldLabel for="access_code">
                {{ t("tickets.accessLabel") }}
              </FieldLabel>
              <Input
                id="access_code"
                v-model="accessCodeInput"
                class="uppercase"
                maxlength="60"
                autocapitalize="characters"
                autocomplete="off"
                spellcheck="false"
                :disabled="accessApplying"
                @keydown.enter.prevent="
                  accessCodeInput?.trim() && !accessApplying && applyAccessCode()
                "
              />
            </Field>
            <Button
              type="button"
              variant="outline"
              class="h-(--cn-input-h) shrink-0"
              :loading="accessApplying"
              :disabled="!accessCodeInput?.trim() || accessApplying"
              @click="applyAccessCode()"
            >
              {{ t("tickets.apply") }}
            </Button>
          </div>
          <p
            v-if="accessError"
            role="alert"
            class="bg-destructive/10 text-destructive-foreground flex items-start gap-1.5 rounded-md px-3 py-2 text-sm tracking-tight"
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

    <!-- Outside the showAccessBox branch: the dialog must survive the box
         disappearing the instant the code is removed. -->
    <ResponsiveDialog
      v-model:open="removeConfirmOpen"
      :title="t('tickets.removeAccessTitle')"
      :description="t('tickets.removeAccessBody')"
      dialog-max-width="26rem"
    >
      <template #default>
        <!-- Same shape as the clear-cart confirmation in TicketCartBar, which
             is this repo's one confirmation pattern. `aria-hidden` on the
             prompt because ResponsiveDialog already renders both strings as
             the sr-only title and description. -->
        <div class="px-4 pt-5 pb-8 md:px-6 md:py-5">
          <div aria-hidden="true">
            <div
              class="text-foreground text-lg font-semibold tracking-tighter text-balance"
            >
              {{ t("tickets.removeAccessTitle") }}
            </div>
            <p class="text-body mt-1.5 text-sm tracking-tight">
              {{ t("tickets.removeAccessBody") }}
            </p>
          </div>
          <div class="mt-4 flex justify-end gap-2">
            <Button variant="outline" @click="removeConfirmOpen = false">
              {{ t("tickets.clearCartCancel") }}
            </Button>
            <Button variant="destructive" @click="removeAccessCode">
              {{ t("tickets.removeAccessConfirm") }}
            </Button>
          </div>
        </div>
      </template>
    </ResponsiveDialog>

    <!-- Per-ticket terms (staff-managed HTML, localized by the API). The
         header stays put while long terms scroll underneath it. -->
    <ResponsiveDialog
      v-model:open="termsOpen"
      :title="t('tickets.ticketTerms')"
      :description="termsTicket?.title"
      :overflow-content="true"
      dialog-max-width="40rem"
    >
      <template #sticky-header>
        <div
          aria-hidden="true"
          class="border-border sticky top-0 z-10 border-b px-4 pt-5 pb-2 text-center md:px-6 md:py-3.5 md:pr-14 md:text-left"
        >
          <div
            class="text-foreground text-lg font-semibold tracking-tighter text-balance"
          >
            {{ t("tickets.ticketTerms") }}
          </div>
          <p class="text-muted-foreground mt-0.5 text-sm tracking-tight">
            {{ termsTicket?.title }}
          </p>
        </div>
      </template>
      <template #default>
        <!-- Same body as the checkout's terms dialog (pages/tickets/checkout.vue):
             the house typeset-cms preset, untouched. -->
        <div class="space-y-4 px-4 pt-5 pb-8 md:px-6 md:py-5">
          <div
            v-html="termsTicket?.terms"
            class="typeset typeset-cms max-w-none tracking-tight"
          ></div>
          <div class="flex justify-end pt-1">
            <Button size="sm" @click="termsOpen = false">
              {{ t("tickets.termsClose") }}
            </Button>
          </div>
        </div>
      </template>
    </ResponsiveDialog>

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

    <div v-else class="grid grid-cols-1 gap-y-10 lg:gap-y-12">
      <!-- Entry tickets -->
      <section v-if="entryTickets.length" id="entry-tickets">
        <div class="flex flex-col items-center gap-y-1 text-center sm:gap-y-3">
          <h2
            class="text-foreground text-3xl font-semibold tracking-tighter sm:text-4xl"
          >
            {{ t("tickets.entryTitle") }}
          </h2>
          <p class="text-foreground tracking-tight text-balance max-sm:text-muted-foreground">
            {{ t("tickets.entrySubtitle", { event: event.title }) }}
          </p>
        </div>

        <div
          class="mx-auto mt-4 grid grid-cols-1 gap-4 sm:mt-6"
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
                      class="group bg-muted border-border relative block w-12 shrink-0 cursor-zoom-in overflow-hidden rounded-lg lg:w-14"
                      :style="{ aspectRatio: posterAspectRatio(ticket) }"
                      :aria-label="ticket.title"
                      @click="openAt(0)"
                    >
                      <img
                        :src="posterSrc(ticket)"
                        :alt="ticket.title"
                        class="outline-inside size-full rounded-lg object-cover"
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
                <div class="flex flex-col items-start gap-y-0.5">
                  <p
                    class="text-foreground line-clamp-2 text-sm font-semibold tracking-tight"
                  >
                    {{ ticket.title }}
                  </p>
                  <!-- Staff preview only: this ticket is buyable here because
                       of ?force-checkout-ticket, not because it is on sale. -->
                  <Badge
                    v-if="isSwitchedOffInPreview(ticket)"
                    variant="warning"
                    icon="hugeicons:view-off"
                  >
                    Inactive
                  </Badge>
                  <!-- Sale countdown stays under the title. tabular-nums on the
                       HH:MM:SS digits (Countdown.vue) keeps the per-second width
                       constant, so the line never flips between one and two lines
                       as the seconds tick. -->
                  <!-- A phase sold out and the next not open yet: name the
                       phase that ran out instead of counting down, so the card
                       never reads as the next phase being sold out too. -->
                  <p
                    v-if="phaseSoldOut(ticket)"
                    class="text-muted-foreground text-sm tracking-tight"
                  >
                    {{ phaseSoldOutText(ticket) }}
                  </p>
                  <Countdown
                    v-else-if="ticket.sales_starts_at"
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
                  :icon="ticket.tier_icon || undefined"
                >
                  {{ ticket.tier }}
                </Badge>
              </div>

              <!-- The four rows of the card sit 16px apart as ink, not as
                   boxes: a text block carries a couple of pixels of leading
                   above its first line, so its margin is trimmed by that much
                   (16 - 2 here, 16 - 4 on the day picker below). -->
              <div
                v-if="ticket.benefits && ticket.benefits.length"
                class="mt-3.5 flex flex-col gap-y-1"
              >
                <div
                  v-for="(benefit, i) in ticket.benefits"
                  :key="i"
                  class="flex gap-x-1.5"
                >
                  <!-- Icon box = one text line (h-5 vs 21px line-height at
                       text-sm/leading-normal), so the check sits on the first
                       line's optical centre even when the benefit wraps. -->
                  <Icon
                    name="lucide:check"
                    class="text-success-foreground h-5 shrink-0"
                  />
                  <span class="text-sm leading-normal! tracking-tight">
                    {{ benefit }}
                  </span>
                </div>
              </div>

              <!-- The ticket's own terms sit behind a link: long enough to
                   swamp the card. One dialog serves every card (openTerms).
                   px-2 cancelled by -ml-2 starts the text on the content's
                   edge whatever the style's sm padding; self-start keeps the
                   column's flex stretch off it. -->
              <Button
                v-if="ticket.terms"
                variant="ghost"
                size="sm"
                aria-haspopup="dialog"
                class="mt-2.5 -ml-2 self-start px-2"
                @click="openTerms(ticket)"
              >
                {{ t("tickets.ticketTerms") }}
              </Button>

              <!-- Day picker: a Day Pass is valid on many days but the buyer
                   chooses one. Switching the day starts a fresh cart line.
                   <=4 days use pill toggles; more use a date picker locked to
                   the valid days. -->
              <div
                v-if="requiresDayPick(ticket) && isBuyable(ticket)"
                class="mt-3 space-y-1.5"
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
                  class="gap-x-1.5 gap-y-2"
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
                    class="pl-2 pr-3"
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
                    :class="{
                      'ring-primary ring-1': selectedDay[ticket.id] === line.id,
                    }"
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
                <div class="min-w-0">
                  <!-- The payable price owns the LEADING edge here, because this
                       block is left-aligned - the struck one follows it. In the
                       checkout summary the same pair is reversed, for the same
                       reason: that column is right-aligned, so the edge the eye
                       and the numbers line up on is the trailing one, and it has
                       to belong to the amount being charged either way. -->
                  <div class="flex flex-nowrap items-baseline gap-x-2">
                    <!-- Always foreground. Muting the price while a phase is
                       merely upcoming made the one number the card exists to
                       show the faintest thing on it, and "Coming soon" plus the
                       countdown already say the sale has not opened. -->
                    <span
                      class="text-foreground shrink-0 text-base font-semibold tracking-tighter"
                    >
                      {{ priceLabel(ticket) }}
                    </span>
                    <!-- The full price this ticket eventually sells at. The API
                       sends it only while the current phase is actually cheaper,
                       so a pre-sale price reads as the discount it is instead of
                       as the only price there has ever been. After a phase sells
                       out it is the next phase's price instead. -->
                    <span
                      v-if="struckPrice(ticket)"
                      class="text-destructive-foreground min-w-0 truncate text-sm tracking-tight tabular-nums line-through"
                    >
                      {{ fmtIdr(struckPrice(ticket)) }}
                    </span>
                  </div>
                  <p
                    v-if="perEmailNote(ticket)"
                    class="text-muted-foreground mt-0.5 text-sm leading-snug tracking-tight"
                  >
                    {{ perEmailNote(ticket) }}
                  </p>
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
                       opened yet still linked out. soldOut() likewise: an
                       organizer's manual sold-out flag has to fall through to
                       the Sold out button, not keep the buy link.
                       rel="noopener" is not optional - target="_blank" alone
                       hands a third-party platform this page's window.opener. -->
                  <Button
                    v-else-if="
                      ticket.purchase_type === 'external' &&
                      ticket.external_url &&
                      saleOpen(ticket) &&
                      !soldOut(ticket)
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
                    :add-icon="registersOnce(ticket) ? '' : 'hugeicons:plus-sign'"
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
                    :class="
                      unavailableState(ticket) === 'sold_out' &&
                      'border-destructive-foreground/20 bg-destructive/10 text-destructive-foreground hover:bg-destructive/15'
                    "
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
        <div class="flex flex-col items-center gap-y-1 text-center sm:gap-y-3">
          <h2
            class="text-foreground text-3xl font-semibold tracking-tighter sm:text-4xl"
          >
            {{ t("tickets.addOnTitle") }}
          </h2>
          <p class="text-foreground tracking-tight text-balance max-sm:text-muted-foreground">
            {{ t("tickets.addOnSubtitle") }}
          </p>
        </div>

        <div
          class="mx-auto mt-4 grid grid-cols-1 gap-4 sm:mt-6"
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
                      class="group bg-muted border-border relative block w-12 shrink-0 cursor-zoom-in overflow-hidden rounded-lg lg:w-14"
                      :style="{ aspectRatio: posterAspectRatio(ticket) }"
                      :aria-label="ticket.title"
                      @click="openAt(0)"
                    >
                      <img
                        :src="posterSrc(ticket)"
                        :alt="ticket.title"
                        class="outline-inside size-full rounded-lg object-cover"
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
                <div class="flex flex-col items-start gap-y-0.5">
                  <p
                    class="text-foreground line-clamp-2 text-sm font-semibold tracking-tight"
                  >
                    {{ ticket.title }}
                  </p>
                  <!-- An add-on names its token right under the title, plain
                       (no pill), so it reads as what the ticket is rather than
                       as one more tag among the badges below. -->
                  <Badge
                    v-if="ticket.tier"
                    variant="outline"
                    plain
                    :icon="ticket.tier_icon || undefined"
                  >
                    {{ ticket.tier }}
                  </Badge>
                  <!-- Staff preview only: this ticket is buyable here because
                       of ?force-checkout-ticket, not because it is on sale. -->
                  <Badge
                    v-if="isSwitchedOffInPreview(ticket)"
                    variant="warning"
                    icon="hugeicons:view-off"
                  >
                    Inactive
                  </Badge>
                  <!-- Sale countdown stays under the title. tabular-nums on the
                       HH:MM:SS digits (Countdown.vue) keeps the per-second width
                       constant, so the line never flips between one and two lines
                       as the seconds tick. -->
                  <!-- A phase sold out and the next not open yet: name the
                       phase that ran out instead of counting down, so the card
                       never reads as the next phase being sold out too. -->
                  <p
                    v-if="phaseSoldOut(ticket)"
                    class="text-muted-foreground text-sm tracking-tight"
                  >
                    {{ phaseSoldOutText(ticket) }}
                  </p>
                  <Countdown
                    v-else-if="ticket.sales_starts_at"
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
                v-if="ticket.day_pass || ticket.entrance"
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
              </div>

              <div
                v-if="ticket.benefits && ticket.benefits.length"
                class="mt-3.5 flex flex-col gap-y-1"
              >
                <div
                  v-for="(benefit, i) in ticket.benefits"
                  :key="i"
                  class="flex gap-x-1.5"
                >
                  <!-- Icon box = one text line (h-5 vs 21px line-height at
                       text-sm/leading-normal), so the check sits on the first
                       line's optical centre even when the benefit wraps. -->
                  <Icon
                    name="lucide:check"
                    class="text-success-foreground h-5 shrink-0"
                  />
                  <span class="text-sm leading-normal! tracking-tight">
                    {{ benefit }}
                  </span>
                </div>
              </div>

              <!-- Time-slot picker (add-ons with more than one session) -->
              <div
                v-if="sessionsFor(ticket).length > 1 && isBuyable(ticket)"
                class="mt-3 space-y-1.5"
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

              <!-- Read-only schedule whenever there is nothing to pick here:
                   an external ticket (the session is chosen on the other
                   store), a sale that has not opened, or a single session. -->
              <TicketSessionList
                v-else-if="sessionsFor(ticket).length"
                :sessions="sessionsFor(ticket)"
                class="mt-4"
              />

              <!-- The ticket's own terms sit behind a link: long enough to
                   swamp the card. One dialog serves every card (openTerms).
                   px-2 cancelled by -ml-2 starts the text on the content's
                   edge whatever the style's sm padding; self-start keeps the
                   column's flex stretch off it. -->
              <Button
                v-if="ticket.terms"
                variant="ghost"
                size="sm"
                aria-haspopup="dialog"
                class="mt-2.5 -ml-2 self-start px-2"
                @click="openTerms(ticket)"
              >
                {{ t("tickets.ticketTerms") }}
              </Button>
            </div>

            <template #footer>
              <div
                class="relative flex grow-0 items-center justify-between gap-x-3 px-5 py-3 sm:px-8 sm:py-4"
              >
                <div class="min-w-0">
                  <!-- The payable price owns the LEADING edge here, because this
                       block is left-aligned - the struck one follows it. In the
                       checkout summary the same pair is reversed, for the same
                       reason: that column is right-aligned, so the edge the eye
                       and the numbers line up on is the trailing one, and it has
                       to belong to the amount being charged either way. -->
                  <div class="flex flex-nowrap items-baseline gap-x-2">
                    <!-- Always foreground. Muting the price while a phase is
                       merely upcoming made the one number the card exists to
                       show the faintest thing on it, and "Coming soon" plus the
                       countdown already say the sale has not opened. -->
                    <span
                      class="text-foreground shrink-0 text-base font-semibold tracking-tighter"
                    >
                      {{ priceLabel(ticket) }}
                    </span>
                    <!-- The full price this ticket eventually sells at. The API
                       sends it only while the current phase is actually cheaper,
                       so a pre-sale price reads as the discount it is instead of
                       as the only price there has ever been. After a phase sells
                       out it is the next phase's price instead. -->
                    <span
                      v-if="struckPrice(ticket)"
                      class="text-destructive-foreground min-w-0 truncate text-sm tracking-tight tabular-nums line-through"
                    >
                      {{ fmtIdr(struckPrice(ticket)) }}
                    </span>
                  </div>
                  <p
                    v-if="perEmailNote(ticket)"
                    class="text-muted-foreground mt-0.5 text-sm leading-snug tracking-tight"
                  >
                    {{ perEmailNote(ticket) }}
                  </p>
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
                      saleOpen(ticket) &&
                      !soldOut(ticket)
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
                    </a>
                  </Button>

                  <TicketCardQuantity
                    v-else-if="canBuyNow(ticket)"
                    :qty="qtyOf(ticket)"
                    :at-max="atMax(ticket)"
                    :single="isSingle(ticket)"
                    :dimmed="!canAdd(ticket)"
                    :add-label="addCtaLabel(ticket)"
                    :add-icon="registersOnce(ticket) ? '' : 'hugeicons:plus-sign'"
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
                    :class="
                      unavailableState(ticket) === 'sold_out' &&
                      'border-destructive-foreground/20 bg-destructive/10 text-destructive-foreground hover:bg-destructive/15'
                    "
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
