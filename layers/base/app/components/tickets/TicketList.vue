<script setup>
import { computed, onMounted, reactive, ref } from "vue";
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
import { Toggle } from "../ui/toggle";
import TicketListSkeleton from "./TicketListSkeleton.vue";
import TicketSlotPicker from "./TicketSlotPicker.vue";
import TicketStub from "./TicketStub.vue";

const props = defineProps({
  eventSlug: { type: String, required: true },
});

const { t, locale } = useI18n();
const { $dayjs } = useNuxtApp();
const localePath = useLocalePath();
const route = useRoute();
const cart = useTicketCartStore();
const event = useEvent();
const accessCodeErrors = useAccessCodeErrors();

// Tickets always come from PM One; there is no static fallback. The locale is
// forwarded so ticket copy + meta.terms come back localized. On failure we show
// a clear error/empty state rather than fabricating ticket data.
const { data, pending, error, refresh } = await useFetch(
  () => `/api/tickets/${props.eventSlug}`,
  {
    key: () => `tickets-${props.eventSlug}-${locale.value}`,
    query: { locale },
    watch: [locale, () => props.eventSlug],
    default: () => null,
  },
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

onMounted(() => {
  cart.hydrate();
  cart.setEventContext({ eventId: event.id, eventSlug: props.eventSlug });

  // Auto-apply a code from a magic invite link (?invite=XXXX) or a persisted cart.
  const invite = route.query.invite || route.query.code;
  const initial = (typeof invite === "string" && invite) || cart.accessCode;
  if (initial) {
    accessCodeInput.value = String(initial);
    applyAccessCode(String(initial));
  }
});

const fmtRupiah = (n) => new Intl.NumberFormat("id-ID").format(Number(n) || 0);

// Responsive conversion for the poster lightbox: mobile reuses the same `md` conversion
// already shown in the trigger thumbnail (instant, no extra download), while larger
// screens load progressively bigger versions.
const posterFullKey = { base: "md", sm: "lg", xl: "xl" };

// A single-image lightbox payload for a ticket poster (opens the larger image).
function posterLightboxItems(ticket) {
  const p = ticket.poster;
  if (!p) return [];
  return [
    {
      sm: p.sm,
      md: p.md,
      lg: p.lg,
      xl: p.xl,
      url: p.url,
      alt: ticket.title,
      caption: ticket.title,
    },
  ];
}

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

// A day pass with a single valid day needs no picker - that day is implied.
function requiresDayPick(ticket) {
  return !!ticket.requires_day_selection && daysFor(ticket).length > 1;
}

function resolveDayId(ticket) {
  if (!ticket.requires_day_selection) return null;
  const days = daysFor(ticket);
  if (days.length <= 1) return days[0]?.id ?? null;
  return selectedDay[ticket.id] ?? null;
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

function maxFor(ticket) {
  const caps = [ticket.max_quantity];
  if (ticket.available != null) caps.push(ticket.available);
  const valid = caps.filter((n) => n != null && Number(n) > 0);
  return valid.length ? Math.min(...valid) : 50;
}

function minFor(ticket) {
  return Math.max(1, Number(ticket.min_quantity) || 1);
}

function qtyOf(ticket) {
  return cart.qtyFor(ticket.id, resolveSessionId(ticket), resolveDayId(ticket));
}

function soldOut(ticket) {
  return ticket.available != null && ticket.available <= 0;
}

// A ticket is buyable (so the Add button + day/session pickers make sense) only
// when it is a first-party ticket whose sale phase is live, with stock left and
// not gated behind an access code.
function isBuyable(ticket) {
  return (
    ticket.purchase_type === "first_party" &&
    ticket.on_sale &&
    !soldOut(ticket) &&
    !isLocked(ticket)
  );
}

function canAdd(ticket) {
  if (isLocked(ticket)) return false;
  if (soldOut(ticket)) return false;
  const sessions = sessionsFor(ticket);
  if (sessions.length > 1 && !selectedSession[ticket.id]) return false;
  if (requiresDayPick(ticket) && !selectedDay[ticket.id]) return false;
  return true;
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
  if (next > maxFor(ticket)) return;
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

// Price stays a price: the live phase price when on sale, otherwise a muted
// preview of the upcoming phase. Status words ("Coming soon"/"Sold out") never
// appear here - they live on the action button instead.
function priceLabel(ticket) {
  const price = ticket.on_sale ? ticket.price : ticket.display_price;
  if (price == null) return "";
  return price > 0 ? `Rp${fmtRupiah(price)}` : t("tickets.free");
}

// Status label that replaces the Add button when a ticket can't be bought now.
// "Sold out" and "Sales ended" (closed) are distinct from "Coming soon" (an
// upcoming sale phase).
function unavailableLabel(ticket) {
  if (soldOut(ticket)) return t("tickets.soldOut");
  if (ticket.sales_status === "upcoming") return t("tickets.comingSoon");
  return t("tickets.salesEnded");
}

function onUnavailableClick(ticket) {
  if (soldOut(ticket)) {
    toast.error(t("tickets.soldOutToast"));
    return;
  }
  if (ticket.sales_status === "upcoming") {
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

// A full page is a better purchase surface than a modal (esp. on mobile), so
// the cart bar now routes to the dedicated checkout page. The cart is persisted,
// so the page picks it up after navigation.
function goToCheckout() {
  if (cart.isEmpty) return;
  cart.setEventContext({ eventId: event.id, eventSlug: props.eventSlug });
  navigateTo(localePath("/tickets/checkout"));
}

// --- Floating cart bar: tap (anywhere but Checkout) expands the line detail ---
const cartExpanded = ref(false);
function toggleCartDetail() {
  cartExpanded.value = !cartExpanded.value;
}

const ticketsById = computed(() => {
  const byId = new Map();
  for (const tk of mergedTickets.value) {
    byId.set(tk.id, tk);
  }
  return byId;
});

// A concise "Day · Session" sub-label for a cart line, built from the same
// valid_days / sessions the picker uses (omitted when neither applies).
function cartLineSubLabel(ticket, item) {
  if (!ticket) return "";
  const parts = [];
  const day = (ticket.valid_days ?? []).find(
    (d) => d.id === item.selected_event_day_id,
  );
  if (day?.date) {
    parts.push($dayjs(day.date).format("ddd, D MMM"));
  }
  const session = (ticket.sessions ?? []).find(
    (s) => s.id === item.ticket_session_id,
  );
  if (session?.label) {
    parts.push(session.label);
  }
  return parts.join(" · ");
}

// Cart lines resolved against the loaded tickets so the detail panel can show
// titles + prices (the store itself only keeps ids + quantities).
const cartLines = computed(() =>
  cart.items.map((item) => {
    const ticket = ticketsById.value.get(item.ticket_id) ?? null;
    const unit = ticket
      ? ticket.on_sale
        ? ticket.price
        : ticket.display_price
      : 0;
    const qty = Number(item.qty) || 0;
    const lineTotal = (Number(unit) || 0) * qty;
    return {
      key: `${item.ticket_id}:${item.ticket_session_id ?? "x"}:${item.selected_event_day_id ?? "x"}`,
      item,
      title: ticket?.title ?? "—",
      subLabel: cartLineSubLabel(ticket, item),
      qty,
      lineTotal,
      priceLabel:
        lineTotal > 0 ? `Rp${fmtRupiah(lineTotal)}` : t("tickets.free"),
    };
  }),
);

const cartSubtotal = computed(() =>
  cartLines.value.reduce((sum, line) => sum + line.lineTotal, 0),
);
const subtotalLabel = computed(() =>
  cartSubtotal.value > 0
    ? `Rp${fmtRupiah(cartSubtotal.value)}`
    : t("tickets.free"),
);
</script>

<template>
  <!-- Loading: a skeleton shaped like the real ticket cards -->
  <TicketListSkeleton v-if="pending" />

  <!-- Load failure or ticketing not enabled. We never fabricate ticket data:
       a real failure is retryable, a disabled event reads as "coming soon". -->
  <div v-else-if="error" class="container">
    <Empty class="border-border bg-muted/30 mx-auto max-w-md border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon
            :name="
              ticketsDisabled ? 'hugeicons:ticket-01' : 'hugeicons:alert-02'
            "
            :class="
              ticketsDisabled ? 'text-muted-foreground' : 'text-destructive'
            "
          />
        </EmptyMedia>
        <EmptyTitle>
          {{
            ticketsDisabled
              ? t("tickets.unavailableTitle")
              : t("tickets.loadErrorTitle")
          }}
        </EmptyTitle>
        <EmptyDescription>
          {{
            ticketsDisabled
              ? t("tickets.unavailableDescription")
              : t("tickets.loadErrorDescription")
          }}
        </EmptyDescription>
      </EmptyHeader>
      <Button
        v-if="!ticketsDisabled"
        variant="outline"
        :disabled="pending"
        @click="refresh()"
      >
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
          <p class="text-primary text-sm font-medium tracking-tight">
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
            class="bg-destructive/10 text-destructive flex items-start gap-1.5 rounded-md px-3 py-2 text-xs tracking-tight"
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
    <Empty
      v-if="!entryTickets.length && !addOnTickets.length"
      class="border-border bg-muted/30 mx-auto max-w-md border"
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon name="hugeicons:ticket-01" class="text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle>{{ t("tickets.emptyTitle") }}</EmptyTitle>
        <EmptyDescription>{{ t("tickets.noTickets") }}</EmptyDescription>
      </EmptyHeader>
    </Empty>

    <div v-else class="grid grid-cols-1 gap-y-10 lg:gap-y-16">
      <!-- Entry tickets -->
      <section v-if="entryTickets.length" id="entry-tickets">
        <div class="flex flex-col items-center gap-y-3 text-center">
          <h2
            class="text-primary text-3xl font-semibold tracking-tighter sm:text-4xl"
          >
            {{ t("tickets.entryTitle") }}
          </h2>
          <p class="text-primary tracking-tight text-balance">
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
                  :full-key="posterFullKey"
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
                        :src="
                          ticket.poster.md ||
                          ticket.poster.sm ||
                          ticket.poster.lg ||
                          ticket.poster.url
                        "
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
                    class="text-primary line-clamp-2 text-sm font-semibold tracking-tight"
                  >
                    {{ ticket.title }}
                  </p>
                  <!-- Sale countdown stays under the title. tabular-nums on the
                       HH:MM:SS digits (Countdown.vue) keeps the per-second width
                       constant, so the line never flips between one and two lines
                       as the seconds tick. -->
                  <Countdown
                    v-if="ticket.sales_starts_at"
                    variant="no-style"
                    class="text-muted-foreground text-xs tracking-tight sm:text-sm"
                    :text-before-countdown="phasePrefix(ticket, 'start')"
                    :countdown-date="new Date(ticket.sales_starts_at)"
                    v-tippy="
                      $dayjs(ticket.sales_starts_at).format(
                        'MMMM D, YYYY [at] h:mm A',
                      )
                    "
                  />
                  <Countdown
                    v-else-if="ticket.sales_ends_at"
                    variant="no-style"
                    class="text-muted-foreground text-xs tracking-tight sm:text-sm"
                    :text-before-countdown="phasePrefix(ticket, 'end')"
                    :countdown-date="new Date(ticket.sales_ends_at)"
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
                  class="text-muted-foreground text-xs font-medium tracking-tight sm:text-sm"
                >
                  {{ t("tickets.chooseDay") }}
                </p>
                <div
                  v-if="daysFor(ticket).length <= 4"
                  class="flex flex-wrap gap-2"
                >
                  <Toggle
                    v-for="d in daysFor(ticket)"
                    :key="d.id"
                    variant="pill"
                    indicator
                    :model-value="selectedDay[ticket.id] === d.id"
                    @update:model-value="
                      () =>
                        (selectedDay[ticket.id] =
                          selectedDay[ticket.id] === d.id ? null : d.id)
                    "
                  >
                    {{ formatWeekdayDate(d.date, locale) }}
                  </Toggle>
                </div>
                <DatePicker
                  v-else
                  :model-value="selectedDayDate(ticket)"
                  :allowed-dates="dayDates(ticket)"
                  :placeholder-date="dayDates(ticket)[0] || null"
                  :placeholder="t('tickets.selectDay')"
                  class="w-full"
                  @update:model-value="(v) => onDayDatePick(ticket, v)"
                />
              </div>
            </div>

            <template #footer>
              <div
                class="relative flex grow-0 items-center justify-between gap-x-3 px-5 py-3 sm:px-8 sm:py-4"
              >
                <div class="flex flex-col">
                  <span
                    class="text-base font-semibold tracking-tighter"
                    :class="
                      ticket.on_sale ? 'text-primary' : 'text-muted-foreground'
                    "
                  >
                    {{ priceLabel(ticket) }}
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

                  <!-- External purchase -->
                  <Button
                    v-else-if="
                      ticket.purchase_type === 'external' && ticket.external_url
                    "
                    as-child
                    size="sm"
                  >
                    <a :href="ticket.external_url">{{
                      t("tickets.getTicket")
                    }}</a>
                  </Button>

                  <!-- First-party, on sale, in stock -->
                  <template
                    v-else-if="
                      ticket.purchase_type === 'first_party' &&
                      ticket.on_sale &&
                      !soldOut(ticket)
                    "
                  >
                    <div
                      v-if="qtyOf(ticket) > 0"
                      class="flex items-center gap-1.5"
                    >
                      <button
                        type="button"
                        class="border-border hover:bg-muted focus-visible:ring-ring flex size-8 items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none"
                        :aria-label="t('tickets.decreaseQty')"
                        @click="dec(ticket)"
                      >
                        <Icon name="hugeicons:minus-sign" class="size-4" />
                      </button>
                      <span
                        class="min-w-6 text-center text-sm font-medium tabular-nums"
                      >
                        {{ qtyOf(ticket) }}
                      </span>
                      <button
                        type="button"
                        class="border-border hover:bg-muted focus-visible:ring-ring flex size-8 items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                        :disabled="qtyOf(ticket) >= maxFor(ticket)"
                        :aria-label="t('tickets.increaseQty')"
                        @click="inc(ticket)"
                      >
                        <Icon name="hugeicons:plus-sign" class="size-4" />
                      </button>
                    </div>
                    <Button
                      v-else
                      size="sm"
                      :class="{ 'opacity-60': !canAdd(ticket) }"
                      @click="addToCart(ticket)"
                    >
                      <Icon
                        name="hugeicons:plus-sign"
                        class="size-4 shrink-0"
                      />
                      {{ t("tickets.add") }}
                    </Button>
                  </template>

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
                        soldOut(ticket)
                          ? 'hugeicons:ticket-02'
                          : ticket.sales_status === 'upcoming'
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
            class="text-primary text-3xl font-semibold tracking-tighter sm:text-4xl"
          >
            {{ t("tickets.addOnTitle") }}
          </h2>
          <p class="text-primary tracking-tight text-balance">
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
                  :full-key="posterFullKey"
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
                        :src="
                          ticket.poster.md ||
                          ticket.poster.sm ||
                          ticket.poster.lg ||
                          ticket.poster.url
                        "
                        :alt="ticket.title"
                        class="size-full object-cover"
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
                    class="text-primary line-clamp-2 text-sm font-semibold tracking-tight"
                  >
                    {{ ticket.title }}
                  </p>
                  <!-- Sale countdown stays under the title. tabular-nums on the
                       HH:MM:SS digits (Countdown.vue) keeps the per-second width
                       constant, so the line never flips between one and two lines
                       as the seconds tick. -->
                  <Countdown
                    v-if="ticket.sales_starts_at"
                    variant="no-style"
                    class="text-muted-foreground text-xs tracking-tight sm:text-sm"
                    :text-before-countdown="phasePrefix(ticket, 'start')"
                    :countdown-date="new Date(ticket.sales_starts_at)"
                    v-tippy="
                      $dayjs(ticket.sales_starts_at).format(
                        'MMMM D, YYYY [at] h:mm A',
                      )
                    "
                  />
                  <Countdown
                    v-else-if="ticket.sales_ends_at"
                    variant="no-style"
                    class="text-muted-foreground text-xs tracking-tight sm:text-sm"
                    :text-before-countdown="phasePrefix(ticket, 'end')"
                    :countdown-date="new Date(ticket.sales_ends_at)"
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
                <div class="flex flex-col">
                  <span
                    class="text-base font-semibold tracking-tighter"
                    :class="
                      ticket.on_sale ? 'text-primary' : 'text-muted-foreground'
                    "
                  >
                    {{ priceLabel(ticket) }}
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
                      ticket.purchase_type === 'external' && ticket.external_url
                    "
                    as-child
                    size="sm"
                  >
                    <a :href="ticket.external_url">{{
                      t("tickets.getTicket")
                    }}</a>
                  </Button>

                  <template
                    v-else-if="
                      ticket.purchase_type === 'first_party' &&
                      ticket.on_sale &&
                      !soldOut(ticket)
                    "
                  >
                    <div
                      v-if="qtyOf(ticket) > 0"
                      class="flex items-center gap-1.5"
                    >
                      <button
                        type="button"
                        class="border-border hover:bg-muted focus-visible:ring-ring flex size-8 items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none"
                        :aria-label="t('tickets.decreaseQty')"
                        @click="dec(ticket)"
                      >
                        <Icon name="hugeicons:minus-sign" class="size-4" />
                      </button>
                      <span
                        class="min-w-6 text-center text-sm font-medium tabular-nums"
                      >
                        {{ qtyOf(ticket) }}
                      </span>
                      <button
                        type="button"
                        class="border-border hover:bg-muted focus-visible:ring-ring flex size-8 items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                        :disabled="qtyOf(ticket) >= maxFor(ticket)"
                        :aria-label="t('tickets.increaseQty')"
                        @click="inc(ticket)"
                      >
                        <Icon name="hugeicons:plus-sign" class="size-4" />
                      </button>
                    </div>
                    <Button
                      v-else
                      size="sm"
                      :class="{ 'opacity-60': !canAdd(ticket) }"
                      @click="addToCart(ticket)"
                    >
                      <Icon
                        name="hugeicons:plus-sign"
                        class="size-4 shrink-0"
                      />
                      {{ t("tickets.add") }}
                    </Button>
                  </template>

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
                        soldOut(ticket)
                          ? 'hugeicons:ticket-02'
                          : ticket.sales_status === 'upcoming'
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

    <!-- Sticky cart bar -->
    <Transition
      enter-active-class="transition-[translate,opacity,filter] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
      leave-active-class="transition-[translate,opacity,filter] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
      enter-from-class="translate-y-4 opacity-0 blur-[2px]"
      leave-to-class="translate-y-4 opacity-0 blur-[2px]"
    >
      <div
        v-if="!cart.isEmpty"
        class="fixed inset-x-0 bottom-0 z-40 px-2 pb-4 sm:px-6"
      >
        <!-- Inverted "contrast" pill: bg-foreground/text-background flips with the
             theme, so it stays high-contrast in light AND dark mode. Tapping the
             bar anywhere but Checkout expands the line detail (transitions-dev:
             accordion expand, growing upward from this bottom-anchored bar). -->
        <div
          class="t-acc bg-foreground text-background ring-foreground/10 mx-auto w-full max-w-xl overflow-hidden p-1.5 shadow-lg ring-1 ring-white/20 transition-[border-radius,padding] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          :class="cartExpanded ? 'rounded-3xl sm:p-4' : 'rounded-4xl'"
          :data-open="cartExpanded"
        >
          <!-- Collapsible detail, above the action row -->
          <div class="t-acc-panel">
            <div class="t-acc-panel-inner">
              <div class="px-2.5 pt-1.5 pb-3">
                <ul class="divide-background/10 flex flex-col divide-y">
                  <li
                    v-for="line in cartLines"
                    :key="line.key"
                    class="flex items-center gap-3 py-2"
                  >
                    <span
                      class="bg-background/15 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium tabular-nums sm:text-sm"
                      aria-hidden="true"
                    >
                      {{ line.qty }}
                    </span>
                    <div class="min-w-0 flex-1 leading-tight">
                      <p
                        class="truncate text-sm font-medium tracking-tight sm:text-base"
                      >
                        {{ line.title }}
                      </p>
                      <p
                        v-if="line.subLabel"
                        class="text-background/80 truncate text-xs tracking-tight sm:text-sm"
                      >
                        {{ line.subLabel }}
                      </p>
                    </div>
                    <span
                      class="shrink-0 text-sm font-medium tabular-nums sm:text-base"
                      >{{ line.priceLabel }}</span
                    >
                    <button
                      type="button"
                      class="text-background/50 hover:text-background hover:bg-background/15 focus-visible:ring-background/40 -mr-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
                      :aria-label="t('tickets.remove')"
                      @click="
                        cart.removeItem(
                          line.item.ticket_id,
                          line.item.ticket_session_id,
                          line.item.selected_event_day_id,
                        )
                      "
                    >
                      <Icon name="hugeicons:cancel-01" class="size-4" />
                    </button>
                  </li>
                </ul>
                <div
                  class="border-background/10 mt-1 flex items-center border-t pt-3"
                >
                  <button
                    type="button"
                    class="text-background/70 hover:text-background focus-visible:ring-background/40 inline-flex items-center gap-1.5 rounded-full text-sm font-medium tracking-tight transition-colors focus-visible:ring-2 focus-visible:outline-none sm:text-base"
                    @click="cart.clear()"
                  >
                    <Icon
                      name="hugeicons:delete-01"
                      class="size-4 shrink-0 sm:size-5"
                    />
                    {{ t("tickets.clearCart") }}
                  </button>
                  <!-- Mirror the line item's trailing [price][gap-3][size-7 -mr-1] so the
                       total's price right-edge aligns with each item's price. -->
                  <div class="flex flex-1 items-center justify-end gap-3">
                    <p class="leading-tight">
                      <span
                        class="text-background/80 text-xs tracking-tight sm:text-sm"
                        >{{ t("tickets.subtotal") }}</span
                      >
                      <span
                        class="ml-2 text-sm font-semibold tabular-nums sm:text-base"
                        >{{ subtotalLabel }}</span
                      >
                    </p>
                    <span class="-mr-1 size-7 shrink-0" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action row (always visible). The toggle covers everything but the
               Clear + Checkout buttons. -->
          <div class="flex items-center gap-x-1.5">
            <button
              type="button"
              class="hover:bg-background/10 focus-visible:bg-background/10 flex flex-1 items-center gap-2.5 rounded-[1.4rem] text-left transition-colors focus-visible:outline-none"
              :aria-expanded="cartExpanded"
              @click="toggleCartDetail"
            >
              <span
                class="flex h-full min-w-0 items-center justify-center truncate rounded-full px-2.5 py-2.5 text-sm font-medium tracking-tight sm:px-3 sm:text-base"
                aria-live="polite"
              >
                <!-- NumberFlow drops into the {count} slot, so the animated digit
                     keeps each locale's word order (incl. mid-string CJK forms). -->
                <i18n-t
                  keypath="tickets.selected"
                  :plural="cart.count"
                  tag="span"
                  scope="global"
                  class="whitespace-nowrap"
                >
                  <template #count>
                    <NumberFlow :value="cart.count" class="tabular-nums" />
                  </template>
                </i18n-t>
              </span>
              <span
                class="t-acc-chevron bg-background/10 text-background/70 ml-auto flex size-9 shrink-0 items-center justify-center rounded-full"
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="size-4 sm:size-5"
                >
                  <path d="M4 10L8 6L12 10" />
                </svg>
              </span>
            </button>
            <button
              type="button"
              class="bg-destructive/15 text-destructive hover:bg-destructive/25 focus-visible:ring-destructive/40 inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
              :aria-label="t('tickets.clearCart')"
              @click="cart.clear()"
            >
              <Icon name="hugeicons:delete-01" class="size-4 sm:size-5" />
            </button>
            <button
              type="button"
              class="bg-background text-foreground hover:bg-background/90 focus-visible:ring-background/50 inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium tracking-tight transition focus-visible:ring-2 focus-visible:outline-none active:scale-98 sm:text-base"
              @click="goToCheckout"
            >
              <Icon
                name="hugeicons:shopping-cart-01"
                class="size-4 shrink-0 sm:size-5"
              />
              {{ t("tickets.checkout") }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* transitions-dev: accordion expand. Height animates via grid-template-rows
   0fr -> 1fr (no JS height measuring); the chevron flips vertically. Motion
   tokens are scoped to .t-acc so they don't leak into the global :root. */
.t-acc {
  --acc-expand: 250ms;
  --acc-collapse: 250ms;
  --acc-chevron: 250ms;
  --acc-ease: cubic-bezier(0.22, 1, 0.36, 1);
}
.t-acc-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--acc-collapse) var(--acc-ease);
}
.t-acc[data-open="true"] .t-acc-panel {
  grid-template-rows: 1fr;
  transition: grid-template-rows var(--acc-expand) var(--acc-ease);
}
.t-acc-panel-inner {
  overflow: hidden;
  opacity: 0;
  filter: blur(2px);
  transition:
    opacity var(--acc-collapse) var(--acc-ease),
    filter var(--acc-collapse) var(--acc-ease);
}
.t-acc[data-open="true"] .t-acc-panel-inner {
  opacity: 1;
  filter: blur(0);
  transition:
    opacity var(--acc-expand) var(--acc-ease),
    filter var(--acc-expand) var(--acc-ease);
}
/* Rotate the chevron 180° to turn the "^" into a "v". Rotation is Chromium-safe
   and animates in every browser; duration + easing share the accordion's motion
   tokens (transitions-dev). */
.t-acc-chevron {
  display: inline-flex;
  transform: rotate(0deg);
  transform-origin: center;
  transition: transform var(--acc-chevron) var(--acc-ease);
}
.t-acc[data-open="true"] .t-acc-chevron {
  transform: rotate(180deg);
}

@media (prefers-reduced-motion: reduce) {
  .t-acc-panel,
  .t-acc-panel-inner,
  .t-acc-chevron {
    transition: none !important;
  }
}
</style>
