export default defineCachedEventHandler(
  async (event) => {
    const locale = (getQuery(event).locale as string) || "en";

    // Shared, cached resolve — see server/utils/resolveEventSlug.ts.
    const eventSlug = await resolveEventSlug(contentUsername());

    if (!eventSlug) {
      return { data: [] };
    }

    return await pmOneFetch(`/events/${eventSlug}/programs`, {
      query: { locale },
      errorPrefix: "Programs fetch",
    });
  },
  {
    name: "api-programs",
    maxAge: 15,
    // NOT swr. A stale payload here fossilises: SSR renders the old data into
    // HTML that is then edge-cached for days. See cf-cache-rules.ts.
    swr: false,
    getKey: (event) => `l:${(getQuery(event).locale as string) || "en"}`,
  },
);
