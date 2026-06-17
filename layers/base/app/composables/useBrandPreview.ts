/**
 * Shared data source for the home-page BrandPreview section.
 *
 * Fetches the active event's brands with `fallback=1`, so when the active event
 * has no brands yet the API borrows the most recent previous edition that does.
 *
 * Consumed by BOTH `BrandPreview.vue` (renders the grid) and
 * `useBrandPreviewVisibility` (decides whether to render at all). Both share the
 * same `useLazyAsyncData` key, so the brands are fetched only once.
 *
 * `server: false` keeps the fetch client-only — matching the visibility
 * composables for the other home sections and avoiding hydration mismatches.
 */

// Upper bound on preview candidates (enough to fill wide screens).
const PREVIEW_MAX = 36;

interface BrandPreviewItem {
  slug?: string;
  brand_name?: string;
  brand_logo?: unknown;
  business_categories?: string[];
  score?: number;
}

export function useBrandPreview() {
  const { data, pending } = useLazyAsyncData<{
    data?: BrandPreviewItem[];
  } | null>(
    "brand-preview",
    () =>
      $fetch<{ data?: BrandPreviewItem[] }>("/api/exhibitors", {
        query: { per_page: 200, fallback: 1 },
      }).catch(() => null),
    { server: false },
  );

  const brandsWithLogo = computed<BrandPreviewItem[]>(() => {
    const list = data.value?.data ?? [];
    return list
      .filter((b) => {
        const logo = b.brand_logo;
        if (!logo) return false;
        if (Array.isArray(logo)) return logo.length > 0;
        if (typeof logo === "object") return Object.keys(logo).length > 0;
        return Boolean(logo);
      })
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, PREVIEW_MAX);
  });

  return { data, pending, brandsWithLogo };
}
