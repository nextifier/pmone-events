/**
 * Reads the `show_rundown_on_home_page` flag from the public rundown payload
 * so consumers can conditionally render the Rundown section on home pages.
 *
 * The fetch is `server: false` + `lazy: true`, so SSR and initial client
 * hydration both see `data === undefined` (visible = false). The fetch only
 * fires after mount, then reactively flips visibility — no hydration mismatch,
 * no <ClientOnly> wrapper needed at the call site.
 *
 * The same `/api/event/rundown` endpoint is used by Rundown.vue itself, so
 * the underlying response is deduped across calls with matching query keys.
 *
 * Beyond the project toggle, the section is only shown when the rundown actually
 * has at least one item, so an enabled-but-empty rundown is never rendered.
 *
 * Visiting `?show-rundown=true` force-shows the section regardless of the
 * project setting — see useForceShow.
 */
export function useRundownVisibility() {
  const { locale } = useI18n();
  const forced = useForceShow("show-rundown");

  const { data } = useFetch<{
    data?: {
      days?: Array<{ items?: unknown[] }>;
      settings?: { show_rundown_on_home_page?: boolean };
    };
  }>("/api/event/rundown", {
    query: { locale },
    server: false,
    lazy: true,
    watch: [locale],
  });

  const enabled = computed(
    () => data.value?.data?.settings?.show_rundown_on_home_page === true,
  );

  const hasItems = computed(() =>
    (data.value?.data?.days ?? []).some((day) => (day.items?.length ?? 0) > 0),
  );

  // `?show-rundown=true` fully overrides both the project toggle and the
  // has-items check so the section can be previewed regardless of its data.
  const visible = computed(() => forced.value || (enabled.value && hasItems.value));

  return { visible };
}
