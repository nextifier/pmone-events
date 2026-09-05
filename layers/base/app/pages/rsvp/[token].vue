<template>
  <div class="mx-auto max-w-2xl space-y-6 px-4 pt-4 pb-16">
    <div v-if="pending && !invitation" class="space-y-6">
      <Skeleton class="h-24 w-full rounded-xl" />
      <Skeleton class="h-8 w-72 sm:h-9" />
      <Skeleton class="h-40 w-full rounded-xl" />
      <Skeleton class="h-56 w-full rounded-xl" />
    </div>

    <Empty v-else-if="!invitation" class="mx-auto max-w-md py-12">
      <EmptyHeader>
        <EmptyMedia variant="stacked">
          <Icon name="hugeicons:mail-remove-01" class="text-muted-foreground size-6 shrink-0" />
        </EmptyMedia>
        <EmptyTitle>{{ t("tickets.rsvp.invalidTitle") }}</EmptyTitle>
        <EmptyDescription>{{ t("tickets.rsvp.invalidLink") }}</EmptyDescription>
      </EmptyHeader>
      <Button as-child variant="outline">
        <NuxtLink :to="localePath('/')">
          <Icon name="hugeicons:arrow-left-01" class="size-4 shrink-0" />
          {{ t("ui.backToHome") }}
        </NuxtLink>
      </Button>
    </Empty>

    <template v-else>
      <!-- Event header -->
      <div class="flex items-start gap-4">
        <div
          v-if="poster"
          class="bg-muted ring-border aspect-4/5 w-20 shrink-0 overflow-hidden rounded-xl ring-1 sm:w-24"
        >
          <BlurImage
            :src="poster.md || poster.url"
            :lqip="poster.lqip || ''"
            :alt="eventInfo?.title || ''"
            image-class="size-full object-cover select-none"
          />
        </div>
        <div class="min-w-0 flex-1 space-y-1.5 pt-0.5">
          <p class="text-muted-foreground text-sm tracking-tight">{{ t("tickets.rsvp.eyebrow") }}</p>
          <h1 class="text-foreground text-xl/snug font-semibold tracking-tighter text-balance">
            {{ eventInfo?.title }}
          </h1>
          <div class="text-muted-foreground space-y-1 text-sm tracking-tight">
            <p v-if="eventInfo?.date_label" class="flex items-start gap-1.5">
              <Icon name="hugeicons:calendar-03" class="mt-0.5 size-4 shrink-0" />
              <span>
                {{ eventInfo.date_label }}
                <template v-if="eventInfo.start_time"> · {{ eventInfo.start_time }}<template v-if="eventInfo.end_time"> - {{ eventInfo.end_time }}</template></template>
              </span>
            </p>
            <p v-if="eventInfo?.location" class="flex items-start gap-1.5">
              <Icon name="hugeicons:location-04" class="mt-0.5 size-4 shrink-0" />
              <span>{{ eventInfo.location }}<template v-if="eventInfo.hall"> · {{ eventInfo.hall }}</template></span>
            </p>
          </div>
        </div>
      </div>

      <!-- Outcome after answering -->
      <template v-if="showOutcome">
        <Result
          class="pt-2"
          :status="outcome.status"
          :title="outcome.title"
          :description="outcome.description"
          title-as="h2"
        >
          <ResultActions v-if="invitation.status === 'attending' && invitation.order">
            <Button as-child>
              <NuxtLink :to="localePath(`/tickets/order/${invitation.order.magic_link}`)">
                <Icon name="hugeicons:ticket-01" class="size-4 shrink-0" />
                {{ t("tickets.rsvp.manageTickets") }}
              </NuxtLink>
            </Button>
            <Button v-if="invitation.order.attendee_ulid" as-child variant="outline">
              <NuxtLink :to="localePath(`/tickets/${invitation.order.attendee_ulid}`)">
                {{ t("tickets.rsvp.viewTicket") }}
              </NuxtLink>
            </Button>
          </ResultActions>
        </Result>

        <div v-if="invitation.accepts_responses" class="flex justify-center">
          <Button variant="ghost" size="sm" @click="editing = true">
            <Icon name="hugeicons:edit-02" class="size-4 shrink-0" />
            {{ t("tickets.rsvp.changeAnswer") }}
          </Button>
        </div>
      </template>

      <!-- Closed and never answered -->
      <div v-else-if="!invitation.accepts_responses" class="frame">
        <div class="frame-panel space-y-2">
          <p class="text-foreground text-base font-medium tracking-tight">{{ t("tickets.rsvp.closed") }}</p>
          <p class="text-muted-foreground text-sm tracking-tight">{{ t("tickets.rsvp.closedNote") }}</p>
        </div>
      </div>

      <!-- Respond form -->
      <form v-else class="space-y-6" @submit.prevent="submit">
        <div class="frame">
          <div class="frame-panel space-y-4">
            <div class="space-y-1">
              <p class="text-foreground text-base font-medium tracking-tight">
                {{ t("tickets.rsvp.hello", { name: invitation.name }) }}
              </p>
              <p v-if="invitation.message" class="text-muted-foreground text-sm tracking-tight whitespace-pre-line">
                {{ invitation.message }}
              </p>
              <p v-else class="text-muted-foreground text-sm tracking-tight">
                {{ t("tickets.rsvp.intro") }}
              </p>
              <p v-if="invitation.respond_by" class="text-muted-foreground text-sm tracking-tight">
                {{ t("tickets.rsvp.respondBy", { date: formatDate(invitation.respond_by) }) }}
              </p>
            </div>

            <RadioGroup
              :model-value="form.response"
              class="grid grid-cols-1 gap-2 sm:grid-cols-3"
              @update:model-value="(v) => (form.response = v)"
            >
              <label
                v-for="opt in responseOptions"
                :key="opt.value"
                :for="`rsvp-${opt.value}`"
                class="bg-card hover:bg-muted flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition-colors has-[[data-state=checked]]:border-foreground"
              >
                <RadioGroupItem :id="`rsvp-${opt.value}`" :value="opt.value" />
                <span class="flex min-w-0 items-center gap-2">
                  <Icon :name="opt.icon" class="size-4 shrink-0" :class="opt.iconClass" />
                  <span class="text-sm font-medium tracking-tight">{{ opt.label }}</span>
                </span>
              </label>
            </RadioGroup>
            <FieldError :errors="errors.response" />
          </div>
        </div>

        <!-- Attending details -->
        <div v-if="form.response === 'attending'" class="frame">
          <div class="frame-header">
            <div class="frame-title">{{ t("tickets.rsvp.detailsHeading") }}</div>
          </div>
          <div class="frame-panel">
            <div class="space-y-6">
              <Field v-if="invitation.allowed_guests > 0" :data-invalid="!!errors?.guest_count">
                <FieldLabel for="rsvp-guests" class="text-base leading-snug">
                  {{ t("tickets.rsvp.guestsLabel") }}
                </FieldLabel>
                <NumberField
                  id="rsvp-guests"
                  :model-value="form.guest_count"
                  :min="0"
                  :max="invitation.allowed_guests"
                  class="w-32"
                  @update:model-value="(v) => (form.guest_count = Number(v) || 0)"
                >
                  <NumberFieldContent>
                    <NumberFieldDecrement />
                    <NumberFieldInput />
                    <NumberFieldIncrement />
                  </NumberFieldContent>
                </NumberField>
                <p class="text-muted-foreground text-sm tracking-tight">
                  {{ t("tickets.rsvp.guestsHint", { max: invitation.allowed_guests }) }}
                </p>
                <FieldError :errors="errors.guest_count" />
              </Field>

              <div v-if="form.guest_count > 0" class="space-y-4">
                <div v-for="(g, i) in form.guests" :key="i" class="grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-2">
                  <Field :data-invalid="!!errors?.[`guests.${i}.name`]">
                    <FieldLabel :for="`rsvp-guest-name-${i}`" :required="invitation.guest_names_required" class="text-base leading-snug">
                      {{ t("tickets.rsvp.guestNameLabel", { n: i + 1 }) }}
                    </FieldLabel>
                    <Input
                      :id="`rsvp-guest-name-${i}`"
                      v-model="g.name"
                      autocapitalize="words"
                      :required="invitation.guest_names_required"
                      :aria-invalid="!!errors?.[`guests.${i}.name`]"
                    />
                    <FieldError :errors="errors[`guests.${i}.name`]" />
                  </Field>
                  <Field :data-invalid="!!errors?.[`guests.${i}.email`]">
                    <FieldLabel :for="`rsvp-guest-email-${i}`" class="text-base leading-snug">
                      {{ t("tickets.rsvp.guestEmailLabel") }}
                    </FieldLabel>
                    <Input :id="`rsvp-guest-email-${i}`" v-model="g.email" type="email" autocomplete="off" />
                    <FieldError :errors="errors[`guests.${i}.email`]" />
                  </Field>
                </div>
                <p class="text-muted-foreground text-sm tracking-tight">{{ t("tickets.rsvp.guestEmailHint") }}</p>
              </div>

              <Field v-if="ticket?.requires_day_selection" :data-invalid="!!errors?.selected_event_day_id">
                <FieldLabel for="rsvp-day" required class="text-base leading-snug">{{ t("tickets.rsvp.dayLabel") }}</FieldLabel>
                <Select
                  :model-value="form.selected_event_day_id ? String(form.selected_event_day_id) : ''"
                  @update:model-value="(v) => (form.selected_event_day_id = Number(v))"
                >
                  <SelectTrigger id="rsvp-day" class="w-full">
                    <SelectValue :placeholder="t('ui.selectAnOption')" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="d in ticket.valid_days" :key="d.id" :value="String(d.id)">
                      {{ d.label }}<template v-if="d.date"> · {{ formatDate(d.date) }}</template>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FieldError :errors="errors.selected_event_day_id" />
              </Field>

              <Field v-if="ticket?.requires_session" :data-invalid="!!errors?.ticket_session_id">
                <FieldLabel for="rsvp-session" required class="text-base leading-snug">{{ t("tickets.rsvp.sessionLabel") }}</FieldLabel>
                <Select
                  :model-value="form.ticket_session_id ? String(form.ticket_session_id) : ''"
                  @update:model-value="(v) => (form.ticket_session_id = Number(v))"
                >
                  <SelectTrigger id="rsvp-session" class="w-full">
                    <SelectValue :placeholder="t('ui.selectAnOption')" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="s in ticket.sessions" :key="s.id" :value="String(s.id)">{{ s.label }}</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError :errors="errors.ticket_session_id" />
              </Field>

              <template v-if="registrationFields.length">
                <div class="space-y-1 border-t pt-6">
                  <p class="text-foreground text-base font-medium tracking-tight">{{ t("tickets.registration.heading") }}</p>
                </div>
                <CustomFieldGroup
                  :model-value="form.registration"
                  :fields="registrationFields"
                  :errors="registrationErrors"
                  error-prefix="registration."
                  :locale="locale"
                  label-size="lg"
                  @update:model-value="(v) => (form.registration = v)"
                />
              </template>
            </div>
          </div>
        </div>

        <div v-else-if="form.response === 'declined'" class="frame">
          <div class="frame-panel">
            <Field>
              <FieldLabel for="rsvp-reason" class="text-base leading-snug">{{ t("tickets.rsvp.reasonLabel") }}</FieldLabel>
              <Textarea id="rsvp-reason" v-model="form.decline_reason" :rows="3" :placeholder="t('tickets.rsvp.reasonPlaceholder')" />
            </Field>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2">
          <Button v-if="editing" type="button" variant="outline" @click="editing = false">
            {{ t("ui.back") }}
          </Button>
          <Button type="submit" size="lg" :disabled="submitting">
            <Icon v-if="submitting" name="svg-spinners:180-ring" class="size-4 shrink-0" />
            {{ submitting ? t("tickets.rsvp.submitting") : t("tickets.rsvp.submit") }}
          </Button>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup>
import { Button } from "../../components/ui/button";
import { BlurImage } from "../../components/ui/blur-image";
import { CustomFieldGroup } from "../../components/ui/custom-field";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../../components/ui/empty";
import { Field, FieldError, FieldLabel } from "../../components/ui/field";
import { Input } from "../../components/ui/input";
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from "../../components/ui/number-field";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Result, ResultActions } from "../../components/ui/result";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Skeleton } from "../../components/ui/skeleton";
import { Textarea } from "../../components/ui/textarea";
import { computed, reactive, ref, watch } from "vue";
import { toast } from "vue-sonner";

definePageMeta({
  layout: "default",
  noFooter: true,
});

const { t, locale } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const token = computed(() => route.params.token);

const { data, pending, refresh } = await useLazyAsyncData(
  () => `rsvp-${token.value}`,
  () =>
    $fetch(`/api/rsvp/${token.value}`, {
      query: { locale: locale.value },
    }).catch(() => null)
);

const invitation = computed(() => data.value?.data ?? null);
const eventInfo = computed(() => data.value?.event ?? null);
const ticket = computed(() => data.value?.ticket ?? null);
const registrationFields = computed(() => data.value?.meta?.registration_fields ?? []);
const registrationAnswers = computed(() => data.value?.meta?.registration_answers ?? {});
const poster = computed(() => eventInfo.value?.poster_image ?? null);

usePageMeta(null, {
  title: computed(() => [t("tickets.rsvp.title"), eventInfo.value?.title].filter(Boolean).join(" · ")),
});

// "Answered" means anything but the untouched invitation. `editing` reopens
// the form on top of an existing answer.
const editing = ref(false);
const showOutcome = computed(
  () => !!invitation.value && invitation.value.status !== "invited" && invitation.value.status !== "cancelled" && !editing.value
);

const responseOptions = computed(() => [
  { value: "attending", label: t("tickets.rsvp.yes"), icon: "hugeicons:checkmark-circle-02", iconClass: "text-success-foreground" },
  { value: "declined", label: t("tickets.rsvp.no"), icon: "hugeicons:cancel-circle", iconClass: "text-destructive-foreground" },
  { value: "maybe", label: t("tickets.rsvp.maybe"), icon: "hugeicons:help-circle", iconClass: "text-warning-foreground" },
]);

const form = reactive({
  response: "attending",
  guest_count: 0,
  guests: [],
  selected_event_day_id: null,
  ticket_session_id: null,
  decline_reason: "",
  registration: {},
});
const errors = ref({});
const submitting = ref(false);

const registrationErrors = computed(() =>
  Object.fromEntries(Object.entries(errors.value).filter(([key]) => key.startsWith("registration.")))
);

// Seed the form from whatever the guest already answered, so "change my
// answer" starts from their party rather than from zero.
watch(
  invitation,
  (inv) => {
    if (!inv) return;
    form.response = inv.status === "declined" || inv.status === "maybe" ? inv.status : "attending";
    form.guest_count = inv.status === "attending" || inv.status === "waitlisted" ? inv.guest_count : 0;
    form.guests = (inv.guests ?? []).map((g) => ({ name: g.name || "", email: g.email || "" }));
    form.selected_event_day_id = inv.selected_event_day_id ?? (ticket.value?.valid_days?.length === 1 ? ticket.value.valid_days[0].id : null);
    form.ticket_session_id = inv.ticket_session_id ?? null;
    form.decline_reason = inv.decline_reason || "";
    form.registration = { ...(registrationAnswers.value || {}) };
    syncGuests();
  },
  { immediate: true }
);

function syncGuests() {
  const count = Number(form.guest_count) || 0;
  while (form.guests.length < count) form.guests.push({ name: "", email: "" });
  form.guests.splice(count);
}
watch(() => form.guest_count, syncGuests);

const outcome = computed(() => {
  const status = invitation.value?.status;
  const map = {
    attending: {
      status: "success",
      title: t("tickets.rsvp.attendingTitle"),
      // No inbox to point at when the invitee was reached by phone only.
      description: invitation.value?.email
        ? t("tickets.rsvp.attendingDescription")
        : t("tickets.rsvp.attendingDescriptionNoEmail"),
    },
    waitlisted: { status: "pending", title: t("tickets.rsvp.waitlistedTitle"), description: t("tickets.rsvp.waitlistedDescription") },
    declined: { status: "info", title: t("tickets.rsvp.declinedTitle"), description: t("tickets.rsvp.declinedDescription") },
    maybe: { status: "pending", title: t("tickets.rsvp.maybeTitle"), description: t("tickets.rsvp.maybeDescription") },
  };
  return map[status] || map.maybe;
});

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat(locale.value, { dateStyle: "long" }).format(new Date(value));
  } catch {
    return value;
  }
}

async function submit() {
  submitting.value = true;
  errors.value = {};

  const body = {
    response: form.response,
    ...(form.response === "attending"
      ? {
          guest_count: Number(form.guest_count) || 0,
          guests: form.guests.map((g) => ({ name: g.name || null, email: g.email || null })),
          ...(form.selected_event_day_id ? { selected_event_day_id: form.selected_event_day_id } : {}),
          ...(form.ticket_session_id ? { ticket_session_id: form.ticket_session_id } : {}),
          registration: form.registration,
        }
      : {}),
    ...(form.response === "declined" ? { decline_reason: form.decline_reason || null } : {}),
  };

  try {
    const res = await $fetch(`/api/rsvp/${token.value}/respond`, {
      method: "POST",
      body,
      query: { locale: locale.value },
    });
    if (res?.data) data.value = { ...data.value, ...res };
    editing.value = false;
    // Local copy, not the backend's message: the API speaks English and the
    // outcome card below already says what happened in the guest's language.
    toast.success(t("tickets.rsvp.saved"));
    window.scrollTo({ top: 0, behavior: "smooth" });
    await refresh();
  } catch (err) {
    const payload = err?.data || {};
    errors.value = payload.errors || payload.data?.errors || {};
    const message = payload.message || payload.data?.message || payload.statusMessage || t("tickets.rsvp.saveError");
    toast.error(message);
  } finally {
    submitting.value = false;
  }
}
</script>
