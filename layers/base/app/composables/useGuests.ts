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
  /** Pre-formatted by PM One: "3-4" / "Oct", or "25 Oct - 2 Nov" / "" across months. */
  appearance_date?: { date: string; month: string } | null;
};

/** Same icon map as the brand page (brands/[slug].vue). */
const LINK_ICONS: Record<string, string> = {
  website: "hugeicons:globe-02",
  instagram: "hugeicons:instagram",
  facebook: "hugeicons:facebook-01",
  tiktok: "hugeicons:tiktok",
  x: "hugeicons:new-twitter",
  twitter: "hugeicons:new-twitter",
  linkedin: "hugeicons:linkedin-01",
  youtube: "hugeicons:youtube",
  threads: "hugeicons:threads",
};

export function guestLinkIcon(label?: string): string {
  return LINK_ICONS[label?.toLowerCase() ?? ""] || "hugeicons:link-01";
}

/**
 * A team lists one Instagram per member, so an Instagram link names its
 * handle. The label doubles as the tooltip and the accessible name.
 */
export function guestLinkLabel(link: { label: string; url: string }): string {
  if (link.label !== "Instagram") return link.label;
  const handle = link.url.replace(/\/+$/, "").split("/").pop();
  return handle ? `Instagram @${handle}` : link.label;
}

/**
 * Conversion ladder registered on the Guest model (registerMediaConversions).
 * Each conversion is bound by height and keeps the upload's ratio, so its
 * width is the height times the event's frame ratio (3:4 gives 225, 450, 750
 * and 1013px).
 */
export const GUEST_PHOTO_HEIGHTS = { sm: 300, md: 600, lg: 1000, xl: 1350 };

/**
 * Build a srcset from whichever conversions exist, the way buildCoverSrcset
 * does for form covers: ungenerated conversions fall back to the original URL
 * server-side, so repeats are dropped. `ratio` is the frame, "3:4" or "3 / 4".
 * Returns undefined when there is nothing meaningful to choose between.
 */
export function buildGuestPhotoSrcset(
  photo: GuestImage | null | undefined,
  ratio: string,
): string | undefined {
  if (!photo) return undefined;

  const [w, h] = ratio.split(/[:/]/).map(Number);
  const scale = w && h ? w / h : 4 / 5;

  const seen = new Set<string>();
  const candidates: string[] = [];

  for (const [key, height] of Object.entries(GUEST_PHOTO_HEIGHTS)) {
    const url = photo[key as keyof typeof GUEST_PHOTO_HEIGHTS];
    if (!url || seen.has(url)) continue;
    seen.add(url);
    candidates.push(`${url} ${Math.round(height * scale)}w`);
  }

  return candidates.length > 1 ? candidates.join(", ") : undefined;
}

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
