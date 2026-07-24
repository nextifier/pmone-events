export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  const locale = (getQuery(event).locale as string) || "en";

  if (!slug) {
    throw createError({ statusCode: 400, message: "Missing slug" });
  }

  // Shared, cached resolve — see server/utils/resolveEventSlug.ts.
  const eventSlug = await resolveEventSlug(contentUsername());

  if (!eventSlug) {
    throw createError({ statusCode: 404, message: "No active event" });
  }

  return await pmOneFetch(
    `/events/${eventSlug}/guests/${encodeURIComponent(slug)}`,
    { query: { locale }, errorPrefix: "Guest fetch" },
  );
});
