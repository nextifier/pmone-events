type FormIdGetter = () => number | null | undefined;

/**
 * Counts opens of a PM One form rendered at /f/{slug}, for the Views ->
 * Responses funnel on the form's analytics board in PM One.
 *
 * Same shape as usePostTracking: once per id per page load, through the
 * same-origin /api/track/visit proxy that forwards the visitor's IP and
 * User-Agent. A closed or full form comes back as 403 with no body, so it has
 * no id and is never counted.
 */
export function useFormTracking(getFormId: FormIdGetter) {
  const lastTrackedId = ref<number | null>(null);

  const trackVisit = () => {
    if (!import.meta.client) return;
    const id = getFormId();
    if (!id || lastTrackedId.value === id) return;
    lastTrackedId.value = id;

    $fetch("/api/track/visit", {
      method: "POST",
      body: {
        visitable_type: "App\\Models\\Form",
        visitable_id: id,
      },
    }).catch((error) => {
      // Only a 429 guarantees the row was NOT written. A timeout or a 5xx is
      // ambiguous, and clearing the key there would count the same open twice.
      const status = error?.statusCode ?? error?.response?.status;
      if (status === 429 && lastTrackedId.value === id) {
        lastTrackedId.value = null;
      }

      if (import.meta.dev) {
        console.warn(`[useFormTracking] visit beacon failed (${status ?? "network"})`, error);
      }
    });
  };

  return { trackVisit };
}
