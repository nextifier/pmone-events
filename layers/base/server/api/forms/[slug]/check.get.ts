/**
 * Duplicate-submission check for a public form (/forms/{slug}/check).
 *
 * Per-visitor (keyed by fingerprint/email), so it must NEVER be cached. It
 * self-sets `private, no-store`, which the cacheControl plugin treats as an
 * opt-out and leaves alone. Plain handler, not a cached one, for the same
 * reason.
 */
export default defineEventHandler(async (event) => {
  setResponseHeader(event, "cache-control", "private, no-store");

  const query = getQuery(event);
  const slug = getRouterParam(event, "slug");

  return pmOneFetch(`/forms/${slug}/check`, {
    query,
    allowedQueryKeys: ["fingerprint", "email"],
    errorPrefix: "Duplicate check",
  });
});
