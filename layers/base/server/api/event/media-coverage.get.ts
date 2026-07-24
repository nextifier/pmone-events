export default defineCachedEventHandler(
  async () => {
    // Shared, cached resolve — see server/utils/resolveEventSlug.ts.
    const eventSlug = await resolveEventSlug(contentUsername());

    if (!eventSlug) {
      return { data: [] };
    }

    return await pmOneFetch(`/events/${eventSlug}/media-coverages`, {
      errorPrefix: "Media coverage fetch",
    });
  },
  {
    name: "api-media-coverage",
    maxAge: 15,
    // NOT swr. A stale payload here fossilises: SSR renders the old data into
    // HTML that is then edge-cached for days. See cf-cache-rules.ts.
    swr: false,
    getKey: () => "default",
  },
);
