/**
 * Reads the `show_brand_preview_on_home_page` flag from the public website
 * settings payload so consumers can conditionally render the BrandPreview
 * section on home pages.
 *
 * Mirrors useRundownVisibility: `server: false` + `lazy: true` so SSR and
 * initial client hydration both see `data === undefined` (visible = false).
 * The fetch only fires after mount, then reactively flips visibility — no
 * hydration mismatch, no <ClientOnly> wrapper needed at the call site.
 *
 * Visiting `?show-brands=true` force-shows the section regardless of the
 * project setting — see useForceShow.
 */
export function useBrandPreviewVisibility() {
  const { locale } = useI18n();
  const forced = useForceShow("show-brands");

  const { data } = useFetch<{
    data?: {
      settings?: {
        brands?: { show_brand_preview_on_home_page?: boolean };
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
      data.value?.data?.settings?.brands?.show_brand_preview_on_home_page ===
        true,
  );

  return { visible };
}
