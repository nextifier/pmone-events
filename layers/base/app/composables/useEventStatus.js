import { useCurrentTime } from "@/composables/useCurrentTime";

export function useEventStatus(startTime, endTime) {
  const { now } = useCurrentTime();
  const isMounted = ref(false);

  onMounted(() => {
    isMounted.value = true;
  });

  const status = computed(() => {
    if (!isMounted.value) return null;

    const start = unref(startTime);
    const end = unref(endTime);

    const startMs = start?.getTime?.();
    const endMs = end?.getTime?.();
    if (startMs == null || endMs == null || isNaN(startMs) || isNaN(endMs)) {
      return null;
    }

    const currentTime = now.value.getTime();

    if (currentTime < startMs) return "upcoming";
    if (currentTime >= startMs && currentTime < endMs) return "live";
    return "completed";
  });

  return { status };
}
