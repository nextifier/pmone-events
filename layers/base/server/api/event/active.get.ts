export default defineCachedEventHandler(
  async () => {
    // Follows the shared data source when set (icf/cokelat -> cbe) so the event
    // header (dates, venue, edition, in-conjunction) matches the borrowed
    // content; apps without a dataSourceUsername use their own project.
    return await pmOneFetch("/events/active", {
      // Every SSR page pulls this in through the default layout (Header,
      // Footer, DialogContact), and it had no timeout, so it fell back to
      // pmOneFetch's 15s default. During the 19 Sep 2026 outage that meant
      // every /guests, /rundown, /partners and /news render held its Worker
      // for fifteen seconds before painting a shell without the data anyway -
      // which to a visitor is indistinguishable from the site being down.
      timeoutMs: API_TIMEOUT_MS,
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
