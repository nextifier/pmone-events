/**
 * Home-page visibility for the BrandPreview section. Delegates the toggle to
 * useHomeSection('brand_preview') (fed by the PM One Website Settings -> Home
 * Page group) and keeps the content guard: the section only shows when there
 * are more than 10 brands with a logo.
 *
 * Brands come from useBrandPreview (shared with BrandPreview.vue, so the fetch —
 * including the previous-edition fallback — runs once). `?show-brands=true`
 * force-shows the section regardless of the toggle and the count threshold.
 */
const BRAND_PREVIEW_MIN = 10;

export function useBrandPreviewVisibility() {
  const { brandsWithLogo } = useBrandPreview();

  const hasEnoughBrands = computed(
    () => brandsWithLogo.value.length > BRAND_PREVIEW_MIN,
  );

  return useHomeSection("brand_preview", {
    forceParam: "show-brands",
    guard: hasEnoughBrands,
  });
}
