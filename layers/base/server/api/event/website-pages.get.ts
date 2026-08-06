export default defineCachedEventHandler(
  async (event) => {
    const locale = (getQuery(event).locale as string) || "en";

    return await pmOneFetch("/website-pages", {
      query: { locale },
      // Short timeout: legal pages await this during SSR, so a PM One outage
      // with a cold cache must not stall renders for long.
      timeoutMs: 3000,
      errorPrefix: "Website pages fetch",
    });
  },
  {
    name: "api-website-pages",
    maxAge: 15,
    // NOT swr. With SWR the expired entry is served while it revalidates, so
    // the request that triggers the refresh still renders stale data — and a
    // purge that lands in that window is undone. Kept false even though HTML is
    // no longer edge-cached (7 Aug 2026): 15 s of staleness is the budget.
    swr: false,
    getKey: (event) => `l:${(getQuery(event).locale as string) || "en"}`,
  },
);
