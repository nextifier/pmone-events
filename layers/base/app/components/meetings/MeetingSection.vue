<!--
  "Meet {brand}" on an exhibitor page of the event website. Client-only: the
  grid depends on who is looking (their own request, their other meetings, the
  days their ticket admits), and the page around it may be cached.

  It says who it is for before anyone picks a time: ticket holders, confirmed
  with their ticket email. Signed-in visitors see whose account books.
-->
<template>
  <section v-if="state !== 'hidden'" class="w-full space-y-4 text-left">
    <div class="space-y-1">
      <h2 class="text-foreground text-xl font-semibold tracking-tighter">
        {{ $t("meetings.panel.title", { brand: brandName }) }}
      </h2>
      <p class="text-muted-foreground text-sm tracking-tight">
        {{ approval === "auto" ? $t("meetings.panel.subtitleAuto") : $t("meetings.panel.subtitle", { brand: brandName }) }}
      </p>
      <p class="text-muted-foreground text-sm tracking-tight">
        <template v-if="visitor">
          {{ $t("meetings.signIn.bookingAs", { email: visitor.email }) }}
          <Button variant="link" size="sm" class="h-auto p-0 align-baseline" @click="signOut">{{ $t("meetings.signIn.notYou") }}</Button>
        </template>
        <template v-else>{{ $t("meetings.signIn.forHolders") }}</template>
      </p>
    </div>

    <div v-if="state === 'loading'" class="grid grid-cols-2 gap-2">
      <Skeleton v-for="i in 2" :key="i" class="h-9 rounded-lg" />
    </div>

    <p v-else-if="state === 'error'" class="text-muted-foreground text-sm tracking-tight">
      {{ $t("meetings.panel.loadFailed") }}
      <Button variant="link" size="sm" class="h-auto p-0" @click="load">{{ $t("meetings.common.retry") }}</Button>
    </p>

    <template v-else-if="data">
      <div v-if="myMeeting" class="border-border space-y-3 rounded-xl border p-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="text-sm font-medium tracking-tight tabular-nums">{{ meetingWhen(myMeeting, locale) }}</p>
          <MeetingStatusBadge :status="myMeeting.status" :awaits-visitor="myMeeting.awaits_visitor" />
        </div>
        <p v-if="myMeeting.where && myMeeting.status === 'accepted'" class="text-sm tracking-tight">{{ myMeeting.where }}</p>
        <MeetingOutcome :meeting="myMeeting" :brand-name="brandName" />

        <div v-if="myMeeting.suggested_slots?.length" class="space-y-2">
          <p class="text-sm font-medium tracking-tight">{{ $t("meetings.panel.suggested", { brand: brandName }) }}</p>
          <div class="flex flex-wrap gap-1.5">
            <Button
              v-for="key in myMeeting.suggested_slots"
              :key="key"
              variant="outline"
              size="sm"
              :loading="busy === key"
              @click="takeSuggestion(key)"
            >
              {{ meetingDay(key, zone, locale) }} · {{ suggestedRange(key) }}
            </Button>
          </div>
        </div>

        <div v-if="myMeeting.awaits_visitor" class="flex flex-wrap items-center gap-x-1.5 gap-y-2.5">
          <Button size="sm" :loading="busy === 'accept'" @click="answer('accept')">{{ $t("meetings.actions.acceptInvitation") }}</Button>
          <Button size="sm" variant="outline" :loading="busy === 'decline'" @click="answer('decline')">
            {{ $t("meetings.actions.declineInvitation") }}
          </Button>
        </div>

        <div v-if="myMeeting.can_change" class="flex flex-wrap items-center gap-x-1.5 gap-y-2.5">
          <Button v-if="!changing" variant="outline" size="sm" @click="startChange">
            <Icon name="hugeicons:calendar-03" class="size-4 shrink-0" />
            <span>{{ $t("meetings.actions.changeTime") }}</span>
          </Button>
          <Button variant="outline" size="sm" @click="cancelOpen = true">
            <Icon name="hugeicons:cancel-circle" class="size-4 shrink-0" />
            <span>{{ myMeeting.status === "accepted" ? $t("meetings.actions.cancelMeeting") : $t("meetings.actions.cancelRequest") }}</span>
          </Button>
        </div>
      </div>

      <!-- The next exhibitor is one tap away: those matching the visitor's
           answers first, then the whole list narrowed to meetings. -->
      <MeetingSuggestions
        v-if="myOpen && !changing"
        :items="suggestions"
        :to="(item) => localePath(`/brands/${item.slug}`)"
      />
      <Button v-if="myOpen && !changing" variant="outline" :to="`${localePath('/brands')}?meetings=1`">
        <Icon name="hugeicons:store-01" class="size-4 shrink-0" />
        <span>{{ $t("meetings.actions.findMore") }}</span>
      </Button>

      <p
        v-if="blockReason"
        class="text-muted-foreground border-border rounded-xl border border-dashed px-3 py-2.5 text-sm tracking-tight"
      >
        {{ blockReason }}
      </p>

      <template v-else-if="showPicker">
        <p v-if="changing" class="text-sm tracking-tight">
          {{ myMeeting?.status === "accepted" ? $t("meetings.panel.changeConfirmedNote", { brand: brandName }) : $t("meetings.panel.changePendingNote") }}
        </p>

        <MeetingSlotGrid
          v-model="selectedKey"
          :days="data.days"
          :timezone="zone"
          :brand-name="brandName"
          :my-status="myMeeting?.status"
        />

        <!-- The note rides along with the request; optional ones stay folded
             so booking the next exhibitor is two picks and one tap. -->
        <div v-if="messageRequired || noteOpen" class="space-y-2">
          <Label for="meeting-message" :required="messageRequired">{{ $t("meetings.request.messageLabel") }}</Label>
          <Textarea
            id="meeting-message"
            v-model="message"
            rows="2"
            maxlength="1000"
            :placeholder="$t('meetings.request.messagePlaceholder')"
          />
          <p class="text-muted-foreground text-sm tracking-tight">
            {{ messageRequired ? $t("meetings.request.messageHelpRequired") : $t("meetings.request.messageHelp") }}
          </p>
        </div>

        <p v-if="sendError" class="text-destructive-foreground text-sm tracking-tight" role="alert">{{ sendError }}</p>

        <div class="flex flex-wrap items-center gap-x-1.5 gap-y-2.5">
          <Button
            size="lg"
            class="active:scale-98"
            :disabled="!selectedKey || (messageRequired && !message.trim())"
            :loading="busy === 'send'"
            @click="request"
          >
            {{ changing ? $t("meetings.actions.useThisTime") : approval === "auto" ? $t("meetings.actions.book") : $t("meetings.actions.request") }}
          </Button>
          <Button v-if="!messageRequired && !noteOpen" variant="ghost" @click="noteOpen = true">
            <Icon name="hugeicons:note-add" class="size-4 shrink-0" />
            <span>{{ $t("meetings.request.addNote") }}</span>
          </Button>
          <Button v-if="changing" variant="ghost" @click="stopChange">{{ $t("meetings.common.back") }}</Button>
        </div>
        <p v-if="quotaNote" class="text-muted-foreground text-sm tracking-tight">{{ quotaNote }}</p>
      </template>
    </template>

    <MeetingRequestDialog
      v-model:open="requestOpen"
      :event-slug="eventSlug"
      :event-title="eventTitle"
      :brand-name="brandName"
      :brand-slug="brandSlug"
      :slot-key="selectedKey"
      :submit="submit"
      @signed-in="load"
      @sent="onSent"
      @failed="onFailed"
    />

    <ResponsiveDialog v-model:open="cancelOpen" :title="$t('meetings.cancel.title')">
      <div class="space-y-4 px-4 pt-5 pb-8 md:px-6 md:py-5">
        <div class="space-y-1">
          <h2 class="text-lg font-semibold tracking-tighter">
            {{ myMeeting?.status === "accepted" ? $t("meetings.cancel.titleMeeting") : $t("meetings.cancel.titleRequest") }}
          </h2>
          <p class="text-muted-foreground text-sm tracking-tight">
            {{
              myMeeting?.status === "accepted"
                ? $t("meetings.cancel.bodyMeeting", { brand: brandName, when: myMeeting ? meetingWhen(myMeeting, locale) : "" })
                : $t("meetings.cancel.bodyRequest", { brand: brandName })
            }}
          </p>
        </div>
        <div class="flex flex-wrap justify-end gap-2">
          <Button variant="outline" @click="cancelOpen = false">{{ $t("meetings.cancel.keep") }}</Button>
          <Button variant="destructive" :loading="busy === 'cancel'" @click="cancelMine">
            {{ myMeeting?.status === "accepted" ? $t("meetings.actions.cancelMeeting") : $t("meetings.actions.cancelRequest") }}
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  </section>
</template>

<script setup>
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import ResponsiveDialog from "../ui/responsive-dialog/ResponsiveDialog.vue";
import { Skeleton } from "../ui/skeleton";
import MeetingOutcome from "./MeetingOutcome.vue";
import MeetingRequestDialog from "./MeetingRequestDialog.vue";
import MeetingSlotGrid from "./MeetingSlotGrid.vue";
import MeetingStatusBadge from "./MeetingStatusBadge.vue";
import MeetingSuggestions from "./MeetingSuggestions.vue";
import { computed, onMounted, ref } from "vue";
import { toast } from "vue-sonner";

const props = defineProps({
  eventSlug: { type: String, required: true },
  eventTitle: { type: String, default: "" },
  brandSlug: { type: String, required: true },
  brandName: { type: String, default: "" },
  brandEventId: { type: [String, Number], default: null },
  /** A slot key to preselect, e.g. when finishing a request after checkout. */
  initialSlot: { type: String, default: null },
});

const { t, locale } = useI18n();
const localePath = useLocalePath();
const { visitor, load: loadVisitor, signOut: endSession } = useVisitorSession();

const data = ref(null);
const state = ref("loading");
const selectedKey = ref(props.initialSlot);
const requestOpen = ref(false);
const cancelOpen = ref(false);
const changing = ref(false);
const busy = ref(null);
const message = ref("");
const noteOpen = ref(false);
const sendError = ref(null);
const suggestions = ref([]);

const zone = computed(() => data.value?.timezone || "Asia/Jakarta");
const approval = computed(() => data.value?.approval || "manual");
const myMeeting = computed(() => data.value?.my_meeting ?? null);
const myOpen = computed(() => ["pending", "accepted"].includes(myMeeting.value?.status));
const showPicker = computed(() => !myOpen.value || changing.value);

const messageRequired = computed(() => data.value?.message === "required");
const eligible = computed(() => visitor.value?.eligibility?.status === "eligible");

/** "10:00-10:30" for a suggested time, from the slot it names. */
function suggestedRange(key) {
  for (const day of data.value?.days ?? []) {
    const slot = day.slots.find((s) => s.key === key);
    if (slot) return meetingClockRange(slot.starts_at, slot.ends_at, zone.value);
  }
  return meetingClock(key, zone.value);
}

const selectedSlot = computed(() => {
  for (const day of data.value?.days ?? []) {
    const slot = day.slots.find((s) => s.key === selectedKey.value);
    if (slot) return slot;
  }
  return null;
});

const blockReason = computed(() => {
  const d = data.value;
  if (!d) return null;
  if (!d.taking_meetings) return t("meetings.panel.notTaking", { brand: props.brandName });
  if (d.window === "not_open") {
    return t("meetings.panel.notOpen", { date: `${meetingDay(d.opens_at, zone.value, locale.value)} ${meetingClock(d.opens_at, zone.value)} ${meetingZone(zone.value)}` });
  }
  if (d.window === "closed") return t("meetings.panel.closed");
  if (myOpen.value && !changing.value) return null;
  const v = d.visitor;
  if (!changing.value && v && v.max_open_requests > 0 && v.open_requests >= v.max_open_requests) {
    return t("meetings.errors.REQUEST_LIMIT_REACHED", { count: v.max_open_requests });
  }
  return null;
});

const quotaNote = computed(() => {
  const v = data.value?.visitor;
  if (!v || !v.max_open_requests || changing.value) return "";
  return t("meetings.panel.quota", { used: v.open_requests, max: v.max_open_requests });
});

function upstream(err) {
  return err?.data?.data ?? err?.data ?? {};
}

async function load() {
  try {
    const res = await $fetch(`/api/meetings/${props.eventSlug}/brands/${props.brandSlug}`);
    data.value = res.data;
    state.value = "ready";
    loadSuggestions();
    if (selectedKey.value && !selectedSlot.value) selectedKey.value = null;
  } catch (err) {
    state.value = err?.statusCode === 404 ? "hidden" : "error";
  }
}

/** Only once the visitor has a meeting here: the moment they look for the next one. */
async function loadSuggestions() {
  if (!visitor.value || !myOpen.value) {
    suggestions.value = [];
    return;
  }
  try {
    const res = await $fetch(`/api/meetings/${props.eventSlug}/suggestions`);
    suggestions.value = res.data ?? [];
  } catch {
    suggestions.value = [];
  }
}

function startChange() {
  changing.value = true;
  selectedKey.value = null;
  sendError.value = null;
}

function stopChange() {
  changing.value = false;
  selectedKey.value = null;
  sendError.value = null;
}

async function submit() {
  const note = message.value.trim() || null;
  if (changing.value && myMeeting.value) {
    return $fetch(`/api/meetings/${props.eventSlug}/mine/${myMeeting.value.ulid}`, {
      method: "PATCH",
      body: { starts_at: selectedSlot.value.starts_at, message: note },
    });
  }
  return $fetch(`/api/meetings/${props.eventSlug}/mine`, {
    method: "POST",
    body: { brand_event_id: props.brandEventId, starts_at: selectedSlot.value.starts_at, message: note },
  });
}

/**
 * A visitor the site knows sends straight from here. Anyone else goes through
 * the dialog once (email, code), and the request leaves as soon as the code
 * checks out: no second confirmation.
 */
async function request() {
  sendError.value = null;
  if (!visitor.value || !eligible.value) {
    requestOpen.value = true;
    return;
  }
  busy.value = "send";
  try {
    const res = await submit();
    await onSent(res?.data ?? null);
  } catch (err) {
    await onFailed(err);
  } finally {
    busy.value = null;
  }
}

function replyBy(meeting) {
  if (!meeting?.reply_by) return "";
  const tz = meeting.timezone || zone.value;
  return `${meetingDay(meeting.reply_by, tz, locale.value)} ${meetingClock(meeting.reply_by, tz)} ${meetingZone(tz)}`;
}

async function onSent(meeting) {
  const email = visitor.value?.email || "";
  if (meeting?.status === "accepted") {
    toast.success(t("meetings.request.bookedTitle"), { description: t("meetings.request.bookedBody", { email }) });
  } else {
    const deadline = replyBy(meeting);
    toast.success(t("meetings.request.sentTitle"), {
      description: deadline
        ? t("meetings.request.sentBody", { brand: props.brandName, deadline, email })
        : t("meetings.outcome.pendingNoDeadline", { brand: props.brandName }),
    });
  }
  changing.value = false;
  selectedKey.value = null;
  message.value = "";
  noteOpen.value = false;
  useMeetingIntent().clear();
  await load();
}

async function onFailed(err) {
  if (err?.statusCode === 401) {
    await loadVisitor(props.eventSlug);
    requestOpen.value = true;
    return;
  }
  const data = upstream(err);
  sendError.value = meetingErrorText({ data }, t);
  // Someone else may have taken the time: show the grid as it is now.
  if (MEETING_SLOT_ERRORS.includes(data.error_code)) {
    selectedKey.value = null;
    await load();
  }
}

async function signOut() {
  await endSession();
  await load();
}

async function cancelMine() {
  busy.value = "cancel";
  try {
    await $fetch(`/api/meetings/${props.eventSlug}/mine/${myMeeting.value.ulid}/cancel`, { method: "POST" });
    cancelOpen.value = false;
    toast.success(t("meetings.cancel.done"));
    await load();
  } catch (err) {
    toast.error(meetingErrorText({ data: upstream(err) }, t));
  } finally {
    busy.value = null;
  }
}

async function answer(choice) {
  busy.value = choice;
  try {
    await $fetch(`/api/meetings/${props.eventSlug}/mine/${myMeeting.value.ulid}/${choice}`, { method: "POST" });
    toast.success(choice === "accept" ? t("meetings.request.bookedTitle") : t("meetings.invite.declinedByYou"));
  } catch (err) {
    toast.error(meetingErrorText({ data: upstream(err) }, t));
  } finally {
    busy.value = null;
    await load();
  }
}

async function takeSuggestion(key) {
  busy.value = key;
  try {
    await $fetch(`/api/meetings/${props.eventSlug}/mine/${myMeeting.value.ulid}/accept-suggestion`, { method: "POST", body: { key } });
    toast.success(t("meetings.request.bookedTitle"));
  } catch (err) {
    toast.error(meetingErrorText({ data: upstream(err) }, t));
  } finally {
    busy.value = null;
    await load();
  }
}

onMounted(async () => {
  await loadVisitor(props.eventSlug);
  await load();
});
</script>
