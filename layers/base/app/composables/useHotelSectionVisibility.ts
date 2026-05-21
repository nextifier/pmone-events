/**
 * Reads the `show_hotel_section_on_home_page` flag from the public website
 * settings payload so consumers can conditionally render the Hotels section
 * on home pages.
 *
 * Mirrors useBrandPreviewVisibility: `server: false` + `lazy: true` so SSR and
 * initial client hydration both see `data === undefined` (visible = false).
 * The fetch only fires after mount, then reactively flips visibility — no
 * hydration mismatch, no <ClientOnly> wrapper needed at the call site.
 *
 * Visiting `?show-hotel=true` force-shows the section regardless of the
 * project setting — see useForceShow.
 */
export function useHotelSectionVisibility() {
  const { locale } = useI18n();
  const forced = useForceShow("show-hotel");

  const { data } = useFetch<{
    data?: {
      settings?: {
        hotels?: { show_hotel_section_on_home_page?: boolean };
      };
    };
  }>("/api/event/website-settings", {
    query: { locale },
    server: false,
    lazy: true,
    watch: [locale],
  });

  const visible = computed(
    () =>
      forced.value ||
      data.value?.data?.settings?.hotels?.show_hotel_section_on_home_page ===
        true,
  );

  return { visible };
}
