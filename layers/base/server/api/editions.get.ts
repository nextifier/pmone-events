export default defineCachedEventHandler(
  async () => {
    return pmOneFetch("/editions", {
      errorPrefix: "Fetch editions",
    });
  },
  {
    name: "api-editions",
    maxAge: 15,
    // NOT swr. With SWR the expired entry is served while it revalidates, so
    // the request that triggers the refresh still renders stale data — and a
    // purge that lands in that window is undone. Kept false even though HTML is
    // no longer edge-cached (7 Aug 2026): 15 s of staleness is the budget.
    swr: false,
    getKey: () => "default",
  },
);
