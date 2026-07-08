<template>
  <div class="mx-auto max-w-md space-y-6 px-4 pt-4 pb-16">
    <div v-if="pending" class="space-y-6">
      <div class="space-y-1.5 pt-2 text-center">
        <Skeleton class="mx-auto h-8 w-48 sm:h-9" />
        <Skeleton class="mx-auto h-4 w-32" />
      </div>
      <Skeleton class="h-80 w-full rounded-3xl" />
      <Skeleton class="h-64 w-full rounded-xl" />
    </div>

    <div
      v-else-if="!attendee"
      class="text-muted-foreground rounded-md border border-dashed py-12 text-center text-sm tracking-tight"
    >
      {{ t("tickets.attendee.ticketNotFound") }}
    </div>

    <template v-else>
      <!-- Event header: small original-ratio poster (tap to enlarge) + details -->
      <div class="flex items-start gap-4">
        <Lightbox
          v-if="event?.posterImage"
          :items="posterItems"
          :show-thumbnails="false"
          full-key="xl"
          :alt="event?.title"
        >
          <template #trigger="{ openAt }">
            <button
              type="button"
              class="bg-muted ring-border block aspect-4/5 w-20 shrink-0 cursor-zoom-in overflow-hidden rounded-xl ring-1 transition active:scale-98 sm:w-24"
              :aria-label="t('ui.viewPoster')"
              @click="openAt(0)"
            >
              <BlurImage
                :src="event.posterImage.lg || event.posterImage.md || event.posterImage.url"
                :lqip="event.posterImage.lqip || ''"
                :alt="event.title"
                image-class="size-full object-cover select-none"
              />
            </button>
          </template>
        </Lightbox>

        <div class="min-w-0 flex-1 space-y-1.5 pt-0.5">
          <h1 class="text-foreground text-xl/snug font-semibold tracking-tighter text-balance">
            {{ event?.title || eventTitle || t("tickets.attendee.title") }}
          </h1>
          <div class="text-muted-foreground space-y-1 text-sm tracking-tight">
            <p v-if="event?.date" class="flex items-start gap-1.5">
              <Icon name="hugeicons:calendar-03" class="mt-0.5 size-4 shrink-0" />
              <span>{{ event.date }}<template v-if="event?.time"> · {{ event.time }}</template></span>
            </p>
            <p v-if="event?.location" class="flex items-start gap-1.5">
              <Icon name="hugeicons:location-04" class="mt-0.5 size-4 shrink-0" />
              <span>{{ event.location }}</span>
            </p>
          </div>
        </div>
      </div>

      <ETicket
        :attendee="attendee"
        :event-title="event?.title || eventTitle"
        :event-date="[event?.date, event?.time].filter(Boolean).join(' · ')"
        :event-venue="event?.location || ''"
        :order-number="orderInfo ? t('tickets.attendee.order', { number: orderInfo.order_number }) : ''"
        :locked="isLocked"
      />

      <!-- Pending order: the QR is withheld until payment is confirmed. -->
      <div v-if="isLocked" class="frame">
        <div class="frame-header">
          <div class="frame-title">{{ t("tickets.attendee.pendingTitle") }}</div>
        </div>
        <div class="frame-panel">
          <p class="text-muted-foreground text-sm tracking-tight">
            {{ t("tickets.attendee.pendingNote") }}
          </p>
        </div>
      </div>

      <!-- One-click dashboard sign-in is intentionally NOT shown here. It lives
           only in the e-ticket email (the email proves the holder owns the
           address), reached via ?login=<token>. See the auto-login below. -->
      <div
        v-if="signingIn"
        class="text-muted-foreground flex items-center justify-center gap-2 py-2 text-sm tracking-tight"
      >
        <Icon name="svg-spinners:180-ring" class="size-4 shrink-0" />
        <span>{{ t("tickets.attendee.goToDashboard") }}…</span>
      </div>

      <!-- Personalize (only while still editable; once checked in there is nothing to do) -->
      <div v-if="!attendee.is_checked_in" class="frame">
        <div class="frame-header">
          <div class="frame-title">{{ t("tickets.attendee.personalizeTitle") }}</div>
        </div>
        <div class="frame-panel space-y-4">
          <p class="text-muted-foreground text-sm tracking-tight">
            {{ t("tickets.attendee.personalizeIntro") }}
          </p>

          <div class="space-y-2">
            <Label for="att_name">{{ t("tickets.attendee.fullName") }}</Label>
            <Input id="att_name" v-model="form.name" required />
            <FieldError :errors="errors.name" />
          </div>

          <div class="space-y-2">
            <Label for="att_email">{{ t("tickets.attendee.emailOptional") }}</Label>
            <Input id="att_email" v-model="form.email" type="email" />
            <FieldError :errors="errors.email" />
          </div>

          <div class="space-y-2">
            <Label for="att_phone">{{ t("tickets.attendee.phoneOptional") }}</Label>
            <InputPhone
              id="att_phone"
              :model-value="form.phone"
              @update:model-value="(v) => (form.phone = v)"
            />
            <FieldError :errors="errors.phone" />
          </div>

          <Button
            type="button"
            class="w-full"
            :disabled="saving || !form.name?.trim()"
            @click="personalize"
          >
            <Icon v-if="saving" name="svg-spinners:180-ring" class="size-4" />
            <span>{{ saving ? t("tickets.attendee.saving") : t("tickets.attendee.save") }}</span>
          </Button>
        </div>
      </div>

      <!-- Registration details (event's active ticket_registration fields) -->
      <div v-if="registrationFields.length" class="frame">
        <Collapsible v-model:open="regOpen" class="frame-panel">
          <CollapsibleTrigger
            class="flex w-full items-center justify-between gap-2 text-left"
          >
            <span class="text-foreground text-sm font-medium tracking-tight">
              {{ t("tickets.registration.attendeeHeading") }}
            </span>
            <span class="flex items-center gap-2">
              <span class="text-muted-foreground text-xs tracking-tight tabular-nums">
                {{ t("tickets.registration.progress", regProgress) }}
              </span>
              <Icon
                name="hugeicons:arrow-down-01"
                class="text-muted-foreground size-4 shrink-0 transition-transform"
                :class="regOpen ? 'rotate-180' : ''"
              />
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent class="space-y-4 pt-4">
            <CustomFieldGroup
              v-model="regDraft"
              :fields="registrationFields"
              :errors="regErrors"
              error-prefix="registration."
              :locale="locale"
              :disabled="attendee.is_checked_in"
            />
            <Button
              type="button"
              class="w-full"
              :disabled="attendee.is_checked_in || regSaving"
              @click="saveRegistration"
            >
              <Icon v-if="regSaving" name="svg-spinners:180-ring" class="size-4 shrink-0" />
              <span>{{ regSaving ? t("tickets.attendee.saving") : t("tickets.attendee.save") }}</span>
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </template>
  </div>
</template>

<script setup>
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { InputPhone } from "../../components/ui/input-phone";
import { FieldError } from "../../components/ui/field";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/ui/collapsible";
import { CustomFieldGroup, isEmptyValue } from "../../components/ui/custom-field";
import ETicket from "../../components/tickets/ETicket.vue";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { toast } from "vue-sonner";

definePageMeta({
  layout: "default",
  noFooter: true,
});

const { t, locale } = useI18n();
const route = useRoute();
const ulid = computed(() => route.params.attendeeUlid);

const { data, pending, refresh } = await useLazyAsyncData(
  () => `attendee-${ulid.value}`,
  () =>
    $fetch(`/api/tickets/attendees/${ulid.value}`, {
      query: { locale: locale.value },
    }).catch(() => null)
);

const attendee = computed(() => data.value?.data ?? null);
const orderInfo = computed(() => data.value?.order ?? null);
const eventTitle = computed(() => data.value?.event?.title ?? "");

// Registration questions the holder can still answer, empty when the event has
// none - so existing e-tickets render unchanged.
const registrationFields = computed(() => data.value?.registration_fields ?? []);

// The backend withholds qr_token until the order is confirmed, so a missing
// token on a loaded attendee means the ticket is still awaiting payment.
const isLocked = computed(() => !!attendee.value && !attendee.value.qr_token);

// Event hero data (poster, date, venue) for the header - the e-ticket is always
// viewed on its own event site, so the active event matches the ticket's event.
const event = useEvent();

const posterItems = computed(() => {
  const p = event.posterImage;
  if (!p) return [];
  return [
    {
      sm: p.md || p.url,
      md: p.md || p.url,
      lg: p.lg || p.url,
      xl: p.xl || p.lg || p.url,
      url: p.url,
      lqip: p.lqip,
      alt: event.title,
    },
  ];
});

usePageMeta(null, {
  title: computed(() => `${t("tickets.attendee.title")} · ${attendee.value?.name || orderInfo.value?.order_number || ""}`),
});

const form = reactive({ name: "", email: "", phone: "" });
const errors = ref({});
const saving = ref(false);

// Registration answers (keyed by field ulid), its own draft + save state.
const regDraft = ref({});
const regOpen = ref(false);
const regErrors = ref({});
const regSaving = ref(false);
let regSeeded = false;

const regProgress = computed(() => {
  const done = registrationFields.value.filter(
    (f) => !isEmptyValue(regDraft.value[f.ulid])
  ).length;
  return { done, total: registrationFields.value.length };
});

async function saveRegistration() {
  if (attendee.value?.is_checked_in) return;
  regSaving.value = true;
  regErrors.value = {};
  try {
    await $fetch(`/api/tickets/attendees/${ulid.value}`, {
      method: "PATCH",
      body: { registration: regDraft.value },
    });
    toast.success(t("tickets.registration.saved"));
    await refresh();
  } catch (err) {
    const body = err?.data || {};
    regErrors.value = body.errors || body.data?.errors || {};
    toast.error(body.message || body.data?.message || t("tickets.attendee.saveError"));
  } finally {
    regSaving.value = false;
  }
}

const dashboardLoading = ref(false);
const signingIn = ref(false);

async function goToDashboard(token) {
  if (dashboardLoading.value) return;
  dashboardLoading.value = true;
  try {
    const res = await $fetch(`/api/tickets/attendees/${ulid.value}/dashboard-link`, {
      method: "POST",
      body: { token },
    });
    if (res?.url) {
      window.location.href = res.url;
      return;
    }
    toast.error(t("tickets.attendee.dashboardError"));
  } catch (err) {
    toast.error(err?.data?.message || t("tickets.attendee.dashboardError"));
  } finally {
    dashboardLoading.value = false;
  }
}

// One-click sign-in lives ONLY in the e-ticket email, whose button appends a
// secret ?login=<token>. The page carries no sign-in button, so a bystander with
// just the shareable URL can't trigger it. The backend validates the token and
// signs the holder into their account by email (works for returning accounts).
const loginToken = computed(() => {
  const q = route.query.login;
  return typeof q === "string" && q.length > 0 ? q : "";
});

onMounted(() => {
  if (!loginToken.value) return;
  signingIn.value = true;
  // On success the browser navigates away to the magic-link; the spinner is only
  // cleared if sign-in fails (a toast already explains why).
  goToDashboard(loginToken.value).finally(() => {
    signingIn.value = false;
  });
});

watch(
  attendee,
  (a) => {
    if (a && !form.name) {
      form.name = a.name || "";
      form.phone = a.phone || "";
      form.email = a.email || "";
    }
    if (a && !regSeeded) {
      regDraft.value = { ...(a.registration_answers || {}) };
      regSeeded = true;
    }
  },
  { immediate: true }
);

async function personalize() {
  const name = form.name?.trim();
  if (!name) return;
  saving.value = true;
  errors.value = {};
  try {
    const body = { name };
    if (form.email?.trim()) body.email = form.email.trim();
    if (form.phone?.trim()) body.phone = String(form.phone).trim();
    await $fetch(`/api/tickets/attendees/${ulid.value}`, { method: "PATCH", body });
    toast.success(t("tickets.attendee.personalized"));
    await refresh();
  } catch (err) {
    const respBody = err?.data || {};
    errors.value = respBody.errors || {};
    toast.error(respBody.message || t("tickets.attendee.saveError"));
  } finally {
    saving.value = false;
  }
}
</script>
