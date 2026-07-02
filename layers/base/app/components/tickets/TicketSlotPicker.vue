<script setup>
import { computed } from "vue";
import { Toggle } from "../ui/toggle";

const props = defineProps({
  // Sessions as exposed by PublicTicketResource: { id, label, starts_at, ends_at, location, host, available }
  sessions: { type: Array, default: () => [] },
  modelValue: { type: [Number, null], default: null },
});

const emit = defineEmits(["update:modelValue"]);

const { t, locale } = useI18n();

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

const fmtTime = (d) =>
  new Intl.DateTimeFormat(locale.value, { hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
const fmtDate = (d) =>
  new Intl.DateTimeFormat(locale.value, { weekday: "short", day: "numeric", month: "short" }).format(d);

// Only show the date line when slots span more than one day; otherwise the time
// range alone is enough and keeps each chip compact.
const showDate = computed(() => {
  const days = new Set();
  for (const s of props.sessions) {
    const d = toDate(s.starts_at);
    if (d) days.add(d.toDateString());
  }
  return days.size > 1;
});

function timeRange(session) {
  const start = toDate(session.starts_at);
  const end = toDate(session.ends_at);
  if (!start) return session.label || "";
  const range = end ? `${fmtTime(start)} - ${fmtTime(end)}` : fmtTime(start);
  return showDate.value ? `${fmtDate(start)} · ${range}` : range;
}

function metaLine(session) {
  return [session.host, session.location].filter(Boolean).join(" · ");
}

function isSoldOut(session) {
  return session.available != null && Number(session.available) <= 0;
}

function availabilityText(session) {
  if (isSoldOut(session)) return t("tickets.soldOut");
  if (session.available != null) return t("tickets.spotsLeft", { count: Number(session.available) });
  return "";
}

// A Toggle (not a radio) so re-clicking the chosen session clears it - the same
// behaviour as the day-pass pills, and it lets a buyer undo a mis-tap.
function pick(session) {
  if (isSoldOut(session)) return;
  emit("update:modelValue", props.modelValue === session.id ? null : session.id);
}
</script>

<template>
  <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
    <Toggle
      v-for="s in sessions"
      :key="s.id"
      variant="card"
      indicator
      :model-value="modelValue === s.id"
      :disabled="isSoldOut(s)"
      class="flex flex-row items-center gap-3 p-3 text-left"
      @update:model-value="() => pick(s)"
    >
      <span class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span class="text-foreground text-sm font-medium tracking-tight">{{ timeRange(s) }}</span>
        <span v-if="metaLine(s)" class="text-muted-foreground text-xs tracking-tight">
          {{ metaLine(s) }}
        </span>
        <span
          v-if="availabilityText(s)"
          class="text-xs tracking-tight"
          :class="isSoldOut(s) ? 'text-destructive' : 'text-success-foreground'"
        >
          {{ availabilityText(s) }}
        </span>
      </span>
    </Toggle>
  </div>
</template>
