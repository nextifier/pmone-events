export default defineCachedEventHandler(
  async (event) => {
    const locale = (getQuery(event).locale as string) || "en";

    // Shared, cached resolve — see server/utils/resolveEventSlug.ts. Null means
    // the project has no events at all, so the component shows its empty state
    // instead of a generic fetch-error UI.
    const eventSlug = await resolveEventSlug(contentUsername());

    if (!eventSlug) {
      return { data: [] };
    }

    return await pmOneFetch(`/events/${eventSlug}/faqs`, {
      query: { locale, fallback: dataFallbackFlag("faqs") },
      errorPrefix: "FAQ fetch",
    });
  },
  {
    name: "api-event-faq",
    maxAge: API_MAX_AGE,
    // NOT swr. With SWR the expired entry is served while it revalidates, so
    // the request that triggers the refresh still renders stale data — and a
    // purge that lands in that window is undone. Kept false even though HTML is
    // no longer edge-cached (7 Aug 2026): 15 s of staleness is the budget.
    swr: false,
    getKey: (event) => `l:${(getQuery(event).locale as string) || "en"}`,
  },
);
