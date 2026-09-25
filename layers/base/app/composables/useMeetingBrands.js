/**
 * Which exhibitors on the brand list take meeting requests, from the event's
 * meeting config. Fetched once per page view in the browser (the list itself
 * is prerendered), shared across every card through useState.
 */
export function useMeetingBrands() {
  const ids = useState("meeting-brand-ids", () => null);
  const requested = useState("meeting-brand-ids-requested", () => false);
  const event = useEvent();

  if (import.meta.client && !requested.value) {
    requested.value = true;
    onNuxtReady(async () => {
      await useEventData();
      if (!event.slug) return;
      try {
        const res = await $fetch(`/api/meetings/${event.slug}/config`);
        ids.value = res?.data?.window === "closed" ? [] : (res?.data?.brand_event_ids ?? []);
      } catch {
        ids.value = [];
      }
    });
  }

  const takesMeetings = (brandEventId) => !!brandEventId && (ids.value ?? []).includes(brandEventId);

  return { ids, takesMeetings };
}
