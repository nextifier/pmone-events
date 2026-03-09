<template>
  <div class="flex flex-col gap-y-4 text-left">
    <div class="flex items-center gap-x-3">
      <div
        class="outline-inside flex size-10 shrink-0 flex-col overflow-hidden rounded-xl text-center sm:size-12"
      >
        <div
          v-if="shortMonth"
          class="gradient-accent flex h-[45%] w-full flex-col items-center justify-center bg-linear-to-r text-[0.7rem] leading-none! font-bold text-white uppercase"
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
          class="text-primary line-clamp-1 text-base font-medium tracking-tight"
        >
          <span
            v-if="
              props.dateFormat &&
              props.dateFormat === 'id' &&
              useAppConfig().event.dateFormatID
            "
            >{{ useAppConfig().event.dateFormatID }}</span
          >
          <span v-else>{{ formattedDate }}</span>
        </span>
        <span
          v-if="props.time"
          class="line-clamp-1 text-xs tracking-tight sm:text-sm"
          >{{ props.time }}</span
        >
      </div>
    </div>

    <div class="flex items-center gap-x-3">
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

const dateStr = props.date;

// Parse the string to extract the start and end dates
const [monthAndStart, endYear] = dateStr.split("-");
const [startMonthDay, year] = endYear.split(",").map((str) => str.trim());

const [startMonth, startDay] = monthAndStart.split(" ");
const endDay = parseInt(endYear.trim().split(" ")[0]);

// Construct the start and end date objects
const startDate = new Date(`${startMonth} ${startDay}, ${year}`);
const endDate = new Date(`${startMonth} ${endDay}, ${year}`);

// Format month to 3 characters
const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
const shortMonth = monthFormatter.format(startDate);

// Format days to 3 characters
const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const startDayName = dayFormatter.format(startDate);
const endDayName = dayFormatter.format(endDate);

// Final output
const formattedDate = `${startDayName}-${endDayName}, ${dateStr}`;
</script>
