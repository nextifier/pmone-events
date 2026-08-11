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
import { computed, onMounted, ref, watch } from "vue";
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

// Re-check after hydration in case the store cleared the cart.
watch(
  () => cart.isEmpty,
  (empty) => {
    if (cartReady.value && empty && !submitting.value) {
      navigateTo(localePath("/tickets"));
    }
  }
);

// --- Tickets (data + meta.terms) ---
// Await the event payload before deriving the URL below: `useEvent()` does not
// await its own fetch, so without this `event.slug` is still "" during SSR and
// the request goes to `/api/tickets/` (no slug), which 404s into the SSR
// renderer. Shares the `active-event` asyncData entry — no extra request.
await useEventData();

const eventSlug = computed(() => cart.eventSlug || event.slug);

const { data: ticketsData, refresh: refreshTickets } = await useFetch(
  () => `/api/tickets/${eventSlug.value}`,
  {
    key: () => `checkout-tickets-${eventSlug.value}-${locale.value}`,
    query: { locale },
    watch: [locale, eventSlug],
    default: () => ({ data: [], meta: {} }),
  }
);

const ticketsById = computed(() => {
  const map = {};
  for (const ticket of ticketsData.value?.data ?? []) map[ticket.id] = ticket;
  return map;
});

const terms = computed(() => ticketsData.value?.meta?.terms || "");

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

async function submit() {
  if (!canSubmit.value) return;
  if (!validateRegistration()) {
    toast.error(t("tickets.fieldRequired"));
    return;
  }
  if (!validateBusinessMatching()) {
    toast.error(t("tickets.fieldRequired"));
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
    const res = await $fetch("/api/tickets/orders", { method: "POST", body: payload });
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
    const message =
      body.message || body.data?.message || t("tickets.submitError");
    toast.error(message);
  } finally {
    submitting.value = false;
  }
}

const termsOpen = ref(false);
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 pt-4 pb-24 sm:pt-6 lg:pb-16">
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

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
      <!-- Order summary (sticky on desktop) -->
      <aside class="lg:col-span-5 lg:order-2">
        <div class="lg:sticky lg:top-(--navbar-height-desktop)">
          <div class="frame">
            <div class="frame-header">
              <div class="frame-title">{{ t("tickets.orderSummary") }}</div>
            </div>
            <div class="frame-panel">
              <TicketCartSummary ref="summaryRef" :tickets-by-id="ticketsById" editable />
            </div>
          </div>
        </div>
      </aside>

      <!-- Form -->
      <div class="space-y-6 lg:col-span-7 lg:order-1">
        <!-- Buyer details -->
        <section class="frame">
          <div class="frame-header">
            <div class="frame-title">{{ t("tickets.yourDetails") }}</div>
          </div>
          <div class="frame-panel space-y-5">
            <Field :data-invalid="!!errors?.buyer_name">
              <FieldLabel for="buyer_name">{{ t("tickets.fullName") }}</FieldLabel>
              <Input id="buyer_name" v-model="form.buyer_name" autocomplete="name" required :aria-invalid="!!errors?.buyer_name" />
              <FieldError :errors="errors.buyer_name" />
            </Field>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field :data-invalid="!!errors?.buyer_email">
                <FieldLabel for="buyer_email">{{ t("tickets.email") }}</FieldLabel>
                <Input
                  :aria-invalid="!!errors?.buyer_email"
                  id="buyer_email"
                  v-model="form.buyer_email"
                  type="email"
                  autocomplete="email"
                  required
                />
                <FieldError :errors="errors.buyer_email" />
                <p class="text-muted-foreground text-xs tracking-tight sm:text-sm">
                  {{ t("tickets.detailsNote") }}
                </p>
              </Field>
              <Field :data-invalid="!!errors?.buyer_phone">
                <FieldLabel for="buyer_phone">{{ t("tickets.phone") }}</FieldLabel>
                <InputPhone
                  :aria-invalid="!!errors?.buyer_phone"
                  id="buyer_phone"
                  :model-value="form.buyer_phone"
                  required
                  @update:model-value="(v) => (form.buyer_phone = v)"
                />
                <FieldError :errors="errors.buyer_phone" />
              </Field>
            </div>
          </div>
        </section>

        <!-- Registration details (event's active ticket_registration fields) -->
        <section v-if="hasRegistrationFields" class="frame">
          <div class="frame-header">
            <div class="frame-title">{{ t("tickets.registration.heading") }}</div>
            <p class="text-muted-foreground mt-1 text-xs tracking-tight sm:text-sm">
              {{ t("tickets.registration.subtitle") }}
            </p>
          </div>
          <div class="frame-panel space-y-4">
            <p
              v-if="showRegistrationOthersNote"
              class="text-muted-foreground bg-muted/50 rounded-md px-3 py-2 text-xs tracking-tight sm:text-sm"
            >
              {{ t("tickets.registration.othersNote") }}
            </p>
            <CustomFieldGroup
              v-model="regResponses"
              :fields="registrationFields"
              :errors="regErrors"
              error-prefix="registration.responses."
              :locale="locale"
            />
          </div>
        </section>

        <!-- Connect with exhibitors (only when the event has custom fields) -->
        <section v-if="hasCustomFields" class="frame">
          <div class="frame-header">
            <div class="frame-title">{{ t("tickets.connectHeading") }}</div>
            <p class="text-muted-foreground mt-1 text-xs tracking-tight sm:text-sm">
              {{ t("tickets.connectSubtitle") }}
            </p>
          </div>
          <div class="frame-panel space-y-4">
            <RadioGroup
              :model-value="businessMatching ? 'yes' : 'no'"
              class="flex flex-wrap gap-x-6 gap-y-2"
              @update:model-value="(v) => (businessMatching = v === 'yes')"
            >
              <label class="flex items-center gap-2 text-sm tracking-tight">
                <RadioGroupItem value="yes" /> {{ t("tickets.connectYes") }}
              </label>
              <label class="flex items-center gap-2 text-sm tracking-tight">
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
                :model-value="bmResponses[field.id]"
                :error="bmErrors[field.id]"
                @update:model-value="(v) => (bmResponses[field.id] = v)"
              />
            </div>
          </div>
        </section>

        <!-- Terms consent -->
        <section class="space-y-1.5">
          <div class="flex items-start gap-2 text-sm tracking-tight">
            <Checkbox
              id="accept-terms"
              :model-value="acceptTerms"
              class="mt-0.5"
              @update:model-value="(v) => (acceptTerms = !!v)"
            />
            <Label for="accept-terms" class="block font-normal leading-snug">
              {{ t("tickets.termsConsentPrefix") }}
              <button
                type="button"
                class="text-primary hover:text-primary/80 focus-visible:ring-ring rounded-sm underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                @click.stop.prevent="termsOpen = true"
              >
                {{ t("tickets.termsConsentLink") }}
              </button>
              {{ t("tickets.termsConsentSuffix") }}
            </Label>
          </div>
          <FieldError :errors="errors.accept_terms" />
        </section>

        <Button
          type="button"
          class="w-full"
          size="lg"
          :disabled="!canSubmit"
          :aria-busy="submitting"
          @click="submit"
        >
          <Icon v-if="submitting" name="svg-spinners:180-ring" class="size-4 shrink-0" />
          <span>{{ isFree ? t("tickets.claimFreeTickets") : t("tickets.continueToPayment") }}</span>
        </Button>
      </div>
    </div>

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
