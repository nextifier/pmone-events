<!--
  One sentence that says why a closed meeting closed, picked from the closed
  reason the API sends. Shared by the visitor's cards and the brand panel.
-->
<template>
  <div v-if="text || note" class="space-y-1.5">
    <p v-if="text" class="text-muted-foreground text-sm tracking-tight">{{ text }}</p>
    <!-- What the exhibitor or organizer wrote when they answered or cancelled. -->
    <blockquote v-if="note" class="border-border border-l pl-3 text-sm tracking-tight">
      <span class="text-muted-foreground">{{ $t("meetings.outcome.noteFrom", { who: noteFrom }) }}</span>
      {{ note }}
    </blockquote>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  meeting: { type: Object, required: true },
  brandName: { type: String, default: "" },
});

const { t, locale } = useI18n();

const note = computed(() => {
  const m = props.meeting;
  const fromOtherSide =
    m.status === "accepted" ||
    (m.status === "declined" && m.closed_reason === "declined") ||
    ["cancelled_by_exhibitor", "cancelled_by_organizer"].includes(m.closed_reason);
  return fromOtherSide ? m.response_note || "" : "";
});

const noteFrom = computed(() =>
  props.meeting.closed_reason === "cancelled_by_organizer" ? t("meetings.outcome.organizer") : props.brandName || props.meeting.brand?.name || ""
);

const text = computed(() => {
  const m = props.meeting;
  const brand = props.brandName || m.brand?.name || "";

  if (m.awaits_visitor) {
    return t("meetings.outcome.invited", { brand, deadline: m.reply_by ? meetingWhenShort(m.reply_by, m.timezone) : "" });
  }
  if (m.status === "pending") {
    return m.reply_by
      ? t("meetings.outcome.pending", { brand, deadline: meetingWhenShort(m.reply_by, m.timezone) })
      : t("meetings.outcome.pendingNoDeadline", { brand });
  }
  if (m.status === "accepted") {
    return m.met_at ? t("meetings.outcome.met") : t("meetings.outcome.accepted", { brand });
  }

  const key = {
    slot_taken: "slotTaken",
    declined: "declined",
    cancelled_by_visitor: "cancelledByVisitor",
    cancelled_by_exhibitor: "cancelledByExhibitor",
    cancelled_by_organizer: "cancelledByOrganizer",
    rescheduled: "rescheduled",
    expired: "expired",
  }[m.closed_reason];

  return key ? t(`meetings.outcome.${key}`, { brand }) : "";
});

function meetingWhenShort(iso, tz) {
  return `${meetingDay(iso, tz, locale.value)} ${meetingClock(iso, tz)} ${meetingZone(tz)}`;
}
</script>
