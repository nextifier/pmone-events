/**
 * Reads the `show_partners_on_home_page` flag from the public website settings
 * payload so consumers can conditionally render the Credits (Partners) section
 * on home pages.
 *
 * Mirrors useBrandPreviewVisibility/useRundownVisibility: `server: false` +
 * `lazy: true` so SSR and initial client hydration both see `data === undefined`
 * (visible = false). The fetch only fires after mount, then reactively flips
 * visibility — no hydration mismatch, no <ClientOnly> wrapper needed at the call
 * site. The same `/api/event/website-settings` endpoint is shared with the other
 * visibility composables, so the underlying response is deduped.
 *
 * Unlike brands/rundown, the empty-state guard lives in Credits.vue itself
 * (`v-if="partners.length"`), and the server-side previous-event fallback means
 * partners are borrowed from the most recent prior event when the active one has
 * none. So this composable only needs the toggle — no partners re-fetch here.
 *
 * Visiting `?show-partners=true` force-shows the section regardless of the
 * project setting — see useForceShow.
 */
export function useCreditsVisibility() {
  const { locale } = useI18n();
  const forced = useForceShow("show-partners");

  const { data } = useFetch<{
    data?: {
      settings?: {
        partners?: { show_partners_on_home_page?: boolean };
      };
    };
  }>("/api/event/website-settings", {
    query: { locale },
    server: false,
    lazy: true,
    watch: [locale],
  });

  const enabled = computed(
    () => data.value?.data?.settings?.partners?.show_partners_on_home_page === true,
  );

  const visible = computed(() => forced.value || enabled.value);

  return { visible };
}
