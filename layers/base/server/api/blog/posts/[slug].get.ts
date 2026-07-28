/**
 * Article detail.
 *
 * Used to be an uncached `defineEventHandler` on purpose: the upstream call was
 * what incremented the dashboard's post view count, so caching it here would
 * have silenced the counter. That reasoning died on its own once /news/{slug}
 * started being edge-cached — a HIT skips the render, so the upstream call, and
 * the count with it, stopped happening anyway. Counting moved to a browser
 * beacon (app/composables/usePostTracking.ts), which frees this handler to
 * behave like the other 14 proxies.
 *
 * maxAge 15 + swr false matches them: a short in-worker window that absorbs
 * bursts. NOT swr — a stale payload here fossilises, because SSR writes it into
 * HTML that is then edge-cached for days (see cf-cpu-daily-log.md, 25 Jul).
 */
export default defineCachedEventHandler(
  async (event) => {
    const slug = getRouterParam(event, "slug");
    const locale = (getQuery(event).locale as string) || "en";

    if (!slug) {
      throw createError({
        statusCode: 400,
        message: "Post slug is required",
      });
    }

    return await pmOnePublicFetch(`/blog/posts/${encodeURIComponent(slug)}`, {
      query: { locale },
      errorPrefix: "Post fetch",
    });
  },
  {
    name: "api-blog-post",
    maxAge: 15,
    swr: false,
    // Slug AND locale: without the locale the first language to warm an entry
    // would serve every other one for the next 15 s.
    getKey: (event) =>
      `${getRouterParam(event, "slug")}:${(getQuery(event).locale as string) || "en"}`,
  },
);
