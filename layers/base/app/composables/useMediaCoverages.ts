export type MediaCoverage = {
  title: string;
  link: string;
  created_at?: string | null;
};

export type FallbackSource = {
  title?: string;
  edition_number?: number | null;
  edition_label?: string | null;
  slug?: string;
};

type MediaCoverageResponse = {
  data: MediaCoverage[];
  meta?: { fallback?: { is_fallback: boolean; source_event: FallbackSource | null } };
};

/**
 * Fetches event media coverage (press) from the PM One API, replacing the old
 * hardcoded `useNewsCoveragesStore().list`. Shape per item: {title, link, created_at}.
 */
export function useMediaCoverages() {
  return useFetch<MediaCoverageResponse>("/api/event/media-coverage", {
    default: () => ({ data: [] }),
  });
}
