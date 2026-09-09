<template>
  <div class="flex flex-col gap-y-4 text-left">
    <!-- Opt-in phone layout: date and venue side by side in a GridFill, each
         cell stacking its badge over its text so the two read as one row of
         facts instead of two tall list items. The list below stays the `md+`
         rendering; without `mobileGrid` nothing here changes. -->
    <GridFill
      v-if="mobileGrid"
      :count="cellCount"
      :cols="2"
      :min-col-width="false"
      rounded="xl"
      class="md:hidden"
    >
      <div v-if="formattedDate" class="flex flex-col gap-y-2.5 p-3">
        <!-- Flat twin of the venue icon box: month over day, centered, no
             accent band, so the two cells read as a matched pair. -->
        <div
          class="bg-muted flex size-10 shrink-0 flex-col items-center justify-center gap-y-0.5 rounded-xl text-center"
        >
          <span
            v-if="shortMonth"
            class="text-muted-foreground text-[0.625rem] leading-none font-semibold tracking-tight uppercase"
          >
            {{ shortMonth }}
          </span>
          <span
            v-if="startDay"
            class="text-foreground text-sm leading-none font-semibold tracking-tight"
          >
            {{ startDay }}
          </span>
        </div>

        <div class="flex flex-col gap-y-1">
          <!-- Two nowrap halves so the narrow cell breaks after the weekday
               range ("Thu-Sun," / "Oct 8-11, 2026") instead of inside the
               day span at its hyphen. -->
          <span
            class="text-foreground text-base leading-snug font-semibold tracking-tighter"
          >
            <template v-if="dayRange">
              <span class="whitespace-nowrap">{{ dayRange }},</span>
              {{ " " }}
              <span class="whitespace-nowrap">{{ props.date }}</span>
            </template>
            <template v-else>{{ formattedDate }}</template>
          </span>
          <span
            v-if="props.time"
            class="text-muted-foreground text-sm tracking-tight"
          >
            {{ props.time }}
          </span>
        </div>
      </div>

      <div v-if="props.location || props.hall" class="flex flex-col gap-y-2.5 p-3">
        <div
          class="bg-muted flex size-10 shrink-0 flex-col items-center justify-center rounded-xl text-center"
        >
          <IconLocation class="size-5" />
        </div>

        <div class="flex flex-col gap-y-1">
          <NuxtLink
            v-if="props.location"
            :to="props.locationLink ?? ''"
            target="_blank"
            class="text-primary decoration-primary/80 text-base leading-snug font-semibold tracking-tighter text-pretty decoration-dotted decoration-1 underline-offset-4 hover:underline"
          >
            <span>{{ props.location }}</span>
            <IconArrowUpRight class="ml-1 inline size-3.5" />
          </NuxtLink>
          <span
            v-if="props.hall"
            class="text-muted-foreground text-sm tracking-tight"
          >
            {{ props.hall }}
          </span>
        </div>
      </div>
    </GridFill>

    <div
      v-if="formattedDate"
      class="flex items-center gap-x-3"
      :class="{ 'max-md:hidden': mobileGrid }"
    >
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
      :class="{ 'max-md:hidden': mobileGrid }"
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
  /** Below `md`, render date and venue as two GridFill cells side by side. */
  mobileGrid: {
    type: Boolean,
    default: false,
  },
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

  const dayRange = `${startDayName}-${endDayName}`;
  return {
    shortMonth: new Intl.DateTimeFormat("en-US", { month: "short" }).format(startDate),
    startDay,
    dayRange,
    formattedDate: `${dayRange}, ${dateStr}`,
  };
});

const shortMonth = computed(() => parsed.value?.shortMonth || "");
const startDay = computed(() => parsed.value?.startDay || "");
const formattedDate = computed(() => parsed.value?.formattedDate || props.date || "");

const dayRange = computed(() => parsed.value?.dayRange || "");

const cellCount = computed(
  () =>
    (formattedDate.value ? 1 : 0) + (props.location || props.hall ? 1 : 0),
);
</script>
