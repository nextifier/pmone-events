// Impressions are deduped per banner id per page load (module-scope Set,
// client-only so it never leaks across SSR requests).
const trackedImpressions = new Set<number>();

/**
 * Tracks impressions (Visit) + clicks against ProjectBanner for paid-ad reporting.
 * Reuses the shared `/api/track/visit` & `/api/track/click` nitro adapters.
 */
export function useBannerTracking() {
  const trackImpression = (id?: number | null) => {
    if (!import.meta.client || !id || trackedImpressions.has(id)) return;
    trackedImpressions.add(id);

    $fetch("/api/track/visit", {
      method: "POST",
      body: {
        visitable_type: "App\\Models\\ProjectBanner",
        visitable_id: id,
      },
    }).catch(() => {
      trackedImpressions.delete(id);
    });
  };

  const trackClick = (id?: number | null, label = "banner") => {
    if (!import.meta.client || !id) return;

    $fetch("/api/track/click", {
      method: "POST",
      body: {
        clickable_type: "App\\Models\\ProjectBanner",
        clickable_id: id,
        link_label: label,
      },
    }).catch(() => {});
  };

  return { trackImpression, trackClick };
}
