<template>
  <div class="flex flex-col gap-y-4 text-left">
    <div v-if="formattedDate" class="flex items-center gap-x-3">
      <div
        class="outline-inside flex size-10 shrink-0 flex-col overflow-hidden rounded-xl text-center sm:size-12"
      >
        <div
          v-if="shortMonth"
          class="bg-accent text-accent-foreground flex h-[45%] w-full flex-col items-center justify-center bg-linear-to-r text-[0.7rem] leading-none! font-bold uppercase"
        >
          {{ shortMonth }}
        </div>

        <div
          v-if="startDay"
          class="flex w-full grow flex-col items-center justify-center text-sm leading-none! font-medium"
        >
          {{ startDay }}
        </div>
      </div>

      <div class="flex flex-col items-start gap-y-1">
        <span
          class="text-foreground line-clamp-1 text-base font-medium tracking-tight"
        >
          <span>{{ formattedDate }}</span>
        </span>
        <span
          v-if="props.time"
          class="line-clamp-1 text-xs tracking-tight sm:text-sm"
          >{{ props.time }}</span
        >
      </div>
    </div>

    <div
      v-if="props.location || props.hall"
      class="flex items-center gap-x-3"
    >
      <div
        class="outline-inside flex size-10 shrink-0 flex-col items-center justify-center rounded-xl text-center sm:size-12"
      >
        <IconLocation class="size-5" />
      </div>

      <div class="flex flex-col items-start gap-y-1">
        <NuxtLink
          v-if="props.location"
          :to="props.locationLink ?? ''"
          target="_blank"
          class="text-primary decoration-primary/80 gap-2 text-base font-medium tracking-tight text-pretty decoration-dotted decoration-1 underline-offset-4 hover:underline"
        >
          <span>{{ props.location }}</span>
          <IconArrowUpRight class="ml-1 inline size-3.5" />
        </NuxtLink>
        <span
          v-if="props.hall"
          class="line-clamp-1 text-xs tracking-tight sm:text-sm"
          >{{ props.hall }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  date: String,
  time: String,
  location: String,
  locationLink: String,
  hall: String,
});

// Parse "Mon D-D, YYYY" / "Mon D, YYYY" defensively. Never throws: when the
// string is empty or in an unexpected shape it falls back to the raw date and
// hides the calendar badge, instead of breaking the render.
const parsed = computed(() => {
  const dateStr = props.date;
  if (!dateStr || typeof dateStr !== "string") return null;

  const [head, tail] = dateStr.split("-");
  const headTokens = (head || "").trim().split(/\s+/);
  const startMonth = headTokens[0];
  const startDay = parseInt(headTokens[1], 10);
  if (!startMonth || Number.isNaN(startDay)) return null;

  const year = dateStr.match(/(\d{4})/)?.[1] ?? `${new Date().getFullYear()}`;
  const endDay = tail ? parseInt(tail, 10) : startDay;

  const startDate = new Date(`${startMonth} ${startDay}, ${year}`);
  if (Number.isNaN(startDate.getTime())) return null;
  const endDate = new Date(
    `${startMonth} ${Number.isNaN(endDay) ? startDay : endDay}, ${year}`,
  );

  const dayFmt = new Intl.DateTimeFormat("en-US", { weekday: "short" });
  const startDayName = dayFmt.format(startDate);
  const endDayName = Number.isNaN(endDate.getTime())
    ? startDayName
    : dayFmt.format(endDate);

  return {
    shortMonth: new Intl.DateTimeFormat("en-US", { month: "short" }).format(startDate),
    startDay,
    formattedDate: `${startDayName}-${endDayName}, ${dateStr}`,
  };
});

const shortMonth = computed(() => parsed.value?.shortMonth || "");
const startDay = computed(() => parsed.value?.startDay || "");
const formattedDate = computed(() => parsed.value?.formattedDate || props.date || "");
</script>
