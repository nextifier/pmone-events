type GuestImage = {
  url?: string;
  original?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  lqip?: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type Guest = {
  id: number;
  name: string;
  slug: string;
  title?: string | null;
  bio?: string | null;
  organization?: string | null;
  is_featured?: boolean;
  order_column?: number | null;
  profile_image?: GuestImage | null;
  tags?: string[];
  links?: Array<{ label: string; url: string }>;
};

// Local (not exported) to avoid an auto-import name clash with the identical
// `FallbackSource` exported from useMediaCoverages.ts. Same pattern as the
// local interface in useBrandPreview.ts.
type FallbackSource = {
  title?: string;
  edition_number?: number | null;
  edition_label?: string | null;
  slug?: string;
};

type GuestListResponse = {
  data: Guest[];
  meta: {
    count: number;
    featured_count: number;
    fallback?: { is_fallback: boolean; source_event: FallbackSource | null };
  };
};

type GuestDetailResponse = {
  data: Guest;
};

export function useGuests(opts: { featuredOnly?: boolean; ssr?: boolean } = {}) {
  const { locale } = useI18n();

  return useFetch<GuestListResponse>("/api/event/guests", {
    // Explicit key: Nuxt's auto-key is per call site, so two components asking
    // for the same list from different files would fetch it twice.
    key: () => `guests-${opts.featuredOnly ? "featured" : "all"}-${locale.value}`,
    query: {
      locale,
      ...(opts.featuredOnly ? { featured_only: 1 } : {}),
    },
    // SSR on the dedicated /guests and /speakers pages (crawlable, and they are
    // never prerendered); client-only wherever the list is embedded on a page
    // that IS prerendered, so it never freezes into static HTML.
    server: opts.ssr ?? true,
    lazy: !(opts.ssr ?? true),
    watch: [locale],
    default: () => ({ data: [], meta: { count: 0, featured_count: 0 } }),
  });
}

export function useGuest(slug: MaybeRef<string>) {
  const { locale } = useI18n();
  const slugRef = toRef(slug);

  return useFetch<GuestDetailResponse>(() => `/api/event/guests/${slugRef.value}`, {
    query: { locale },
    server: true,
    watch: [locale, slugRef],
  });
}
