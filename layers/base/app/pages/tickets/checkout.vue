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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, watchEffect } from "vue";
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
    navigateTo(localePath("/tickets"));
    return;
  }
  cart.setEventContext({ eventId: event.id, eventSlug: event.slug });
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
 * Nothing to buy means nothing to check out, so an empty cart goes back to the
 * ticket list - but not instantly. Removing the last line raises an Undo toast,
 * and navigating out from under it would leave the buyer on another page with a
 * button that no longer means anything. Wait out the toast, and cancel the trip
 * the moment the cart refills.
 */
const EMPTY_CART_GRACE_MS = 7000;
let emptyCartTimer = null;

watch(
  () => cart.isEmpty,
  (empty) => {
    if (emptyCartTimer) {
      clearTimeout(emptyCartTimer);
      emptyCartTimer = null;
    }
    if (!cartReady.value || !empty || submitting.value) return;
    emptyCartTimer = setTimeout(() => {
      if (cart.isEmpty && !submitting.value) navigateTo(localePath("/tickets"));
    }, EMPTY_CART_GRACE_MS);
  }
);

onBeforeUnmount(() => {
  if (emptyCartTimer) clearTimeout(emptyCartTimer);
});

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
  const net = (Number(cart.cachedSubtotal) || 0) - (Number(cart.cachedDiscount) || 0);
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

const hasRegistrationFields = computed(() => registrationFields.value.length > 0);

// The buyer answers for their own ticket; extra attendees fill their own from
// their ticket links after checkout.
const showRegistrationOthersNote = computed(() => cart.count > 1);

// Fail-soft: an old API (404) or an event with no fields ([]) simply hides the
// whole section, leaving the pre-existing checkout untouched.
async function loadRegistrationFields() {
  if (!eventSlug.value) return;
  try {
    const res = await $fetch(`/api/tickets/${eventSlug.value}/registration-fields`, {
      query: { locale: locale.value },
    });
    registrationFields.value = (res?.data ?? res ?? []).filter((f) => f.is_active);
  } catch {
    registrationFields.value = [];
  } finally {
    registrationLoaded.value = true;
  }
}

onMounted(loadRegistrationFields);
// Re-fetch so field labels re-localize when the visitor switches language.
watch(locale, loadRegistrationFields);

function validateRegistration() {
  regErrors.value = {};
  if (!hasRegistrationFields.value) return true;
  let ok = true;
  for (const field of registrationFields.value) {
    const required = field.validation?.required ?? field.required;
    if (!required) continue;
    if (isEmptyValue(regResponses.value[field.ulid])) {
      regErrors.value[`registration.responses.${field.ulid}`] = t("tickets.fieldRequired");
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
    if (typeof data.business_matching === "boolean") businessMatching.value = data.business_matching;
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
          })
        );
      } catch {
        // private mode / storage full - non-fatal
      }
    }, 300);
  }
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
    return ALLOWED_PAYMENT_HOSTS.some((h) => u.host === h || u.host.endsWith(`.${h}`));
  } catch {
    return false;
  }
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
        !(Array.isArray(r.value) && r.value.length === 0)
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
  if (!validateRegistration()) {
    toast.error(t("tickets.fieldRequired"));
    await revealFirstError();
    return;
  }
  if (!validateBusinessMatching()) {
    toast.error(t("tickets.fieldRequired"));
    await revealFirstError();
    return;
  }
  submitting.value = true;
  errors.value = {};

  const payload = {
    event_id: event.id ?? cart.eventId,
    items: cart.items.map((i) => ({
      ticket_id: i.ticket_id,
      quantity: Number(i.qty) || 1,
      ...(i.ticket_session_id ? { ticket_session_id: i.ticket_session_id } : {}),
      ...(i.selected_event_day_id ? { selected_event_day_id: i.selected_event_day_id } : {}),
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

  const promo = (summaryRef.value?.appliedPromo || form.value.promo_code || "").trim();
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

    cart.clear();
    idempotencyKey.value = null;

    // Hard redirects only: a client-side navigateTo races the page teardown
    // here, so use window.location for both the gateway and the result page.
    if (data?.payment_url && isAllowedPaymentUrl(data.payment_url)) {
      window.location.href = data.payment_url;
      return;
    }
    window.location.href = `/tickets/result?order=${data.ulid}`;
  } catch (err) {
    const body = err?.data || {};
    errors.value = body.errors || body.data?.errors || {};
    // Split `registration.responses.{ulid}` keys out so the CustomFieldGroup can
    // show them inline against the right field.
    regErrors.value = Object.fromEntries(
      Object.entries(errors.value).filter(([key]) =>
        key.startsWith("registration.responses.")
      )
    );
    await revealFirstError();
    const message =
      body.message || body.data?.message || t("tickets.submitError");
    toast.error(message);
  } finally {
    submitting.value = false;
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
    ctaLabel: isFree.value
      ? t("tickets.claimFreeTickets")
      : t("tickets.continueToPayment"),
    ctaIcon: "hugeicons:credit-card",
    ctaDisabled: !canSubmit.value,
    submitting: submitting.value,
  });
});

// The bar cannot call submit() directly - it lives outside this page and a
// callback in `useState` breaks SSR serialization. It bumps a counter instead.
watch(() => checkoutBar.value.primaryRequests, () => submit());

onBeforeUnmount(clearTicketCheckoutBar);
</script>

<template>
  <div
    ref="pageRef"
    class="mx-auto max-w-6xl px-4 pt-4 pb-[calc(--spacing(24)+env(safe-area-inset-bottom,0px))] sm:pt-6 lg:pb-16"
  >
    <!-- Header + back link -->
    <div class="mb-6 flex flex-col gap-3">
      <NuxtLink
        :to="localePath('/tickets')"
        class="text-muted-foreground hover:text-primary inline-flex w-fit items-center gap-1.5 text-sm tracking-tight transition"
      >
        <Icon name="hugeicons:arrow-left-01" class="size-4 shrink-0" />
        {{ t("tickets.backToTickets") }}
      </NuxtLink>
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
    <form novalidate @submit.prevent="submit">
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
          <!-- space-y-6, not 5: CustomFieldGroup's own root is space-y-6, so a
               5 here would step the rhythm at the seam between the buyer's
               fields and the event's registration fields. -->
          <div class="frame-panel space-y-6">
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
              <FieldLabel for="buyer_name" required class="text-base leading-snug">
                {{ t("tickets.fullName") }}
              </FieldLabel>
              <Input id="buyer_name" v-model="form.buyer_name" autocomplete="name" required :aria-invalid="!!errors?.buyer_name" />
              <FieldError :errors="errors.buyer_name" />
            </Field>

            <!-- One column. Email is the ticket-delivery address and the highest
                 consequence field on the page; it does not belong in half a row
                 while the name gets a whole one. -->
            <Field :data-invalid="!!errors?.buyer_email">
              <FieldLabel for="buyer_email" required class="text-base leading-snug">
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
              <FieldLabel for="buyer_phone" required class="text-base leading-snug">
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
              <p
                v-if="showRegistrationOthersNote"
                class="text-muted-foreground bg-muted/50 rounded-md px-3 py-2 text-sm tracking-tight"
              >
                {{ t("tickets.registration.othersNote") }}
              </p>
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
        </section>

        <!-- Connect with exhibitors (only when the event has custom fields) -->
        <section v-if="hasCustomFields" class="frame" aria-labelledby="section-connect">
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
          <div class="frame-panel space-y-4">
            <!-- Named, or a screen reader announces two unexplained radios. -->
            <RadioGroup
              :model-value="businessMatching ? 'yes' : 'no'"
              class="flex flex-wrap gap-x-6 gap-y-2"
              aria-labelledby="section-connect section-connect-desc"
              @update:model-value="(v) => (businessMatching = v === 'yes')"
            >
              <!-- `text-base`, matching what CustomFieldRenderer's `labelClass`
                   gives a radio option on this page. Two radio groups at two
                   sizes in one form reads as a bug. -->
              <label class="flex items-center gap-2 text-base tracking-tight">
                <RadioGroupItem value="yes" /> {{ t("tickets.connectYes") }}
              </label>
              <label class="flex items-center gap-2 text-base tracking-tight">
                <RadioGroupItem value="no" /> {{ t("tickets.connectNo") }}
              </label>
            </RadioGroup>

            <div v-if="businessMatching" class="space-y-4 border-t pt-4">
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
                <TicketCartSummary ref="summaryRef" :tickets-by-id="ticketsById" editable />
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
          <section class="space-y-1.5">
            <div class="flex items-start gap-2 text-base tracking-tight">
              <Checkbox
                id="accept-terms"
                :model-value="acceptTerms"
                class="mt-0.5"
                @update:model-value="(v) => (acceptTerms = !!v)"
              />
              <p class="leading-snug">
                <Label
                  for="accept-terms"
                  class="inline text-base font-normal leading-snug"
                  ><!-- The nbsp is a real character, not margin: `ml-1` spaces
                       the words visually but leaves textContent reading
                       "theterms" to a screen reader. -->{{
                    t("tickets.termsConsentPrefix")
                  }}&nbsp;</Label
                >
                <button
                  type="button"
                  class="text-primary hover:text-primary/80 focus-visible:ring-ring rounded-sm underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  @click="termsOpen = true"
                >
                  {{ t("tickets.termsConsentLink") }}
                </button>
              </p>
            </div>
            <FieldError :errors="errors.accept_terms" />
          </section>

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
            <ul class="flex flex-wrap items-center gap-2">
              <li
                v-for="ch in paymentChannels"
                :key="ch.code"
                class="ring-border flex h-7 items-center rounded-md bg-white px-2 ring-1"
              >
                <img
                  :src="ch.logo"
                  :alt="ch.label"
                  class="h-4 w-auto"
                  loading="lazy"
                  decoding="async"
                />
              </li>
            </ul>
          </div>

          <div class="space-y-1.5">
            <!-- aria-disabled, not disabled: a disabled button is not focusable,
                 so a keyboard user tabs straight past it and never learns why it
                 will not accept them. The guard lives in submit(). -->
            <Button
              type="submit"
              class="w-full aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
              size="lg"
              :aria-disabled="!canSubmit || undefined"
              :loading="submitting"
            >
              {{ isFree ? t("tickets.claimFreeTickets") : t("tickets.continueToPayment") }}
            </Button>
            <!-- A validation message, so never text-xs (STYLE_GUIDE). -->
            <p
              v-if="!canSubmit && !submitting"
              class="text-muted-foreground text-sm tracking-tight"
            >
              {{ t("tickets.submitDisabledReason") }}
            </p>
          </div>
        </div>
      </div>
    </form>


    <!-- Terms & Conditions dialog (staff-managed HTML from meta.terms) -->
    <ResponsiveDialog v-model:open="termsOpen" :overflow-content="true" dialog-max-width="40rem">
      <template #default>
        <div class="space-y-4 px-4 pt-5 pb-8 md:px-6 md:py-5">
          <h3 class="text-foreground text-lg font-semibold tracking-tighter">
            {{ t("tickets.termsDialogTitle") }}
          </h3>
          <div
            v-if="terms"
            v-html="terms"
            class="typeset typeset-cms typeset-sm max-w-none tracking-tight"
          ></div>
          <p v-else class="text-muted-foreground text-sm tracking-tight">
            {{ t("tickets.defaultTerms") }}
          </p>
          <div class="flex justify-end pt-1">
            <Button size="sm" @click="termsOpen = false">{{ t("tickets.termsClose") }}</Button>
          </div>
        </div>
      </template>
    </ResponsiveDialog>
  </div>
</template>
