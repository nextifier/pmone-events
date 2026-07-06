/**
 * Home-page visibility for the Rundown section. Delegates the toggle to
 * useHomeSection('rundown') (fed by the PM One Website Settings -> Home Page
 * group) and keeps the has-items content guard: an enabled-but-empty rundown is
 * never rendered.
 *
 * The `/api/event/rundown` fetch here is the same one Rundown.vue uses, so the
 * response is deduped. `?show-rundown=true` force-shows the section regardless
 * of both the toggle and the has-items check — see useForceShow / useHomeSection.
 */
export function useRundownVisibility() {
  const { locale } = useI18n();

  const { data } = useFetch<{
    data?: {
      days?: Array<{ items?: unknown[] }>;
    };
  }>("/api/event/rundown", {
    query: { locale },
    server: false,
    lazy: true,
    watch: [locale],
  });

  const hasItems = computed(() =>
    (data.value?.data?.days ?? []).some((day) => (day.items?.length ?? 0) > 0),
  );

  return useHomeSection("rundown", {
    forceParam: "show-rundown",
    guard: hasItems,
  });
}
