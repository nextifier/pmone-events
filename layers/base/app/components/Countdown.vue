<template>
  <div v-if="distance > 0">
    <span
      v-if="variant.toLocaleLowerCase() === 'inline-with-boxes'"
      class="inline-flex items-center gap-x-1 text-sm font-semibold sm:text-base"
    >
      <span v-if="textBeforeCountdown">{{ textBeforeCountdown }}</span>
      <span v-if="timeParts.days">
        <NumberFlow :value="timeParts.days" /> {{ $t('countdown.day', timeParts.days) }}
      </span>
      <div class="inline-flex items-center gap-0.5">
        <span
          class="bg-muted text-primary flex size-8 shrink-0 grow-0 items-center justify-center rounded-lg text-center sm:size-9"
        >
          <span v-show="timeParts.hours < 10">0</span
          ><NumberFlow :value="timeParts.hours" />
        </span>
        <span class="text-muted-foreground">:</span>
        <span
          class="bg-muted text-primary flex size-8 shrink-0 grow-0 items-center justify-center rounded-lg text-center sm:size-9"
        >
          <span v-show="timeParts.minutes < 10">0</span
          ><NumberFlow :value="timeParts.minutes" />
        </span>
        <span class="text-muted-foreground">:</span>
        <span
          class="bg-muted text-primary flex size-8 shrink-0 grow-0 items-center justify-center rounded-lg text-center sm:size-9"
        >
          <span v-show="timeParts.seconds < 10">0</span
          ><NumberFlow :value="timeParts.seconds" />
        </span>
      </div>
    </span>
    <span v-else-if="variant.toLocaleLowerCase() === 'no-style'" class="inline">
      <span v-if="textBeforeCountdown">{{ textBeforeCountdown }}</span>
      <span v-if="timeParts.days">
        <NumberFlow :value="timeParts.days" /> {{ $t('countdown.day', timeParts.days) }} </span
      >&nbsp;<span>
        <span v-show="timeParts.hours < 10">0</span
        ><NumberFlow :value="timeParts.hours" />
      </span>
      <span class="text-muted-foreground">:</span>
      <span>
        <span v-show="timeParts.minutes < 10">0</span
        ><NumberFlow :value="timeParts.minutes" />
      </span>
      <span class="text-muted-foreground">:</span>
      <span>
        <span v-show="timeParts.seconds < 10">0</span
        ><NumberFlow :value="timeParts.seconds" />
      </span>
    </span>

    <div v-else-if="variant.toLocaleLowerCase() === 'text-with-shadow'">
      <div class="grid grid-cols-4 gap-2 sm:gap-4">
        <div class="flex w-full flex-col items-center gap-y-1 text-center">
          <NumberFlow
            :value="timeParts.days"
            class="text-primary text-2xl !leading-none font-semibold tracking-tighter  tabular-nums "
          />
          <span
            class="text-primary/70 text-sm !leading-none tracking-tight "
            >{{ $t('countdown.day', timeParts.days) }}</span
          >
        </div>

        <div class="flex w-full flex-col items-center gap-y-1 text-center">
          <NumberFlow
            :value="timeParts.hours"
            class="text-primary text-2xl !leading-none font-semibold tracking-tighter  tabular-nums "
          />
          <span
            class="text-primary/70 text-sm !leading-none tracking-tight "
            >{{ $t('countdown.hour', timeParts.hours) }}</span
          >
        </div>

        <div class="flex w-full flex-col items-center gap-y-1 text-center">
          <NumberFlow
            :value="timeParts.minutes"
            class="text-primary text-2xl !leading-none font-semibold tracking-tighter  tabular-nums "
          />
          <span
            class="text-primary/70 text-sm !leading-none tracking-tight "
            >{{ $t('countdown.min', timeParts.minutes) }}</span
          >
        </div>

        <div class="flex w-full flex-col items-center gap-y-1 text-center">
          <NumberFlow
            :value="timeParts.seconds"
            class="text-primary text-2xl !leading-none font-semibold tracking-tighter  tabular-nums "
          />
          <span
            class="text-primary/70 text-sm !leading-none tracking-tight "
            >{{ $t('countdown.sec') }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCurrentTime } from "@/composables/useCurrentTime";

const props = defineProps({
  countdownDate: {
    type: Date,
    required: true,
  },
  variant: {
    type: String,
    default: "no-style",
  },
  textBeforeCountdown: String,
});

const { now } = useCurrentTime();

const distance = computed(
  () => props.countdownDate.getTime() - now.value.getTime(),
);

const timeParts = computed(() => {
  const d = Math.max(0, distance.value);
  return {
    days: Math.floor(d / (1000 * 60 * 60 * 24)),
    hours: Math.floor((d % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((d % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((d % (1000 * 60)) / 1000),
  };
});
</script>
