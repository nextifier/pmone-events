type BrandEventIdGetter = () => number | null | undefined;

/**
 * Tracks visits/clicks against the BrandEvent (brand at this specific event edition).
 * Per-event analytics queries this directly; global brand analytics aggregate across
 * all of the brand's BrandEvents on the backend.
 */
export function useBrandTracking(getBrandEventId: BrandEventIdGetter) {
  const visitTracked = ref(false);

  const trackVisit = () => {
    if (!import.meta.client || visitTracked.value) return;
    const id = getBrandEventId();
    if (!id) return;
    visitTracked.value = true;

    $fetch("/api/track/visit", {
      method: "POST",
      body: {
        visitable_type: "App\\Models\\BrandEvent",
        visitable_id: id,
      },
    }).catch(() => {
      visitTracked.value = false;
    });
  };

  const trackClick = (label: string) => {
    if (!import.meta.client || !label) return;
    const id = getBrandEventId();
    if (!id) return;

    $fetch("/api/track/click", {
      method: "POST",
      body: {
        clickable_type: "App\\Models\\BrandEvent",
        clickable_id: id,
        link_label: label,
      },
    }).catch(() => {});
  };

  return { trackVisit, trackClick };
}
