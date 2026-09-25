<!--
  One of the visitor's meetings in a list: who, when, where, the status in
  words, and the next thing they can do with it.
-->
<template>
  <article class="border-border bg-card flex flex-col gap-y-3 rounded-xl border p-4">
    <div class="flex items-start gap-x-3">
      <Avatar
        :model="{ name: meeting.brand?.name, profile_image: meeting.brand?.profile_image }"
        size="sm"
        class="size-10 shrink-0"
        rounded="rounded-full"
      />
      <div class="min-w-0 flex-1 space-y-0.5">
        <p class="truncate text-base font-medium tracking-tight">{{ meeting.brand?.name }}</p>
        <p class="text-muted-foreground truncate text-sm tracking-tight">{{ meeting.event?.title }}</p>
      </div>
      <MeetingStatusBadge :status="meeting.status" :awaits-visitor="meeting.awaits_visitor" class="shrink-0" />
    </div>

    <div class="space-y-1 text-sm tracking-tight">
      <p class="font-medium tabular-nums">{{ meetingWhen(meeting) }}</p>
      <p v-if="meeting.where" class="text-muted-foreground">{{ meeting.where }}</p>
    </div>

    <MeetingOutcome :meeting="meeting" />

    <div v-if="meeting.suggested_slots?.length" class="space-y-2">
      <p class="text-sm font-medium tracking-tight">
        {{ $t("meetings.panel.suggested", { brand: meeting.brand?.name }) }}
      </p>
      <div class="flex flex-wrap gap-1.5">
        <Button
          v-for="key in meeting.suggested_slots"
          :key="key"
          variant="outline"
          size="sm"
          :loading="busy === key"
          @click="$emit('take-suggestion', meeting, key)"
        >
          {{ meetingDay(key, meeting.timezone) }} · {{ suggestedRange(key) }}
        </Button>
      </div>
    </div>

    <blockquote v-if="meeting.awaits_visitor && meeting.message" class="border-border border-l pl-3 text-sm tracking-tight">
      {{ meeting.message }}
    </blockquote>

    <div v-if="meeting.awaits_visitor" class="flex flex-wrap items-center gap-x-1.5 gap-y-2.5">
      <Button size="sm" :loading="busy === `accept:${meeting.ulid}`" @click="$emit('answer', meeting, 'accept')">
        {{ $t("meetings.actions.acceptInvitation") }}
      </Button>
      <Button size="sm" variant="outline" :loading="busy === `decline:${meeting.ulid}`" @click="$emit('answer', meeting, 'decline')">
        {{ $t("meetings.actions.declineInvitation") }}
      </Button>
    </div>

    <div v-if="actions.length" class="flex flex-wrap items-center gap-x-1.5 gap-y-2.5">
      <template v-for="action in actions" :key="action.key">
        <Button v-if="action.to" variant="outline" size="sm" :to="action.to">
          <Icon :name="action.icon" class="size-4 shrink-0" />
          <span>{{ action.label }}</span>
        </Button>
        <Button v-else variant="outline" size="sm" @click="$emit(action.emit, meeting)">
          <Icon :name="action.icon" class="size-4 shrink-0" />
          <span>{{ action.label }}</span>
        </Button>
      </template>
    </div>
  </article>
</template>

<script setup>
import MeetingOutcome from "./MeetingOutcome.vue";
import MeetingStatusBadge from "./MeetingStatusBadge.vue";
import { Button } from "../ui/button";
import { computed } from "vue";

const props = defineProps({
  meeting: { type: Object, required: true },
  /** Where "change time" and "pick another time" go: the exhibitor's page. */
  brandPath: { type: String, default: null },
  busy: { type: String, default: null },
  /** Chats are on for this account (dashboard only): offer "Message". */
  canMessage: { type: Boolean, default: false },
});
defineEmits(["cancel", "take-suggestion", "message", "answer"]);

const { t } = useI18n();

const actions = computed(() => {
  const m = props.meeting;
  const list = [];
  const open = (m.status === "pending" && !m.awaits_visitor) || m.status === "accepted";

  if (open && m.can_change && props.brandPath) {
    list.push({ key: "change", label: t("meetings.actions.changeTime"), icon: "hugeicons:calendar-03", to: props.brandPath });
  }
  if (m.status === "accepted" && props.canMessage && m.contact_user_id && m.event?.organization_id) {
    list.push({ key: "message", label: t("meetings.actions.message"), icon: "hugeicons:bubble-chat", emit: "message" });
  }
  if (open && m.can_cancel) {
    list.push({
      key: "cancel",
      label: m.status === "accepted" ? t("meetings.actions.cancelMeeting") : t("meetings.actions.cancelRequest"),
      icon: "hugeicons:cancel-circle",
      emit: "cancel",
    });
  }
  if (!open && ["slot_taken", "expired", "declined"].includes(m.closed_reason) && !m.suggested_slots?.length && props.brandPath) {
    list.push({ key: "again", label: t("meetings.actions.pickAnother"), icon: "hugeicons:calendar-add-01", to: props.brandPath });
  }
  return list;
});

/** A suggested time as "10:00-10:30": same length as the meeting it replaces. */
function suggestedRange(key) {
  const length = new Date(props.meeting.ends_at) - new Date(props.meeting.starts_at);
  const end = new Date(new Date(key).getTime() + (length > 0 ? length : 0)).toISOString();
  return length > 0 ? meetingClockRange(key, end, props.meeting.timezone) : meetingClock(key, props.meeting.timezone);
}
</script>
