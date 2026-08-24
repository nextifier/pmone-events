<script setup>
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { Field, FieldError, FieldLabel } from "../../components/ui/field";
import { InputPhone } from "../../components/ui/input-phone";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import ResponsiveDialog from "../../components/ui/responsive-dialog/ResponsiveDialog.vue";
import {
  CustomFieldRenderer,
  CustomFieldGroup,
  isEmptyValue,
} from "../../components/ui/custom-field";
import TicketCartSummary from "../../components/tickets/TicketCartSummary.vue";
import { useTicketCartStore } from "../../stores/ticketCart";
import { useEventListener } from "@vueuse/core";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  watchEffect,
} from "vue";
import { toast } from "vue-sonner";

definePageMeta({
  layout: "default",
  noFooter: true,
});

const { t, locale } = useI18n();
const localePath = useLocalePath();
const cart = useTicketCartStore();
const event = useEvent();

usePageMeta(null, {
  title: computed(() => `${t("tickets.checkout")} · ${event.title}`),
});

// Hydrate the persisted cart on the client; if it's empty there's nothing to
// check out, so bounce back to the ticket page.
const cartReady = ref(false);
onMounted(() => {
  cart.hydrate();
  cartReady.value = true;
  if (cart.isEmpty) {
    // Arriving with nothing in the cart means a stale bookmark or a link that
    // outlived its session - a page they never chose to be on. `replace`, so the
    // back button still goes where they came from instead of bouncing off this
    // redirect and landing here again.
    navigateTo(localePath("/tickets"), { replace: true });
    return;
  }
  cart.setEventContext({ eventId: event.id, eventSlug: event.slug });
  const { removed } = cart.reconcile(ticketsById.value);
  if (removed.length) {
    const titles = removed
      .map((r) => r || t("tickets.ticket"))
      .join(", ");
    toast.error(t("tickets.cartUpdated", { titles }));
  }
  cart.fetchPreview({ eventId: event.id });
  // The SSR fetch used the active event's slug; the cart may carry a different
  // one (restored from a previous session), which only becomes readable after
  // hydrate() above. Re-fetch so the tickets and the staff-managed terms
  // (meta.terms) for the T&C dialog match the cart.
  refreshTickets();

  // Pre-fill the buyer's saved contact details (client-only, after mount).
  restoreBuyer();
});

/**
 * Emptying the cart WHILE here is a decision, not an accident, so the page says
 * so and stays put.
 *
 * This used to start a 7-second timer and then navigate away. Two things were
 * wrong with that. The buyer sat in front of a full checkout form - buyer
 * details, registration questions, a Claim button - wrapped around an order
 * summary with nothing in it, for seven seconds. And then the page changed under
 * them, which is the one thing a form should never do while they are reading it.
 * The timer existed to outlast the Undo toast; an empty state outlasts it by
 * simply not moving, and Undo still refills the cart and brings the form back.
 *
 * `handingOff` is part of the guard, not decoration: a successful submit clears
 * the cart and then hands off with `window.location.href`, and the browser keeps
 * rendering this page while it loads the next one. `submitting` is already back
 * to false by then, so without this the buyer watched "Your cart is empty" flash
 * up in the half-second between pressing Claim and landing on the receipt.
 */
const cartEmptied = computed(
  () =>
    cartReady.value &&
    cart.isEmpty &&
    !submitting.value &&
    !handingOff.value,
);

// --- Tickets (data + meta.terms) ---
// Await the event payload before deriving the URL below: `useEvent()` does not
// await its own fetch, so without this `event.slug` is still "" during SSR and
// the request goes to `/api/tickets/` (no slug), which 404s into the SSR
// renderer. Shares the `active-event` asyncData entry — no extra request.
await useEventData();

const eventSlug = computed(() => cart.eventSlug || event.slug);

// Shared with /tickets and with TicketCartBarHost through one asyncData key, so
// the same endpoint is not fetched twice per session. `useTicketsListing` already
// carries the locale + staff-preview query and defaults to null, hence the
// null-guards on `.data` and `.meta` below.
const { data: ticketsData, refresh: refreshTickets } =
  await useTicketsListing(eventSlug);

const ticketsById = computed(() => {
  const map = {};
  for (const ticket of ticketsData.value?.data ?? []) map[ticket.id] = ticket;
  return map;
});

const terms = computed(() => ticketsData.value?.meta?.terms || "");

/**
 * Same reconciliation the ticket list runs, because checkout is reachable
 * directly by URL with a day-old cart. A line whose ticket is gone, or whose day
 * is no longer valid, is dropped here rather than priced, shown, filled in with
 * attendee details and then refused by the order endpoint.
 */
watch(ticketsById, (map) => {
  if (!import.meta.client || !cartReady.value || !Object.keys(map).length) {
    return;
  }
  const { removed } = cart.reconcile(map);
  if (removed.length) {
    const titles = removed
      .map((r) => r || t("tickets.ticket"))
      .join(", ");
    toast.error(t("tickets.cartUpdated", { titles }));
  }
});

// Staff-configured payment methods, already in the listing payload. Showing the
// logos the buyer will actually meet on the gateway is a trust cue that costs
// nothing: the data was being fetched and thrown away.
const paymentChannels = computed(
  () => ticketsData.value?.meta?.allowed_payment_channels ?? [],
);

// A free cart - free tickets OR a 100%-off promo - gets a "claim" CTA instead
// of "continue to payment" (the final total after discount is what counts).
const isFree = computed(() => {
  if (cart.isEmpty) return false;
  const net =
    (Number(cart.cachedSubtotal) || 0) - (Number(cart.cachedDiscount) || 0);
  return Math.max(0, net) === 0;
});

// --- Buyer form (email-first; buyer is attendee #1 by default) ---
const form = ref({
  buyer_email: "",
  buyer_name: "",
  buyer_phone: "",
  promo_code: "",
});
const acceptTerms = ref(false);

const errors = ref({});
const submitting = ref(false);
// True while we hold the buyer here waiting for the gateway link to be minted.
// Drives the CTA label on both the in-page button and the sticky bar.
const preparing = ref(false);
// Latched the moment this page stops being the buyer's page: they navigated
// away, or we handed them to the gateway. The wait below checks it on every
// tick so a bfcache restore (Back from Xendit) cannot resume a half-finished
// poll and bounce them forward again.
const leavingPage = ref(false);

/**
 * Set the instant a placed order starts handing off, BEFORE the cart is cleared.
 * `leavingPage` cannot do this job: `waitForPaymentUrl` treats it as "stop
 * polling, the page is gone", so setting it early would abandon the gateway
 * redirect on a paid order. This one only ever says "the cart on screen is now a
 * receipt, not a basket" - the page keeps its lines and its empty state stays
 * away until the next document takes over.
 */
const handingOff = ref(false);
// Stable per-checkout-attempt key so a lost-response retry (or a corrected
// resubmit after a validation error) dedupes against the backend instead of
// creating a duplicate order. Reset once an order is successfully created.
const idempotencyKey = ref(null);

// --- Business matching (only shown when the event has active custom fields) ---
const businessMatching = ref(false);
const customFields = ref([]);
const customFieldsLoading = ref(false);
const customFieldsLoaded = ref(false);
const bmResponses = ref({});
const bmErrors = ref({});

// --- Registration details (event's active ticket_registration fields) ---
const registrationFields = ref([]);
const registrationLoaded = ref(false);
const regResponses = ref({});
const regErrors = ref({});

const hasRegistrationFields = computed(
  () => registrationFields.value.length > 0,
);

// Fail-soft: an old API (404) or an event with no fields ([]) simply hides the
// whole section, leaving the pre-existing checkout untouched.
async function loadRegistrationFields() {
  if (!eventSlug.value) return;
  try {
    const res = await $fetch(
      `/api/tickets/${eventSlug.value}/registration-fields`,
      {
        query: { locale: locale.value },
      },
    );
    registrationFields.value = (res?.data ?? res ?? []).filter(
      (f) => f.is_active,
    );
  } catch {
    registrationFields.value = [];
  } finally {
    registrationLoaded.value = true;
  }
}

onMounted(loadRegistrationFields);
// Re-fetch so field labels re-localize when the visitor switches language.
watch(locale, loadRegistrationFields);

/**
 * Province and city withdraw themselves when the country is not Indonesia - the
 * dataset covers Indonesia only. A field the buyer never saw cannot be required
 * of them, so it is skipped here exactly as `CustomFieldValidation::errorsFor()`
 * skips it server-side. The region module is imported on demand because it is
 * ~39 KB and most events configure neither field.
 */
async function withdrawnFieldKeys() {
  const dependent = registrationFields.value.filter((f) =>
    ["province", "city"].includes(f.type),
  );
  if (!dependent.length) return new Set();

  const { isIndonesia } =
    await import("../../components/ui/custom-field/indonesiaRegions");
  const country = registrationFields.value.find(
    (f) => f.system_key === "country",
  );
  if (isIndonesia(country ? regResponses.value[country.ulid] : null))
    return new Set();

  return new Set(dependent.map((f) => f.ulid));
}

async function validateRegistration() {
  regErrors.value = {};
  if (!hasRegistrationFields.value) return true;
  const withdrawn = await withdrawnFieldKeys();
  let ok = true;
  for (const field of registrationFields.value) {
    const required = field.validation?.required ?? field.required;
    if (!required || withdrawn.has(field.ulid)) continue;
    if (isEmptyValue(regResponses.value[field.ulid])) {
      regErrors.value[`registration.responses.${field.ulid}`] = t(
        "tickets.fieldRequired",
      );
      ok = false;
    }
  }
  return ok;
}

function buildRegistrationPayload() {
  const responses = {};
  for (const field of registrationFields.value) {
    const value = regResponses.value[field.ulid];
    if (!isEmptyValue(value)) {
      responses[field.ulid] = value;
    }
  }
  return { responses };
}

// Pre-fill the buyer's contact details on reload, mirroring how the cart already
// persists to localStorage. We deliberately do NOT persist the T&C consent (it
// must be re-accepted) nor the per-event business-matching answers. Hydrated
// after mount (see restoreBuyer in onMounted) so it never causes an SSR mismatch.
const BUYER_STORAGE_KEY = "pmone:checkout-buyer";

function restoreBuyer() {
  try {
    const raw = localStorage.getItem(BUYER_STORAGE_KEY);
    if (!raw) return;
    const { savedAt, data } = JSON.parse(raw) || {};
    if (!data || (savedAt && Date.now() - savedAt > 30 * 24 * 60 * 60 * 1000)) {
      localStorage.removeItem(BUYER_STORAGE_KEY);
      return;
    }
    if (data.buyer_email) form.value.buyer_email = data.buyer_email;
    if (data.buyer_name) form.value.buyer_name = data.buyer_name;
    if (data.buyer_phone) form.value.buyer_phone = data.buyer_phone;
    if (typeof data.business_matching === "boolean")
      businessMatching.value = data.business_matching;
  } catch {
    localStorage.removeItem(BUYER_STORAGE_KEY);
  }
}

let buyerSaveTimer = null;
watch(
  [
    () => form.value.buyer_email,
    () => form.value.buyer_name,
    () => form.value.buyer_phone,
    businessMatching,
  ],
  () => {
    if (buyerSaveTimer) clearTimeout(buyerSaveTimer);
    buyerSaveTimer = setTimeout(() => {
      try {
        localStorage.setItem(
          BUYER_STORAGE_KEY,
          JSON.stringify({
            savedAt: Date.now(),
            data: {
              buyer_email: form.value.buyer_email,
              buyer_name: form.value.buyer_name,
              buyer_phone: form.value.buyer_phone,
              business_matching: businessMatching.value,
            },
          }),
        );
      } catch {
        // private mode / storage full - non-fatal
      }
    }, 300);
  },
);

const hasCustomFields = computed(() => customFields.value.length > 0);

async function loadCustomFields({ force = false } = {}) {
  if ((customFieldsLoaded.value && !force) || !eventSlug.value) return;
  customFieldsLoading.value = true;
  try {
    const res = await $fetch(`/api/tickets/${eventSlug.value}/custom-fields`, {
      query: { locale: locale.value },
    });
    customFields.value = (res?.data ?? res ?? []).filter((f) => f.is_active);
    customFieldsLoaded.value = true;
  } catch {
    customFields.value = [];
  } finally {
    customFieldsLoading.value = false;
  }
}

// Load the custom fields up-front so we know whether to render the
// business-matching section at all (hidden entirely when there are none).
onMounted(loadCustomFields);

// `pagehide` rather than `beforeunload`: it fires for a bfcache freeze too,
// which is exactly the case the latch exists for.
// Target omitted on purpose: VueUse then defaults to its SSR-safe window
// handle. Passing `window` here would throw during server render.
useEventListener("pagehide", () => {
  leavingPage.value = true;
});
onBeforeUnmount(() => {
  leavingPage.value = true;
});

// Re-fetch so the custom-field labels re-localize when the visitor switches
// language (the labels come pre-localized from the API per ?locale=).
watch(locale, () => loadCustomFields({ force: true }));

// --- Submit ---
const ALLOWED_PAYMENT_HOSTS = [
  "checkout.xendit.co",
  "checkout-staging.xendit.co",
  "invoice.xendit.co",
  "invoice-staging.xendit.co",
  "xen.to",
  "app.midtrans.com",
  "app.sandbox.midtrans.com",
];

function isAllowedPaymentUrl(url) {
  try {
    const u = new URL(url);
    return ALLOWED_PAYMENT_HOSTS.some(
      (h) => u.host === h || u.host.endsWith(`.${h}`),
    );
  } catch {
    return false;
  }
}

// The first poll fires a full interval in, not immediately: the job almost
// always lands inside that first second, so asking at t=0 would just spend a
// request to be told "not yet".
const LINK_POLL_INTERVAL_MS = 1000;
const LINK_POLL_BUDGET_MS = 15000;

/**
 * Wait for the payment link, then hand back the gateway URL.
 *
 * `POST /ticket-orders` has not returned a payment_url since PM One moved the
 * gateway round-trip into a queued job, so that a checkout spike can never pin
 * a PHP-FPM worker on it. The link lands about a second later. Polling for it
 * here keeps the buyer on one page and one click; the alternative, bouncing
 * them to the result page to press "Pay now", is the behaviour this replaces.
 *
 * Returns null when there is nothing to pay, when the link never arrives, or
 * when the URL is not one we are willing to send a buyer to - every one of
 * those falls through to the result page, which has its own preparing state
 * and a manual retry.
 */
async function waitForPaymentUrl(order) {
  const accept = (url) => {
    if (!url) return null;
    if (isAllowedPaymentUrl(url)) return url;
    // Silently falling through here would look exactly like the bug above, so
    // leave a trace that tells the two apart.
    console.warn("[checkout] gateway URL rejected by host allowlist:", url);
    return null;
  };

  // Free or already-settled: nothing to redirect to.
  if (order?.is_free || order?.payment_status === "confirmed") return null;
  // Defensive: a synchronous backend (or a future one) may hand it over here.
  if (order?.payment_url) return accept(order.payment_url);
  if (!order?.ulid) return null;

  preparing.value = true;
  const deadline = Date.now() + LINK_POLL_BUDGET_MS;

  while (Date.now() < deadline && !leavingPage.value) {
    await new Promise((resolve) => setTimeout(resolve, LINK_POLL_INTERVAL_MS));
    if (leavingPage.value) return null;

    const res = await $fetch(`/api/tickets/orders/${order.ulid}`).catch(
      () => null,
    );
    const fresh = res?.data ?? null;
    if (!fresh) continue;
    if (fresh.payment_url) return accept(fresh.payment_url);
    // Terminal upstream state (expired / cancelled): stop asking.
    if (fresh.payment_status === "failed") return null;
  }

  return null;
}

const canSubmit = computed(() => {
  return (
    !cart.isEmpty &&
    !!form.value.buyer_email?.trim() &&
    !!form.value.buyer_name?.trim() &&
    !!form.value.buyer_phone?.trim() &&
    acceptTerms.value &&
    !submitting.value
  );
});

// A business-matching answer counts as empty when it's null/blank, an empty
// multi-value array, an unticked boolean, or a cleared date range.
function isBmAnswerEmpty(field, value) {
  if (value === null || value === undefined || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  if (field.type === "checkbox" || field.type === "switch") return !value;
  if (field.type === "date_range") return !value.start || !value.end;
  return false;
}

// Block submit when a required BM field is unanswered (mirrors the server-side
// enforcement). Returns true when everything required is filled.
function validateBusinessMatching() {
  bmErrors.value = {};
  if (!hasCustomFields.value || !businessMatching.value) return true;
  let ok = true;
  for (const field of customFields.value) {
    if (!field.required) continue;
    if (isBmAnswerEmpty(field, bmResponses.value[field.id])) {
      bmErrors.value[field.id] = t("tickets.fieldRequired");
      ok = false;
    }
  }
  return ok;
}

function buildBusinessMatchingPayload() {
  // No section rendered (no fields) or opted out => not opting in.
  if (!hasCustomFields.value || !businessMatching.value) {
    return { opt_in: false, responses: [] };
  }
  const responses = customFields.value
    .map((f) => ({
      custom_field_id: f.id,
      value: bmResponses.value[f.id] ?? null,
    }))
    .filter(
      (r) =>
        r.value !== null &&
        r.value !== "" &&
        !(Array.isArray(r.value) && r.value.length === 0),
    );
  return { opt_in: true, responses };
}

const summaryRef = ref(null);
const pageRef = ref(null);

/**
 * Put the first problem on screen. A toast on an 1800px page tells the buyer
 * something is wrong but not where, and the submit button is `aria-disabled`
 * rather than `disabled` precisely so this path can run and explain itself.
 */
async function revealFirstError() {
  await nextTick();
  const target = pageRef.value?.querySelector('[data-slot="field-error"]');
  target?.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function submit() {
  if (!canSubmit.value) {
    toast.error(t("tickets.submitDisabledReason"));
    await revealFirstError();
    return;
  }
  if (!(await validateRegistration())) {
    toast.error(t("tickets.fieldRequired"));
    await revealFirstError();
    return;
  }
  if (!validateBusinessMatching()) {
    toast.error(t("tickets.fieldRequired"));
    await revealFirstError();
    return;
  }
  // A line that needs a day and has none is refused by the order endpoint, and
  // the day control does not exist on this page - so send the buyer back to the
  // card that can actually fix it instead of letting them pay into a 422.
  const daylessLine = cart.items.find((i) =>
    lineMissingDay(ticketsById.value[i.ticket_id], i),
  );
  if (daylessLine) {
    toast.error(t("tickets.selectDayFirst"));
    await navigateTo(localePath("/tickets"));
    return;
  }
  submitting.value = true;
  errors.value = {};

  const payload = {
    event_id: event.id ?? cart.eventId,
    items: cart.items.map((i) => ({
      ticket_id: i.ticket_id,
      quantity: Number(i.qty) || 1,
      ...(i.ticket_session_id
        ? { ticket_session_id: i.ticket_session_id }
        : {}),
      ...(i.selected_event_day_id
        ? { selected_event_day_id: i.selected_event_day_id }
        : {}),
    })),
    buyer_name: form.value.buyer_name?.trim(),
    buyer_email: form.value.buyer_email?.trim(),
    buyer_phone: String(form.value.buyer_phone || "").trim(),
    // Buyer is attendee #1 by default (no user-facing toggle anymore).
    also_attending: true,
    accept_terms: true,
    business_matching: buildBusinessMatchingPayload(),
  };

  // Registration answers are keyed by field ulid; only added when the event has
  // active registration fields, so the pre-existing payload shape is unchanged.
  if (hasRegistrationFields.value) {
    payload.registration = buildRegistrationPayload();
  }

  const promo = (
    summaryRef.value?.appliedPromo ||
    form.value.promo_code ||
    ""
  ).trim();
  if (promo) payload.promo_code = promo;

  // Carry the access code applied on the tickets page (unlocks gated tickets +
  // any price effect). The backend re-validates + holds it authoritatively.
  if (cart.accessCode) payload.access_code = cart.accessCode;

  if (!idempotencyKey.value) idempotencyKey.value = crypto.randomUUID();
  payload.idempotency_key = idempotencyKey.value;

  try {
    const res = await $fetch("/api/tickets/orders", {
      method: "POST",
      body: payload,
      // Staff preview, carried over from the tickets page through the cart.
      // Query string, not body - PM One reads the bypass from the query only.
      query: cart.forceCheckout ? { force_checkout_ticket: 1 } : undefined,
    });
    const data = res?.data ?? res;

    handingOff.value = true;
    cart.clear();
    idempotencyKey.value = null;

    const gatewayUrl = await waitForPaymentUrl(data);

    // Hard redirects only: a client-side navigateTo races the page teardown
    // here, so use window.location for both the gateway and the result page.
    if (gatewayUrl) {
      leavingPage.value = true;
      window.location.href = gatewayUrl;
      return;
    }
    leavingPage.value = true;
    // localePath, so an Indonesian buyer does not land on the English page.
    window.location.href = `${localePath("/tickets/result")}?order=${data.ulid}`;
  } catch (err) {
    const body = err?.data || {};
    errors.value = body.errors || body.data?.errors || {};
    // Split `registration.responses.{ulid}` keys out so the CustomFieldGroup can
    // show them inline against the right field.
    regErrors.value = Object.fromEntries(
      Object.entries(errors.value).filter(([key]) =>
        key.startsWith("registration.responses."),
      ),
    );
    await revealFirstError();
    const message =
      body.message || body.data?.message || t("tickets.submitError");
    toast.error(message);
  } finally {
    submitting.value = false;
    preparing.value = false;
  }
}

const termsOpen = ref(false);

/**
 * Publish the pay-mode action to the layout-level cart bar.
 *
 * The bar lives in app.vue so it survives the navigation from /tickets, which
 * puts it outside this page's tree - it cannot reach `submit()` on its own. A
 * watchEffect keeps the label and the disabled/submitting flags in sync, and the
 * handle is withdrawn on unmount so the bar falls back to `select` mode.
 */
const checkoutBar = useTicketCheckoutBar();

watchEffect(() => {
  publishTicketCheckoutBar({
    ctaLabel: preparing.value
      ? t("tickets.result.preparingPayment")
      : isFree.value
        ? t("tickets.claim")
        : t("tickets.pay"),
    ctaIcon: "hugeicons:credit-card",
    ctaDisabled: !canSubmit.value,
    submitting: submitting.value,
  });
});

// The bar cannot call submit() directly - it lives outside this page and a
// callback in `useState` breaks SSR serialization. It bumps a counter instead.
watch(
  () => checkoutBar.value.primaryRequests,
  () => submit(),
);

onBeforeUnmount(clearTicketCheckoutBar);
</script>

<template>
  <div
    ref="pageRef"
    class="container pt-4 pb-[calc(--spacing(28)+env(safe-area-inset-bottom,0px))] sm:pt-6"
  >
    <!-- Header + back link -->
    <div class="mb-6 flex flex-col gap-3">
      <!-- The dashboard's back control, so the arrow, the label and the `B`
           shortcut behave the same wherever a page has a parent. `localePath`
           because ButtonBack pushes the string it is given, and a bare
           "/tickets" would drop the locale prefix. `force-destination` because
           `router.back()` from a checkout can land anywhere the buyer came
           from, including another site. -->
      <!-- Wrapped, not classed: ButtonBack's root is a `<slot>`, so it renders a
           fragment and Vue drops any fallthrough class. Without the wrapper the
           button stretches the full column and centres its own label. -->
      <div class="w-fit">
        <ButtonBack
          :destination="localePath('/tickets')"
          :label="t('ui.back')"
          force-destination
        />
      </div>
      <div class="space-y-1">
        <h1 class="page-title">{{ t("tickets.checkout") }}</h1>
        <p class="page-description">{{ t("tickets.checkoutSubtitle") }}</p>
      </div>
    </div>

    <!--
      A real <form>, so Enter submits from any field and mobile keyboards offer a
      "Go" key. Three grid blocks rather than two: source order is mobile order,
      and the buyer must reach the first input before the order summary, while at
      lg the summary still needs to sit in the right column beside BOTH stacks
      (hence row-span-2, without which the sticky aside has no travel).
    -->
    <!-- Emptied while standing here. The form is replaced rather than left
         wrapped around an order with nothing in it, and nothing navigates on a
         timer - the Undo toast is still up, and taking it will bring all of this
         straight back. -->
    <div
      v-if="cartEmptied"
      class="flex flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-16 text-center"
    >
      <Icon
        name="hugeicons:shopping-cart-remove-02"
        class="text-muted-foreground size-8 shrink-0"
      />
      <div class="space-y-1">
        <h2 class="text-foreground text-lg font-semibold tracking-tight">
          {{ t("tickets.emptyCartTitle") }}
        </h2>
        <p class="text-muted-foreground text-sm tracking-tight text-balance">
          {{ t("tickets.emptyCartDescription") }}
        </p>
      </div>
      <Button as-child>
        <NuxtLink :to="localePath('/tickets')">
          {{ t("tickets.emptyCartAction") }}
        </NuxtLink>
      </Button>
    </div>

    <form v-else novalidate @submit.prevent="submit">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <!-- 1. Buyer details, registration, exhibitor consent -->
        <div class="space-y-6 lg:col-span-7 lg:col-start-1 lg:row-start-1">
          <!-- Buyer details -->
          <section class="frame" aria-labelledby="section-your-details">
            <div class="frame-header">
              <h2 id="section-your-details" class="frame-title">
                {{ t("tickets.yourDetails") }}
              </h2>
            </div>
            <!-- The inner wrapper is load-bearing. `.frame-panel` is a flex column
               with `gap-1`, declared unlayered in main.css, so a call-site
               `gap-6` loses to it and a call-site `space-y-6` stacks 24px of
               margin on top of its 4px gap - which is where the 28px vs
               CustomFieldGroup's 24px came from. Giving the panel a single child
               takes its gap out of play, and one `space-y-6` owns the rhythm. -->
            <div class="frame-panel">
              <div class="space-y-6">
                <Field :data-invalid="!!errors?.buyer_name">
                  <!-- `required` on the label, not just on the input. The main.css
                   fallback would draw an asterisk off the input's `required`
                   attribute, but as a `::after` it becomes a second flex item
                   and picks up `.cn-label`'s 8px gap. The prop puts the `*`
                   inline inside one flex item, 4px out and optically centred -
                   the same marker the public form pages use - and adds the
                   screen-reader "(required)" that a pseudo-element cannot.
                   `text-base leading-snug` matches PublicFormFields.vue: this is
                   a question a visitor reads, not a dashboard control caption. -->
                  <FieldLabel
                    for="buyer_name"
                    required
                    class="text-base leading-snug"
                  >
                    {{ t("tickets.fullName") }}
                  </FieldLabel>
                  <Input
                    id="buyer_name"
                    v-model="form.buyer_name"
                    autocomplete="name"
                    required
                    :aria-invalid="!!errors?.buyer_name"
                  />
                  <FieldError :errors="errors.buyer_name" />
                </Field>

                <!-- One column. Email is the ticket-delivery address and the highest
                 consequence field on the page; it does not belong in half a row
                 while the name gets a whole one. -->
                <Field :data-invalid="!!errors?.buyer_email">
                  <FieldLabel
                    for="buyer_email"
                    required
                    class="text-base leading-snug"
                  >
                    {{ t("tickets.email") }}
                  </FieldLabel>
                  <Input
                    :aria-invalid="!!errors?.buyer_email"
                    id="buyer_email"
                    v-model="form.buyer_email"
                    type="email"
                    autocomplete="email"
                    required
                  />
                  <FieldError :errors="errors.buyer_email" />
                  <p class="text-muted-foreground text-sm tracking-tight">
                    {{ t("tickets.detailsNote") }}
                  </p>
                </Field>
                <Field :data-invalid="!!errors?.buyer_phone">
                  <FieldLabel
                    for="buyer_phone"
                    required
                    class="text-base leading-snug"
                  >
                    {{ t("tickets.phone") }}
                  </FieldLabel>
                  <InputPhone
                    :aria-invalid="!!errors?.buyer_phone"
                    id="buyer_phone"
                    :model-value="form.buyer_phone"
                    required
                    @update:model-value="(v) => (form.buyer_phone = v)"
                  />
                  <FieldError :errors="errors.buyer_phone" />
                </Field>

                <!--
              The event's own registration questions, in the same section rather
              than a frame of their own: it is one job - "tell us who you are" -
              and two frames made it read as two.

              All of them flat, in the order the organizer configured. An earlier
              build hid the optional ones behind a disclosure to keep the pay
              button reachable; on a real event that only meant nobody opened it
              and the organizer got empty answers back.
            -->
                <template v-if="hasRegistrationFields">
                  <CustomFieldGroup
                    v-model="regResponses"
                    :fields="registrationFields"
                    :errors="regErrors"
                    error-prefix="registration.responses."
                    :locale="locale"
                    label-size="lg"
                  />
                </template>
              </div>
            </div>
          </section>

          <!-- Connect with exhibitors (only when the event has custom fields) -->
          <section
            v-if="hasCustomFields"
            class="frame"
            aria-labelledby="section-connect"
          >
            <div class="frame-header">
              <h2 id="section-connect" class="frame-title">
                {{ t("tickets.connectHeading") }}
              </h2>
              <p
                id="section-connect-desc"
                class="text-muted-foreground mt-1 text-sm tracking-tight"
              >
                {{ t("tickets.connectSubtitle") }}
              </p>
            </div>
            <!-- Same single-child wrapper as "Your details", and the same 24px:
               both panels hold the event's own questions. -->
            <div class="frame-panel">
              <div class="space-y-6">
                <!-- Named, or a screen reader announces two unexplained radios. -->
                <RadioGroup
                  :model-value="businessMatching ? 'yes' : 'no'"
                  class="flex flex-wrap gap-x-6 gap-y-2"
                  aria-labelledby="section-connect section-connect-desc"
                  @update:model-value="(v) => (businessMatching = v === 'yes')"
                >
                  <!-- Same shape CustomFieldRenderer gives a radio option, so the
                   event's own questions above and this one below cannot drift:
                   `Field orientation="horizontal"` for the row, `FieldLabel`
                   for the caption, `w-auto` so the pair stays on one line. -->
                  <Field orientation="horizontal" class="w-auto">
                    <RadioGroupItem id="connect-yes" value="yes" />
                    <FieldLabel
                      for="connect-yes"
                      class="text-base leading-snug font-normal"
                    >
                      {{ t("tickets.connectYes") }}
                    </FieldLabel>
                  </Field>
                  <Field orientation="horizontal" class="w-auto">
                    <RadioGroupItem id="connect-no" value="no" />
                    <FieldLabel
                      for="connect-no"
                      class="text-base leading-snug font-normal"
                    >
                      {{ t("tickets.connectNo") }}
                    </FieldLabel>
                  </Field>
                </RadioGroup>

                <div v-if="businessMatching" class="space-y-6 border-t pt-6">
                  <div
                    v-if="customFieldsLoading"
                    class="text-muted-foreground flex items-center gap-2 text-sm tracking-tight"
                  >
                    <Icon name="svg-spinners:180-ring" class="size-4" />
                    {{ t("tickets.loadingQuestions") }}
                  </div>

                  <CustomFieldRenderer
                    v-for="field in customFields"
                    v-else
                    :key="field.id"
                    :field="field"
                    :locale="locale"
                    label-size="lg"
                    :model-value="bmResponses[field.id]"
                    :error="bmErrors[field.id]"
                    @update:model-value="(v) => (bmResponses[field.id] = v)"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- 2. Order summary. Second on mobile so the buyer types first; on the
             right, spanning both rows, on desktop. -->
        <aside
          class="lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1"
          aria-labelledby="section-order-summary"
        >
          <div class="lg:sticky lg:top-(--navbar-height-desktop)">
            <div class="frame">
              <div class="frame-header">
                <h2 id="section-order-summary" class="frame-title">
                  {{ t("tickets.orderSummary") }}
                </h2>
              </div>
              <div class="frame-panel">
                <TicketCartSummary
                  ref="summaryRef"
                  :tickets-by-id="ticketsById"
                  editable
                  :frozen="handingOff"
                />
              </div>
            </div>
          </div>
        </aside>

        <!-- 3. Consent and submit -->
        <div class="space-y-6 lg:col-span-7 lg:col-start-1 lg:row-start-2">
          <!--
            Terms consent. The T&C trigger is a SIBLING of the labels, not a
            child: a <button> is a labelable element, so nesting one inside a
            <label> is invalid HTML, and it only behaved before because of a
            .stop.prevent on the click.

            The label carries the whole sentence and the trigger follows it, so
            tapping the text still toggles the box. What the buyer is agreeing to
            lives in the dialog, not in this line.
          -->
          <!-- A real `Field`, so `data-invalid` turns the checkbox and its
               sentence red alongside the FieldError. The FieldError used to sit
               outside any Field, which meant the only control on this page that
               can block submission was also the only one that never went red.
               `items-start`, because the sentence wraps to two lines and the box
               belongs beside the first one. -->
          <Field
            class="text-base tracking-tight"
            :data-invalid="!!errors?.accept_terms"
          >
            <div class="flex w-full items-start gap-2">
              <Checkbox
                id="accept-terms"
                :model-value="acceptTerms"
                :aria-invalid="!!errors?.accept_terms"
                class="mt-0.5"
                @update:model-value="(v) => (acceptTerms = !!v)"
              />
              <!--
                Three slots, because the verb does not sit in the same place in
                every language. English, Indonesian and Chinese put it before the
                object ("I agree to the ..."), so their suffix is empty. Japanese
                and Korean put it after ("...に同意します"), so theirs carries the
                verb and their prefix is empty.

                The space before the link lives in the locale string as a real
                ` `, not as markup: English and Indonesian need one, Chinese
                must not have one, and only the translator knows which. It is a
                character rather than `ml-1` because margin leaves textContent
                reading "theticket terms" to a screen reader.
              -->
              <p class="leading-snug">
                <Label
                  v-if="t('tickets.termsConsentPrefix')"
                  for="accept-terms"
                  class="inline text-base leading-snug font-normal"
                  >{{ t("tickets.termsConsentPrefix") }}</Label
                >
                <button
                  type="button"
                  class="text-primary hover:text-primary/80 focus-visible:ring-ring rounded-sm underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  @click="termsOpen = true"
                >
                  {{ t("tickets.termsConsentLink") }}
                </button>
                <Label
                  v-if="t('tickets.termsConsentSuffix')"
                  for="accept-terms"
                  class="inline text-base leading-snug font-normal"
                  >{{ t("tickets.termsConsentSuffix") }}</Label
                >
              </p>
            </div>
            <FieldError :errors="errors.accept_terms" />
          </Field>

          <!-- The methods the buyer will meet on the gateway. Staff-configured,
               already in the listing payload, and previously fetched and thrown
               away. -->
          <div v-if="!isFree && paymentChannels.length" class="space-y-1.5">
            <p class="text-muted-foreground text-sm tracking-tight">
              {{ t("tickets.paidWith") }}
            </p>
            <!-- Gateway logos are supplied as fixed-colour raster art with no
                 dark variant, so they need a light chip to sit on or they vanish
                 into a dark page. -->
            <ul class="flex flex-wrap items-center gap-x-1 gap-y-1.5">
              <li
                v-for="ch in paymentChannels"
                :key="ch.code"
                class="flex items-center rounded-sm bg-white"
              >
                <img
                  :src="ch.logo"
                  :alt="ch.label"
                  class="h-7 w-auto"
                  loading="lazy"
                  decoding="async"
                />
              </li>
            </ul>
          </div>

          <!-- aria-disabled, not disabled: a disabled button is not focusable,
               so a keyboard user tabs straight past it and never learns why it
               will not accept them. The guard lives in submit(), which raises the
               reason as a toast and scrolls to the offending field. -->
          <!-- `loading` hides the label to keep the button's width stable, which
               is right for the sub-second order POST but wrong once we are
               waiting on the gateway link: that wait can run to 15s, and a bare
               spinner for that long tells the buyer nothing. So the preparing
               state renders its own inline spinner and keeps its label. -->
          <Button
            type="submit"
            class="w-full aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
            size="lg"
            :aria-disabled="!canSubmit || undefined"
            :loading="submitting && !preparing"
          >
            <template v-if="preparing">
              <Icon name="svg-spinners:180-ring" class="size-4 shrink-0" />
              {{ t("tickets.result.preparingPayment") }}
            </template>
            <template v-else>
              {{
                isFree
                  ? t("tickets.claim")
                  : t("tickets.pay")
              }}
            </template>
          </Button>
        </div>
      </div>
    </form>

    <!-- Terms & Conditions dialog (staff-managed HTML from meta.terms) -->
    <ResponsiveDialog
      v-model:open="termsOpen"
      :overflow-content="true"
      dialog-max-width="40rem"
    >
      <template #default>
        <div class="space-y-4 px-4 pt-5 pb-8 md:px-6 md:py-5">
          <h3 class="text-foreground text-lg font-semibold tracking-tighter">
            {{ t("tickets.termsDialogTitle") }}
          </h3>
          <div
            v-if="terms"
            v-html="terms"
            class="typeset typeset-cms max-w-none tracking-tight"
          ></div>
          <p v-else class="text-muted-foreground text-sm tracking-tight">
            {{ t("tickets.defaultTerms") }}
          </p>
          <div class="flex justify-end pt-1">
            <Button size="sm" @click="termsOpen = false">{{
              t("tickets.termsClose")
            }}</Button>
          </div>
        </div>
      </template>
    </ResponsiveDialog>
  </div>
</template>
