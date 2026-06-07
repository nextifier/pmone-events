export type MediaCoverage = {
  title: string;
  link: string;
  created_at?: string | null;
};

type MediaCoverageResponse = {
  data: MediaCoverage[];
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
