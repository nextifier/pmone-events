const ALLOWED_QUERY = ["per_page", "page", "sort", "fallback", "force_show_brands"];

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    return pmOneFetch("/brands", {
      query: {
        per_page: query.per_page || 200,
        ...query,
        // Staff preview: reveals the list while the event's brands switch is off.
        ...adminPreviewFlag(event, "force_show_brands"),
      },
      allowedQueryKeys: ALLOWED_QUERY,
      errorPrefix: "Fetch brands",
    });
  },
  {
    name: "api-exhibitors",
    maxAge: API_MAX_AGE,
    // NOT swr, same as every other cached proxy here (see event/rundown.get.ts).
    swr: false,
    // The key is built from the allowlisted query only, and a staff preview skips
    // the cache so a force-shown list never lands under the public key.
    shouldBypassCache: (event) => hasAdminPreviewFlag(event, "force_show_brands"),
    getKey: (event) => {
      const query = getQuery(event);

      return [query.per_page, query.page, query.sort, query.fallback]
        .map((value) => String(value ?? ""))
        .join(":");
    },
  },
);
