export default defineCachedEventHandler(
  async (event) => {
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
  },
  {
    name: "api-guest",
    maxAge: API_MAX_AGE,
    // NOT swr, same as every other cached proxy here (see event/rundown.get.ts).
    swr: false,
    getKey: (event) =>
      `${getRouterParam(event, "slug")}:${(getQuery(event).locale as string) || "en"}`,
  },
);
