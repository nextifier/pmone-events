export default defineCachedEventHandler(
  async (event) => {
    const locale = (getQuery(event).locale as string) || "en";

    // Shared, cached resolve — see server/utils/resolveEventSlug.ts.
    const eventSlug = await resolveEventSlug(contentUsername());

    if (!eventSlug) {
      return { data: { days: [] } };
    }

    return await pmOneFetch(`/events/${eventSlug}/rundown`, {
      query: {
        locale,
        // Staff preview: reveals the rundown while the event's switch is off.
        ...adminPreviewFlag(event, "force_show_rundown"),
      },
      errorPrefix: "Rundown fetch",
    });
  },
  {
    name: "api-rundown",
    maxAge: API_MAX_AGE,
    // NOT swr. With SWR the expired entry is served while it revalidates, so
    // the request that triggers the refresh still renders stale data — and a
    // purge that lands in that window is undone. Kept false even though HTML is
    // no longer edge-cached (7 Aug 2026): 15 s of staleness is the budget.
    swr: false,
    // The key is locale-only, so an admin preview MUST skip this cache
    // entirely: sharing the key would either serve the admin the public body or,
    // worse, store the revealed rundown under the public key for everyone.
    shouldBypassCache: (event) => hasAdminPreviewFlag(event, "force_show_rundown"),
    getKey: (event) => `l:${(getQuery(event).locale as string) || "en"}`,
  },
);
