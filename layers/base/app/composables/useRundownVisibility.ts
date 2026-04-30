/**
 * Reads the `show_rundown_on_home_page` flag from the public rundown payload
 * so consumers can conditionally render the Rundown section on home pages
 * without triggering hydration mismatches. The fetch is client-only and lazy;
 * pair the consumer with a <ClientOnly> wrapper for SSR safety.
 *
 * The same `/api/event/rundown` endpoint is used by Rundown.vue itself, so
 * the underlying response is deduped across calls with matching query keys.
 */
export function useRundownVisibility() {
  const { locale } = useI18n();

  const { data } = useFetch<{
    data?: { settings?: { show_rundown_on_home_page?: boolean } };
  }>("/api/event/rundown", {
    query: { locale },
    server: false,
    lazy: true,
    watch: [locale],
  });

  const visible = computed(
    () => data.value?.data?.settings?.show_rundown_on_home_page === true,
  );

  return { visible };
}
