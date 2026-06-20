<script setup>
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Toggle } from "../ui/toggle";
import { DatePicker } from "../ui/date-picker";
import { Lightbox } from "../ui/lightbox";
import TicketSlotPicker from "./TicketSlotPicker.vue";
import TicketStub from "./TicketStub.vue";
import TicketListSkeleton from "./TicketListSkeleton.vue";
import { Input } from "../ui/input";
import { toast } from "vue-sonner";
import { LazyTickets as StaticTickets } from "#components";
import { useTicketCartStore } from "../../stores/ticketCart";
import { useTicketStore } from "../../composables/tickets";
import { computed, onMounted, reactive, ref } from "vue";

const props = defineProps({
  eventSlug: { type: String, required: true },
});

const { t, locale } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const cart = useTicketCartStore();
const staticStore = useTicketStore();
const event = useEvent();
const accessCodeErrors = useAccessCodeErrors();

// Dynamic tickets from PM One. A 404 (TICKETS_DISABLED) or an empty list means
// this event hasn't been migrated to the dynamic flow yet — render the existing
// static `<Tickets>` so the 15 not-yet-migrated apps keep working unchanged.
// The locale is forwarded so ticket copy + meta.terms come back localized.
const { data, pending, error } = await useFetch(
  () => `/api/tickets/${props.eventSlug}`,
  {
    key: () => `tickets-${props.eventSlug}-${locale.value}`,
    query: { locale },
    watch: [locale, () => props.eventSlug],
    default: () => null,
  },
);

const tickets = computed(() => data.value?.data ?? []);

const useDynamic = computed(() => {
  if (pending.value) return true; // assume dynamic until we know
  if (error.value) return false; // 404 / failure -> static fallback
  return tickets.value.length > 0 || revealedTickets.value.length > 0;
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

const entryTickets = computed(() => mergedTickets.value.filter((tk) => tk.kind === "entry"));
const addOnTickets = computed(() => mergedTickets.value.filter((tk) => tk.kind === "add_on"));

// A code_required ticket stays locked (no Add button) until unlocked. Hidden
// tickets only ever appear once revealed, so they are never "locked" here.
function isLocked(ticket) {
  return ticket.visibility === "code_required" && !unlockedIds.value.includes(ticket.id);
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
  () => !!appliedAccessCode.value || !!accessError.value || hasGatedVisible.value,
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
      accessError.value = accessCodeErrors[dataRes?.error_code] || dataRes?.message || t("tickets.accessInvalid");
      return;
    }
    revealedTickets.value = dataRes.tickets ?? [];
    unlockedIds.value = (dataRes.unlocks ?? []).map((u) => u.ticket_id);
    appliedAccessCode.value = code.toUpperCase();
    accessPriceEffect.value = dataRes.price_effect && dataRes.price_effect !== "none" ? dataRes.price_effect : null;
    cart.setEventContext({ eventId: event.id, eventSlug: props.eventSlug });
    cart.setAccessCode(code);
  } catch (err) {
    const payload = err?.data?.data ?? err?.data ?? {};
    accessError.value = accessCodeErrors[payload?.error_code] || payload?.message || t("tickets.accessInvalid");
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

// A single-image lightbox payload for a ticket poster (opens the larger image).
function posterLightboxItems(ticket) {
  const p = ticket.poster;
  if (!p) return [];
  return [
    { sm: p.sm, md: p.md, lg: p.lg, xl: p.xl, url: p.url, alt: ticket.title, caption: ticket.title },
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
  const day = daysFor(ticket).find((d) => dateKey(isoToLocalDate(d.date)) === key);
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

function canAdd(ticket) {
  if (isLocked(ticket)) return false;
  if (ticket.available != null && ticket.available <= 0) return false;
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
  cart.addItem(ticket.id, resolveSessionId(ticket), minFor(ticket), resolveDayId(ticket));
}

function inc(ticket) {
  const next = qtyOf(ticket) + 1;
  if (next > maxFor(ticket)) return;
  cart.setQty(ticket.id, resolveSessionId(ticket), next, resolveDayId(ticket));
}

function dec(ticket) {
  const next = qtyOf(ticket) - 1;
  cart.setQty(ticket.id, resolveSessionId(ticket), Math.max(0, next), resolveDayId(ticket));
}

function priceLabel(ticket) {
  if (ticket.on_sale && ticket.price != null) {
    return ticket.price > 0 ? `Rp${fmtRupiah(ticket.price)}` : t("tickets.free");
  }
  return ticket.phase_label || t("tickets.comingSoon");
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
    return t(mode === "start" ? "tickets.phaseStartsIn" : "tickets.phaseEndsIn", { phase: label });
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
</script>

<template>
  <!-- Static fallback for not-yet-migrated events -->
  <StaticTickets v-if="!useDynamic && !pending" :tickets="staticStore.categories" />

  <!-- Loading: a skeleton shaped like the real ticket cards -->
  <TicketListSkeleton v-else-if="pending" />

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
            <Button type="button" variant="ghost" size="sm" @click="removeAccessCode">
              {{ t("tickets.remove") }}
            </Button>
          </div>
          <p v-if="accessPriceEffect" class="text-muted-foreground text-xs tracking-tight">
            {{ t("tickets.accessPriceNote") }}
          </p>
        </div>
        <div v-else class="space-y-2">
          <p class="text-primary text-sm font-medium tracking-tight">{{ t("tickets.accessLabel") }}</p>
          <div class="flex gap-2">
            <Input
              v-model="accessCodeInput"
              :placeholder="t('tickets.accessPlaceholder')"
              class="flex-1 uppercase"
              maxlength="60"
              :disabled="accessApplying"
              @keydown.enter.prevent="accessCodeInput?.trim() && !accessApplying && applyAccessCode()"
            />
            <Button
              type="button"
              variant="outline"
              :disabled="!accessCodeInput?.trim() || accessApplying"
              @click="applyAccessCode()"
            >
              <Icon v-if="accessApplying" name="svg-spinners:180-ring" class="size-4" />
              {{ t("tickets.apply") }}
            </Button>
          </div>
          <p
            v-if="accessError"
            role="alert"
            class="bg-destructive/10 text-destructive flex items-start gap-1.5 rounded-md px-3 py-2 text-xs tracking-tight"
          >
            <Icon name="hugeicons:alert-circle" class="mt-0.5 size-4 shrink-0" />
            <span>{{ accessError }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Empty state: dynamic flow is active but no entry/add-on tickets returned -->
    <div
      v-if="!entryTickets.length && !addOnTickets.length"
      class="border-border bg-muted/30 text-muted-foreground mx-auto flex max-w-md flex-col items-center gap-3 rounded-3xl border border-dashed px-6 py-12 text-center"
    >
      <Icon name="hugeicons:ticket-01" class="size-8 shrink-0 opacity-60" />
      <p class="text-sm tracking-tight text-balance">{{ t("tickets.noTickets") }}</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-y-10 lg:gap-y-16">
      <!-- Entry tickets -->
      <section v-if="entryTickets.length" id="entry-tickets">
        <div class="flex flex-col items-center gap-y-3 text-center">
          <h2 class="text-primary text-3xl font-semibold tracking-tighter sm:text-4xl">
            {{ t("tickets.entryTitle") }}
          </h2>
          <p class="text-primary text-balance tracking-tight">
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
            <div class="flex grow flex-col px-4 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-6">
              <div class="flex items-center gap-x-3">
                <Lightbox
                  v-if="ticket.poster"
                  :items="posterLightboxItems(ticket)"
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
                        :src="ticket.poster.md || ticket.poster.sm || ticket.poster.lg || ticket.poster.url"
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
                  <p class="text-primary line-clamp-2 text-sm font-semibold tracking-tight">
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
                    v-tippy="$dayjs(ticket.sales_starts_at).format('MMMM D, YYYY [at] h:mm A')"
                  />
                  <Countdown
                    v-else-if="ticket.sales_ends_at"
                    variant="no-style"
                    class="text-muted-foreground text-xs tracking-tight sm:text-sm"
                    :text-before-countdown="phasePrefix(ticket, 'end')"
                    :countdown-date="new Date(ticket.sales_ends_at)"
                    v-tippy="$dayjs(ticket.sales_ends_at).format('MMMM D, YYYY [at] h:mm A')"
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
                <Badge v-if="ticket.entrance" icon="hugeicons:square-arrow-right-03">
                  {{ ticket.entrance }}
                </Badge>
                <Badge v-if="ticket.tier && !ticket.day_pass && !ticket.entrance" no-indicator>
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
                  <span class="text-xs leading-normal! tracking-tight sm:text-sm">
                    {{ benefit }}
                  </span>
                </div>
              </div>

              <!-- Day picker: a Day Pass is valid on many days but the buyer
                   chooses one. Switching the day starts a fresh cart line.
                   <=4 days use pill toggles; more use a date picker locked to
                   the valid days. -->
              <div v-if="requiresDayPick(ticket)" class="mt-4 space-y-2">
                <p class="text-muted-foreground text-xs font-medium tracking-tight sm:text-sm">
                  {{ t("tickets.chooseDay") }}
                </p>
                <div
                  v-if="daysFor(ticket).length <= 4"
                  class="flex flex-wrap gap-2"
                >
                  <Toggle
                    v-for="d in daysFor(ticket)"
                    :key="d.id"
                    :model-value="selectedDay[ticket.id] === d.id"
                    @update:model-value="
                      () => (selectedDay[ticket.id] = selectedDay[ticket.id] === d.id ? null : d.id)
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
                  <span class="text-primary text-base font-semibold tracking-tighter">
                    {{ priceLabel(ticket) }}
                  </span>
                </div>

                <div class="shrink-0">
                  <!-- Locked: requires a valid access code -->
                  <span
                    v-if="isLocked(ticket)"
                    class="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium tracking-tight"
                  >
                    <Icon name="hugeicons:square-lock-02" class="size-4 shrink-0" />
                    {{ t("tickets.locked") }}
                  </span>

                  <!-- External purchase -->
                  <Button
                    v-else-if="ticket.purchase_type === 'external' && ticket.external_url"
                    as-child
                    size="sm"
                  >
                    <a :href="ticket.external_url">{{ t("tickets.getTicket") }}</a>
                  </Button>

                  <!-- First-party, on sale -->
                  <template v-else-if="ticket.purchase_type === 'first_party' && ticket.on_sale">
                    <div v-if="qtyOf(ticket) > 0" class="flex items-center gap-1.5">
                      <button
                        type="button"
                        class="border-border hover:bg-muted focus-visible:ring-ring flex size-8 items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none"
                        :aria-label="t('tickets.decreaseQty')"
                        @click="dec(ticket)"
                      >
                        <Icon name="hugeicons:minus-sign" class="size-4" />
                      </button>
                      <span class="min-w-6 text-center text-sm font-medium tabular-nums">
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
                      :disabled="ticket.available != null && ticket.available <= 0"
                      :class="{ 'opacity-60': !canAdd(ticket) }"
                      @click="addToCart(ticket)"
                    >
                      <Icon
                        v-if="!(ticket.available != null && ticket.available <= 0)"
                        name="hugeicons:plus-sign"
                        class="size-4 shrink-0"
                      />
                      {{ ticket.available != null && ticket.available <= 0 ? t("tickets.soldOut") : t("tickets.add") }}
                    </Button>
                  </template>

                  <!-- Not on sale -->
                  <span
                    v-else
                    class="bg-warning/10 text-warning-foreground rounded-lg px-3 py-2 text-sm font-semibold tracking-tight"
                  >
                    {{ t("tickets.comingSoon") }}
                  </span>
                </div>
              </div>
            </template>
          </TicketStub>
        </div>
      </section>

      <!-- Add-on tickets -->
      <section v-if="addOnTickets.length" id="add-ons">
        <div class="flex flex-col items-center gap-y-3 text-center">
          <h2 class="text-primary text-3xl font-semibold tracking-tighter sm:text-4xl">
            {{ t("tickets.addOnTitle") }}
          </h2>
          <p class="text-primary text-balance tracking-tight">
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
            <div class="flex grow flex-col px-4 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-6">
              <div class="flex items-center gap-x-3">
                <Lightbox
                  v-if="ticket.poster"
                  :items="posterLightboxItems(ticket)"
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
                        :src="ticket.poster.md || ticket.poster.sm || ticket.poster.lg || ticket.poster.url"
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
                  <p class="text-primary line-clamp-2 text-sm font-semibold tracking-tight">
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
                    v-tippy="$dayjs(ticket.sales_starts_at).format('MMMM D, YYYY [at] h:mm A')"
                  />
                  <Countdown
                    v-else-if="ticket.sales_ends_at"
                    variant="no-style"
                    class="text-muted-foreground text-xs tracking-tight sm:text-sm"
                    :text-before-countdown="phasePrefix(ticket, 'end')"
                    :countdown-date="new Date(ticket.sales_ends_at)"
                    v-tippy="$dayjs(ticket.sales_ends_at).format('MMMM D, YYYY [at] h:mm A')"
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
                <Badge v-if="ticket.entrance" icon="hugeicons:square-arrow-right-03">
                  {{ ticket.entrance }}
                </Badge>
                <Badge v-if="ticket.tier && !ticket.day_pass && !ticket.entrance" no-indicator>
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
                  <span class="text-xs leading-normal! tracking-tight sm:text-sm">
                    {{ benefit }}
                  </span>
                </div>
              </div>

              <!-- Time-slot picker (add-ons with more than one session) -->
              <div v-if="sessionsFor(ticket).length > 1" class="mt-4 space-y-2">
                <p class="text-muted-foreground text-xs font-medium tracking-tight sm:text-sm">
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
                  <span class="text-primary text-base font-semibold tracking-tighter">
                    {{ priceLabel(ticket) }}
                  </span>
                </div>

                <div class="shrink-0">
                  <span
                    v-if="isLocked(ticket)"
                    class="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium tracking-tight"
                  >
                    <Icon name="hugeicons:square-lock-02" class="size-4 shrink-0" />
                    {{ t("tickets.locked") }}
                  </span>

                  <Button
                    v-else-if="ticket.purchase_type === 'external' && ticket.external_url"
                    as-child
                    size="sm"
                  >
                    <a :href="ticket.external_url">{{ t("tickets.getTicket") }}</a>
                  </Button>

                  <template v-else-if="ticket.purchase_type === 'first_party' && ticket.on_sale">
                    <div v-if="qtyOf(ticket) > 0" class="flex items-center gap-1.5">
                      <button
                        type="button"
                        class="border-border hover:bg-muted focus-visible:ring-ring flex size-8 items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none"
                        :aria-label="t('tickets.decreaseQty')"
                        @click="dec(ticket)"
                      >
                        <Icon name="hugeicons:minus-sign" class="size-4" />
                      </button>
                      <span class="min-w-6 text-center text-sm font-medium tabular-nums">
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
                      :disabled="ticket.available != null && ticket.available <= 0"
                      :class="{ 'opacity-60': !canAdd(ticket) }"
                      @click="addToCart(ticket)"
                    >
                      <Icon
                        v-if="!(ticket.available != null && ticket.available <= 0)"
                        name="hugeicons:plus-sign"
                        class="size-4 shrink-0"
                      />
                      {{ ticket.available != null && ticket.available <= 0 ? t("tickets.soldOut") : t("tickets.add") }}
                    </Button>
                  </template>

                  <span
                    v-else
                    class="bg-warning/10 text-warning-foreground rounded-lg px-3 py-2 text-sm font-semibold tracking-tight"
                  >
                    {{ t("tickets.comingSoon") }}
                  </span>
                </div>
              </div>
            </template>
          </TicketStub>
        </div>
      </section>
    </div>

    <!-- Sticky cart bar -->
    <Transition
      enter-active-class="transition duration-300 ease-out motion-reduce:transition-none"
      leave-active-class="transition duration-300 ease-in motion-reduce:transition-none"
      enter-from-class="translate-y-full opacity-0"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="!cart.isEmpty"
        class="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-6"
      >
        <div
          class="bg-background/95 border-border supports-backdrop-filter:bg-background/85 mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-2xl border p-3 shadow-lg backdrop-blur-md sm:p-4"
        >
          <div class="flex items-center gap-2.5">
            <span
              class="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums"
              aria-hidden="true"
            >
              {{ cart.count }}
            </span>
            <div class="leading-tight">
              <p class="text-primary text-sm font-medium tracking-tight" aria-live="polite">
                {{ t("tickets.selected", { count: cart.count }, cart.count) }}
              </p>
              <button
                type="button"
                class="text-muted-foreground hover:text-foreground rounded-sm text-xs tracking-tight transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:text-sm"
                @click="cart.clear()"
              >
                {{ t("tickets.clearCart") }}
              </button>
            </div>
          </div>
          <Button size="lg" @click="goToCheckout">
            <Icon name="hugeicons:shopping-cart-01" class="size-4 shrink-0" />
            {{ t("tickets.checkout") }}
          </Button>
        </div>
      </div>
    </Transition>
  </div>
</template>
