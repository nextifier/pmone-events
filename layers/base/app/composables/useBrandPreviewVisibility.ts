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
 * Beyond the project toggle, the section is only shown when there are more than
 * 10 brands to display (brands share `useBrandPreview` with BrandPreview.vue, so
 * the underlying fetch — including the previous-edition fallback — runs once).
 *
 * Visiting `?show-brands=true` force-shows the section regardless of the
 * project setting — see useForceShow.
 */
const BRAND_PREVIEW_MIN = 10;

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

  const { brandsWithLogo } = useBrandPreview();

  const hasEnoughBrands = computed(
    () => brandsWithLogo.value.length > BRAND_PREVIEW_MIN,
  );

  const enabled = computed(
    () =>
      data.value?.data?.settings?.brands?.show_brand_preview_on_home_page ===
      true,
  );

  // `?show-brands=true` fully overrides both the project toggle and the count
  // threshold so the section can be previewed regardless of its data.
  const visible = computed(
    () => forced.value || (enabled.value && hasEnoughBrands.value),
  );

  return { visible };
}
