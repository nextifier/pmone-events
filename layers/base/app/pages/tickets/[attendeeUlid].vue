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
          <h1 class="text-primary text-xl/snug font-semibold tracking-tighter text-balance">
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
      />

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
            <InputErrorMessage :errors="errors.name" />
          </div>

          <div class="space-y-2">
            <Label for="att_email">{{ t("tickets.attendee.emailOptional") }}</Label>
            <Input id="att_email" v-model="form.email" type="email" />
            <InputErrorMessage :errors="errors.email" />
          </div>

          <div class="space-y-2">
            <Label for="att_phone">{{ t("tickets.attendee.phoneOptional") }}</Label>
            <InputPhone
              id="att_phone"
              :model-value="form.phone"
              @update:model-value="(v) => (form.phone = v)"
            />
            <InputErrorMessage :errors="errors.phone" />
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
    </template>
  </div>
</template>

<script setup>
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { InputPhone } from "../../components/ui/input-phone";
import { InputErrorMessage } from "../../components/ui/input-error-message";
import { Skeleton } from "../../components/ui/skeleton";
import ETicket from "../../components/tickets/ETicket.vue";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { toast } from "vue-sonner";

definePageMeta({
  layout: "default",
  noFooter: true,
});

const { t } = useI18n();
const route = useRoute();
const ulid = computed(() => route.params.attendeeUlid);

const { data, pending, refresh } = await useLazyAsyncData(
  () => `attendee-${ulid.value}`,
  () => $fetch(`/api/tickets/attendees/${ulid.value}`).catch(() => null)
);

const attendee = computed(() => data.value?.data ?? null);
const orderInfo = computed(() => data.value?.order ?? null);
const eventTitle = computed(() => data.value?.event?.title ?? "");

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
