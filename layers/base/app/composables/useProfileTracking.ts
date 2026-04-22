type ProjectIdGetter = () => number | null | undefined;

export function useProfileTracking(getProjectId: ProjectIdGetter) {
  const visitTracked = ref(false);

  const trackVisit = () => {
    if (!import.meta.client || visitTracked.value) return;
    const id = getProjectId();
    if (!id) return;
    visitTracked.value = true;

    $fetch("/api/track/visit", {
      method: "POST",
      body: {
        visitable_type: "App\\Models\\Project",
        visitable_id: id,
      },
    }).catch(() => {
      visitTracked.value = false;
    });
  };

  const trackClick = (label: string) => {
    if (!import.meta.client || !label) return;
    const id = getProjectId();
    if (!id) return;

    $fetch("/api/track/click", {
      method: "POST",
      body: {
        clickable_type: "App\\Models\\Project",
        clickable_id: id,
        link_label: label,
      },
    }).catch(() => {});
  };

  return { trackVisit, trackClick };
}
