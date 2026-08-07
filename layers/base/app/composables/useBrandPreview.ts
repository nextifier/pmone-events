/**
 * Shared data source for the home-page BrandPreview section.
 *
 * Fetches the active event's brands with `?fallback` from
 * `app.config.settings.dataFallback.brands`: when on and the active event has no
 * brands yet, the API borrows the most recent previous edition that does.
 *
 * `server: false` keeps the fetch client-only, so the brand grid is never baked
 * into a prerendered home page and stays fresh without a rebuild.
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
        // Opt-in per call site: the /brands listing hits the same route and must
        // never borrow, so this teaser is the only caller that asks for it.
        query: { per_page: 200, fallback: useDataFallback().brands },
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
