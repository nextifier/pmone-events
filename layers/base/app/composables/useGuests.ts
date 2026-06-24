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

export type FallbackSource = {
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
    query: {
      locale,
      ...(opts.featuredOnly ? { featured_only: 1 } : {}),
    },
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
