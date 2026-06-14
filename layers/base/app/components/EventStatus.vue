<template>
  <div class="text-primary flex items-center justify-center">
    <Spinner v-if="!isMounted" class="size-4 text-primary" />

    <template v-else>
      <div v-if="status === 'upcoming'" class="flex items-center gap-x-1.5">
        <span class="inline tracking-tighter">
          <Countdown
            :variant="countdownVariant"
            :textBeforeCountdown="prefix || (withTextPrefix ? $t('eventStatus.startsIn') : '')"
            :countdownDate="startTime"
          />
        </span>
      </div>

      <div v-else-if="status === 'live'" class="flex items-center gap-x-1.5">
        <LoaderBars />
        <span class="font-semibold tracking-normal uppercase">{{ $t('eventStatus.live') }}</span>
      </div>

      <div
        v-else-if="status === 'completed'"
        class="flex items-center gap-x-1.5"
      >
        <IconCompleted class="size-5 shrink-0 text-green-500" />
        <span class="text-sm tracking-tight">{{ $t('eventStatus.completed') }} </span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { useCurrentTime } from "@/composables/useCurrentTime";

const props = defineProps({
  countdownVariant: {
    type: String,
    default: "no-style",
  },
  startTime: Date,
  endTime: Date,
  withTextPrefix: {
    type: Boolean,
    default: true,
  },
  prefix: {
    type: String,
    default: "",
  },
});

const { now } = useCurrentTime();
const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});

const status = computed(() => {
  if (!isMounted.value) return null;

  const startMs = props.startTime?.getTime?.();
  const endMs = props.endTime?.getTime?.();
  if (startMs == null || endMs == null || isNaN(startMs) || isNaN(endMs)) {
    return null;
  }

  const currentTime = now.value.getTime();

  if (currentTime < startMs) {
    return "upcoming";
  } else if (currentTime > startMs && currentTime < endMs) {
    return "live";
  } else {
    return "completed";
  }
});
</script>
