export default defineCachedEventHandler(
  async () => {
    // Follows the shared data source when set (icf/cokelat -> cbe) so the event
    // header (dates, venue, edition, in-conjunction) matches the borrowed
    // content; apps without a dataSourceUsername use their own project.
    return await pmOneFetch("/events/active", {
      errorPrefix: "Active event fetch",
    });
  },
  {
    name: "api-event-active",
    maxAge: API_MAX_AGE,
    // NOT swr. With SWR the expired entry is served while it revalidates, so
    // the request that triggers the refresh still renders stale data — and a
    // purge that lands in that window is undone. Kept false even though HTML is
    // no longer edge-cached (7 Aug 2026): 15 s of staleness is the budget.
    swr: false,
    getKey: () => "default",
  },
);
