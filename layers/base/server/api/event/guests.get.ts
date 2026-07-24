export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const locale = (query.locale as string) || "en";
  const featuredOnly =
    query.featured_only === "true" || query.featured_only === "1";

  // Shared, cached resolve — see server/utils/resolveEventSlug.ts. This route
  // used to resolve the active event WITHOUT the latest-event fallback the
  // other event/* routes have, so a project between editions showed guests as
  // empty while FAQ and rundown still rendered. Now they behave the same.
  const eventSlug = await resolveEventSlug(contentUsername());

  if (!eventSlug) {
    return { data: [], meta: { count: 0, featured_count: 0 } };
  }

  return await pmOneFetch(`/events/${eventSlug}/guests`, {
    query: { locale, ...(featuredOnly ? { featured_only: 1 } : {}) },
    errorPrefix: "Guests fetch",
  });
});
