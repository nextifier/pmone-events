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
    maxAge: 15,
    // NOT swr. A stale payload here fossilises: SSR renders the old data into
    // HTML that is then edge-cached for days. See cf-cache-rules.ts.
    swr: false,
    getKey: () => "default",
  },
);
