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
  profile_image?: unknown;
  brand_logo?: unknown;
  business_categories?: string[];
  score?: number;
}

interface FallbackSource {
  title?: string;
  edition_number?: number | null;
  edition_label?: string | null;
  slug?: string;
}

interface BrandPreviewResponse {
  data?: BrandPreviewItem[];
  meta?: { fallback?: { is_fallback: boolean; source_event: FallbackSource | null } };
}

export function useBrandPreview() {
  const { data, pending } = useLazyAsyncData<BrandPreviewResponse | null>(
    "brand-preview",
    () =>
      $fetch<BrandPreviewResponse>("/api/exhibitors", {
        query: { per_page: 200, fallback: 1 },
      }).catch(() => null),
    { server: false },
  );

  const brandsWithLogo = computed<BrandPreviewItem[]>(() => {
    const list = data.value?.data ?? [];
    return list
      .filter((b) => {
        const logo = b.profile_image ?? b.brand_logo;
        if (!logo) return false;
        if (Array.isArray(logo)) return logo.length > 0;
        if (typeof logo === "object") return Object.keys(logo).length > 0;
        return Boolean(logo);
      })
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, PREVIEW_MAX);
  });

  // Source edition when the active event has no brands and the API borrowed a
  // previous edition (drives the "from a previous edition" notice).
  const fallbackSource = computed<FallbackSource | null>(() => {
    const fb = data.value?.meta?.fallback;
    return fb?.is_fallback ? (fb.source_event ?? null) : null;
  });

  return { data, pending, brandsWithLogo, fallbackSource };
}
