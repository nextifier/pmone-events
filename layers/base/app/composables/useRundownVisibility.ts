/**
 * Home-page visibility for the Rundown section. Delegates the toggle to
 * useHomeSection('rundown') (fed by the PM One Website Settings -> Home Page
 * group) and keeps the has-items content guard: an enabled-but-empty rundown is
 * never rendered.
 *
 * The `/api/event/rundown` fetch here is the same one Rundown.vue uses. It is
 * deduped ONLY because both sides pass the same explicit key: Nuxt's auto-key
 * is per call site, and these are two different files, so before the key was
 * added a home page fetched the rundown twice — once to decide whether to show
 * the section, once to render it. Keep the two key expressions identical.
 * `?show-rundown=true` force-shows the section regardless of both the toggle
 * and the has-items check — see useForceShow / useHomeSection.
 */
export function useRundownVisibility() {
  const { locale } = useI18n();

  const { data } = useFetch<{
    data?: {
      days?: Array<{ items?: unknown[] }>;
    };
  }>("/api/event/rundown", {
    key: () => `rundown-active-${locale.value}`,
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
