<script setup>
import { computed } from "vue";
import { Badge } from "../ui/badge";

const props = defineProps({
  // Sessions as exposed by PublicTicketResource: { id, label, starts_at, ends_at, location, host, available, status }
  sessions: { type: Array, default: () => [] },
});

const { t, locale } = useI18n();

// Event times are Jakarta times wherever the visitor sits, the same rule as
// useEvent(). Formatting in the browser's zone would move an 11:00 session to
// 12:00 for a visitor from Singapore.
const TZ = "Asia/Jakarta";

// `status` comes from the API: a staff override, or derived from the ticket's
// sale window and the session's capacity. Null (sale closed) shows nothing.
// Badge's own dot colours, no outline (`plain`).
const STATUS = {
  available: { key: "tickets.sessionAvailable", variant: "success" },
  coming_soon: { key: "tickets.comingSoon", variant: "warning" },
  sold_out: { key: "tickets.soldOut", variant: "destructive" },
};

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

const fmtTime = (d) =>
  new Intl.DateTimeFormat(locale.value, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TZ,
  }).format(d);

const fmtDate = (d) =>
  new Intl.DateTimeFormat(locale.value, {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: TZ,
  }).format(d);

// One date for the whole list when every session falls on the same day, so
// the rows carry only the times. Null when they span days (or none is dated),
// in which case each row names its own date.
const sharedDate = computed(() => {
  const dates = new Set(
    props.sessions
      .map((s) => toDate(s.starts_at))
      .filter(Boolean)
      .map(fmtDate),
  );
  return dates.size === 1 ? [...dates][0] : null;
});

// A session without a time still needs something to read, so it falls back
// to its staff-given label.
function timeRange(session) {
  const start = toDate(session.starts_at);
  if (!start) return session.label || "";
  const end = toDate(session.ends_at);
  const range = end ? `${fmtTime(start)} - ${fmtTime(end)}` : fmtTime(start);
  return sharedDate.value ? range : `${fmtDate(start)} · ${range}`;
}
</script>

<template>
  <div class="space-y-1.5">
    <div class="flex items-baseline justify-between gap-x-3">
      <p class="text-foreground text-sm font-medium tracking-tight">
        {{ t("tickets.availableSessions") }}
      </p>
      <p
        v-if="sharedDate"
        class="text-muted-foreground shrink-0 text-sm tracking-tight"
      >
        {{ sharedDate }}
      </p>
    </div>

    <ul class="border-border divide-border divide-y rounded-lg border">
      <li
        v-for="session in sessions"
        :key="session.id"
        class="flex items-center justify-between gap-x-3 px-3 py-2"
      >
        <span
          class="text-foreground min-w-0 truncate text-sm font-medium tracking-tight tabular-nums"
        >
          {{ timeRange(session) }}
        </span>
        <Badge
          v-if="STATUS[session.status]"
          :variant="STATUS[session.status].variant"
          plain
        >
          {{ t(STATUS[session.status].key) }}
        </Badge>
      </li>
    </ul>
  </div>
</template>
