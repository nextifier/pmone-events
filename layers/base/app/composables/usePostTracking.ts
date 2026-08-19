type PostIdGetter = () => number | null | undefined;

/**
 * Tracks article views against the Post, from the browser.
 *
 * This used to be counted upstream: PM One's `GET /public/blog/posts/{slug}`
 * wrote a Visit row on every call, and that route was deliberately left out of
 * the response cache to keep it working. It stopped being a view counter the
 * day /news/{slug} started being edge-cached — a cache HIT means no render, no
 * upstream call, no row. Measured on production: 23,300 views/day fell to 4,359
 * within three days, while banner and brand tracking (already client-side)
 * stayed flat. The number in the dashboard had quietly become "cache misses".
 *
 * Same shape as useBannerTracking / useBrandTracking so all four types are
 * counted the same way. Two consequences worth knowing: bots do not run JS, so
 * the figure drops again and becomes human traffic; and it fires once per page
 * load, matching the old "no deduplication, always increment on refresh".
 */
export function usePostTracking(getPostId: PostIdGetter) {
  // Keyed by id, not a plain boolean: /news/[slug] is one component instance
  // for every article, so navigating A -> B -> A must count A, then B, then A
  // again. A boolean would count only the first article of a session.
  const lastTrackedId = ref<number | null>(null);

  const trackVisit = () => {
    if (!import.meta.client) return;
    const id = getPostId();
    if (!id || lastTrackedId.value === id) return;
    lastTrackedId.value = id;

    $fetch("/api/track/visit", {
      method: "POST",
      body: {
        visitable_type: "App\\Models\\Post",
        visitable_id: id,
      },
    }).catch((error) => {
      // 429 is the only status that guarantees the row was NOT written, so it
      // is the only one safe to retry on a later navigation. A timeout or a 5xx
      // is ambiguous — PM One may have committed the row and lost the response
      // — and clearing the key there would double-count the same page view.
      const status = error?.statusCode ?? error?.response?.status;
      if (status === 429 && lastTrackedId.value === id) {
        lastTrackedId.value = null;
      }

      // Silent in production by design (a lost view must never break the page),
      // but a beacon that fails everywhere would otherwise be invisible: the
      // dashboard would just show a lower number with nothing to explain it.
      if (import.meta.dev) {
        console.warn(`[usePostTracking] visit beacon failed (${status ?? "network"})`, error);
      }
    });
  };

  return { trackVisit };
}
