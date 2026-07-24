/**
 * Article detail.
 *
 * Deliberately NOT a cached handler: this fetch is what triggers
 * TrackingHelper::trackVisit upstream, which is where the dashboard's post view
 * count comes from. Caching it here would silence the counter.
 */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  const locale = (getQuery(event).locale as string) || "en";

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: "Post slug is required",
    });
  }

  return await pmOnePublicFetch(
    `/blog/posts/${encodeURIComponent(slug)}`,
    { query: { locale }, errorPrefix: "Post fetch" },
  );
});
