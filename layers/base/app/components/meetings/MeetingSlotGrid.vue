<!--
  The day tabs and slot chips every meeting surface shares.

  Every chip is tappable, including the ones that cannot be picked: a tap on an
  unavailable chip writes the reason under the grid instead of doing nothing,
  so no chip is ever grey without a sentence saying why (a tooltip would not
  show on a phone). Times are in the event's timezone.

  mode="pick"  : choose one open slot (visitors, organizer)
  mode="block" : the exhibitor opens and closes its own slots
-->
<template>
  <!-- One time for a visitor or organizer: a day and a time, each a Select.
       Every time that cannot be picked stays in the list, greyed, with its
       reason written beside it, so nothing disappears without a word. -->
  <div v-if="compact" class="space-y-2">
    <div class="grid grid-cols-2 gap-2">
      <Select v-model="activeDate">
        <SelectTrigger class="w-full" :aria-label="$t('meetings.slot.dayLabel')">
          <SelectValue :placeholder="$t('meetings.slot.dayLabel')">
            <span v-if="activeDay" class="truncate">{{ dayLabel(activeDay.date) }}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="day in days"
            :key="day.date"
            :value="day.date"
            :disabled="!day.valid_for_ticket"
            class="data-[disabled]:opacity-100"
          >
            <span class="flex w-full items-center justify-between gap-x-3">
              <span :class="!day.valid_for_ticket && 'text-muted-foreground'">{{ dayLabel(day.date) }}</span>
              <span v-if="!day.valid_for_ticket" class="text-muted-foreground text-sm">{{ $t("meetings.slot.invalidDay") }}</span>
            </span>
          </SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="timeModel" :disabled="!activeDay || !activeDay.slots.length">
        <SelectTrigger class="w-full tabular-nums" :aria-label="$t('meetings.slot.timeLabel')">
          <SelectValue :placeholder="activeDay && !openCount(activeDay) ? $t('meetings.slot.noOpenTimes') : $t('meetings.slot.pickTime')">
            <span v-if="selectedSlot" class="truncate">{{ clockRange(selectedSlot) }}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="slot in activeDay?.slots ?? []"
            :key="slot.key"
            :value="slot.key"
            :disabled="slot.state !== 'available'"
            class="data-[disabled]:opacity-100"
          >
            <span class="flex w-full items-center justify-between gap-x-3">
              <span class="tabular-nums" :class="slot.state !== 'available' && 'text-muted-foreground line-through decoration-1'">
                {{ clockRange(slot) }}
              </span>
              <span v-if="slot.state !== 'available'" class="text-muted-foreground truncate text-sm">
                {{ reasonLabel(slot) }}
              </span>
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <p v-if="activeDay && !activeDay.slots.length" class="text-muted-foreground text-sm tracking-tight">
      {{ $t("meetings.slot.noneThisDay") }}
    </p>
    <p v-if="zoneDiffers" class="text-muted-foreground text-sm tracking-tight">
      {{ $t("meetings.slot.zoneNote", { zone: timezone, abbr: meetingZone(timezone) }) }}
    </p>
  </div>

  <!-- The exhibitor's grid: close and open many times at once, or pick up to
       three to suggest. A tap on a chip that cannot change writes why below. -->
  <div v-else class="space-y-4">
    <Tabs v-if="days.length > 1" v-model="activeDate" variant="segmented" class="w-full">
      <TabsList class="w-full">
        <TabsIndicator />
        <TabsTrigger v-for="day in days" :key="day.date" :value="day.date" class="flex-1">
          {{ dayLabel(day.date) }}
        </TabsTrigger>
      </TabsList>
    </Tabs>
    <p v-else-if="days.length === 1" class="text-sm font-medium tracking-tight">
      {{ dayLabel(days[0].date) }}
    </p>

    <p
      v-if="activeDay && !activeDay.valid_for_ticket"
      class="text-muted-foreground border-border rounded-lg border border-dashed px-3 py-2.5 text-sm tracking-tight"
    >
      {{ $t("meetings.slot.invalidDayNote") }}
    </p>

    <div v-if="activeDay" class="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
      <Button
        v-for="slot in activeDay.slots"
        :key="slot.key"
        type="button"
        size="sm"
        :variant="chipVariant(slot)"
        :aria-pressed="isSelected(slot)"
        :aria-disabled="!isActionable(slot)"
        :aria-label="`${clockRange(slot)}, ${stateLabel(slot)}`"
        :class="[
          'justify-center tabular-nums',
          !isActionable(slot) && !isMine(slot) && 'text-muted-foreground opacity-60',
          (slot.state === 'full' || slot.state === 'closed') && mode === 'pick' && 'line-through',
        ]"
        @click="onTap(slot)"
      >
        <Icon v-if="isMine(slot)" name="hugeicons:checkmark-circle-02" class="size-4 shrink-0" />
        <Icon
          v-else-if="mode === 'block' && slot.state === 'unavailable'"
          name="hugeicons:square-lock-02"
          class="size-4 shrink-0"
        />
        <span>{{ clockRange(slot) }}</span>
      </Button>
    </div>

    <p v-if="activeDay && !activeDay.slots.length" class="text-muted-foreground text-sm tracking-tight">
      {{ $t("meetings.slot.noneThisDay") }}
    </p>

    <!-- The sentence under the grid: what the tapped chip means. -->
    <p
      aria-live="polite"
      class="min-h-5 text-sm tracking-tight"
      :class="explanation?.tone === 'muted' ? 'text-muted-foreground' : 'text-foreground'"
    >
      {{ explanation?.text }}
    </p>

    <p v-if="zoneDiffers" class="text-muted-foreground text-sm tracking-tight">
      {{ $t("meetings.slot.zoneNote", { zone: timezone, abbr: meetingZone(timezone) }) }}
    </p>
  </div>
</template>

<script setup>
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsIndicator, TabsList, TabsTrigger } from "../ui/tabs";
import { computed, ref, watch } from "vue";

const props = defineProps({
  days: { type: Array, default: () => [] },
  timezone: { type: String, default: "Asia/Jakarta" },
  brandName: { type: String, default: "" },
  mode: { type: String, default: "pick" },
  /** The visitor's own meeting status at this exhibitor, for the "yours" chip. */
  myStatus: { type: String, default: null },
  /** Pick several open slots (the exhibitor suggesting times); v-model is an array. */
  multiple: { type: Boolean, default: false },
  maxSelected: { type: Number, default: 3 },
});

const selected = defineModel({ type: [String, Array], default: null });
const emit = defineEmits(["toggle"]);

const { t, locale } = useI18n();

const activeDate = ref(null);
const tapped = ref(null);

const compact = computed(() => props.mode === "pick" && !props.multiple);

watch(
  () => props.days,
  (days) => {
    if (!days.length) return;
    const holding = typeof selected.value === "string" ? days.find((d) => d.slots.some((s) => s.key === selected.value)) : null;
    if (holding && !days.some((d) => d.date === activeDate.value)) {
      activeDate.value = holding.date;
      return;
    }
    if (!days.some((d) => d.date === activeDate.value)) {
      const withOpen = days.find((d) => d.valid_for_ticket && d.slots.some((s) => s.state === "available"));
      activeDate.value = (withOpen ?? days[0]).date;
    }
  },
  { immediate: true }
);

watch(activeDate, (date) => {
  tapped.value = null;
  // A time belongs to its day: switching days drops a pick made on another.
  if (compact.value && typeof selected.value === "string") {
    const day = props.days.find((d) => d.date === date);
    if (!day?.slots.some((s) => s.key === selected.value)) selected.value = null;
  }
});

// "en" alone is month-first; meeting dates read day-first everywhere.
const dateLocale = computed(() => (locale.value === "en" ? "en-GB" : locale.value));

const activeDay = computed(() => props.days.find((d) => d.date === activeDate.value) ?? null);
const zoneDiffers = computed(() => meetingZoneDiffers(props.timezone));

const timeModel = computed({
  get: () => (typeof selected.value === "string" ? selected.value : undefined),
  set: (key) => (selected.value = key ?? null),
});

const selectedSlot = computed(() => activeDay.value?.slots.find((s) => s.key === timeModel.value) ?? null);

function clockRange(slot) {
  return meetingClockRange(slot.starts_at, slot.ends_at, props.timezone);
}

function dayLabel(date) {
  return `${weekday(date)}, ${shortDate(date)}`;
}

function openCount(day) {
  return day.slots.filter((s) => s.state === "available").length;
}

/** The reason beside a time that cannot be picked; a clash names the other exhibitor. */
function reasonLabel(slot) {
  if (slot.state === "conflict" && slot.conflict_with) {
    return t("meetings.slot.conflictWith", { brand: slot.conflict_with });
  }
  return stateLabel(slot);
}

function range(slot) {
  return `${meetingClockRange(slot.starts_at, slot.ends_at, props.timezone)} ${meetingZone(props.timezone)}`;
}

function weekday(date) {
  try {
    return new Intl.DateTimeFormat(dateLocale.value, { weekday: "short" }).format(new Date(`${date}T00:00:00`));
  } catch {
    return date;
  }
}

function shortDate(date) {
  try {
    return new Intl.DateTimeFormat(dateLocale.value, { day: "numeric", month: "short" }).format(
      new Date(`${date}T00:00:00`)
    );
  } catch {
    return date;
  }
}

function isMine(slot) {
  return props.mode === "pick" && slot.state === "yours";
}

function isSelected(slot) {
  if (props.mode !== "pick") return slot.state === "available";
  return props.multiple ? (selected.value ?? []).includes(slot.key) : selected.value === slot.key;
}

function isActionable(slot) {
  if (props.mode === "block") return slot.state === "available" || slot.state === "unavailable";
  return slot.state === "available";
}

function chipVariant(slot) {
  if (props.mode === "block") return slot.state === "unavailable" ? "secondary" : "outline";
  if (isMine(slot)) return "secondary";
  if (isSelected(slot)) return "default";
  return "outline";
}

function stateLabel(slot) {
  if (props.mode === "block") {
    return slot.state === "unavailable"
      ? t("meetings.slot.closedByYou")
      : slot.booked > 0
        ? t("meetings.slot.booked")
        : t("meetings.slot.available");
  }
  switch (slot.state) {
    case "yours":
      return props.myStatus === "accepted" ? t("meetings.slot.yoursConfirmed") : t("meetings.slot.yours");
    case "full":
      return t("meetings.slot.full");
    case "unavailable":
      return t("meetings.slot.unavailable");
    case "closed":
      return t("meetings.slot.closed");
    case "conflict":
      return t("meetings.slot.conflict");
    case "invalid_day":
      return t("meetings.slot.invalidDay");
    default:
      return t("meetings.slot.available");
  }
}

const explanation = computed(() => {
  const slot = tapped.value;

  if (!slot) {
    // The pick may sit on another day's tab; it is still named here, with its day.
    const chosenDay = props.multiple ? null : props.days.find((d) => d.slots.some((s) => s.key === selected.value));
    const chosen = chosenDay?.slots.find((s) => s.key === selected.value);
    if (props.multiple && (selected.value ?? []).length) {
      return { tone: "foreground", text: t("meetings.explain.multiSelected", { count: selected.value.length, max: props.maxSelected }) };
    }
    if (props.mode === "pick" && chosen) {
      const time = chosenDay.date === activeDate.value ? range(chosen) : `${weekday(chosenDay.date)}, ${shortDate(chosenDay.date)} · ${range(chosen)}`;
      return { tone: "foreground", text: t("meetings.explain.selected", { time }) };
    }
    return {
      tone: "muted",
      text: props.mode === "block" ? t("meetings.explain.blockHint") : t("meetings.explain.pickHint"),
    };
  }

  const time = range(slot);
  const brand = props.brandName;

  if (props.mode === "block") {
    if (slot.booked > 0) return { tone: "foreground", text: t("meetings.explain.blockBooked", { time }) };
    if (slot.state === "closed") return { tone: "foreground", text: t("meetings.explain.blockPast", { time }) };
    return null;
  }

  switch (slot.state) {
    case "yours":
      return {
        tone: "foreground",
        text:
          props.myStatus === "accepted"
            ? t("meetings.explain.yoursConfirmed", { time, brand })
            : t("meetings.explain.yours", { time, brand }),
      };
    case "full":
      return { tone: "foreground", text: t("meetings.explain.full", { time }) };
    case "unavailable":
      return { tone: "foreground", text: t("meetings.explain.unavailable", { time, brand }) };
    case "closed":
      return { tone: "foreground", text: t("meetings.explain.closed", { time }) };
    case "conflict":
      return {
        tone: "foreground",
        text: slot.conflict_with
          ? t("meetings.explain.conflict", { time, brand: slot.conflict_with })
          : t("meetings.explain.conflictNoBrand", { time }),
      };
    case "invalid_day":
      return { tone: "foreground", text: t("meetings.explain.invalidDay") };
    default:
      return null;
  }
});

function onTap(slot) {
  if (props.mode === "block") {
    if (slot.state === "available" && slot.booked > 0) {
      tapped.value = slot;
      return;
    }
    if (slot.state === "available" || slot.state === "unavailable") {
      tapped.value = null;
      emit("toggle", slot);
      return;
    }
    tapped.value = slot;
    return;
  }

  if (slot.state === "available") {
    tapped.value = null;
    if (props.multiple) {
      const current = [...(selected.value ?? [])];
      const at = current.indexOf(slot.key);
      if (at >= 0) current.splice(at, 1);
      else if (current.length < props.maxSelected) current.push(slot.key);
      selected.value = current;
      return;
    }
    selected.value = selected.value === slot.key ? null : slot.key;
    return;
  }

  tapped.value = slot;
}
</script>
