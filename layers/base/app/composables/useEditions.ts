export type Edition = {
  title: string;
  slug: string;
  edition_number: number;
  edition_label?: string;
  date_label?: string;
  is_active?: boolean;
};

type EditionsResponse = { data: Edition[] };

/**
 * The project's published editions, fetched once per page.
 *
 * Two problems this exists to solve, both measured in the shipped bundle:
 *
 * 1. ONE cache entry. Nuxt derives an auto-key per CALL SITE, so Header.vue and
 *    useBrandsListing.js each held their own ("$9lNcGWF35D" / "$zUyFCTPQ8p")
 *    and /brands fired the same request twice. An explicit key collapses them —
 *    keep every caller on this composable rather than reintroducing an inline
 *    useFetch("/api/editions").
 *
 * 2. It can stay idle. The edition picker only renders on brands/rundown
 *    routes, yet the Header fetched this on EVERY page of all 16 apps. Callers
 *    that need it conditionally pass `immediate: false` and run `execute()`
 *    once the route becomes editionable.
 */
export function useEditions(options: { immediate?: boolean } = {}) {
  return useFetch("/api/editions", {
    key: "editions",
    immediate: options.immediate ?? true,
    transform: (res: EditionsResponse) => res.data,
  });
}
