const ALLOWED_QUERY = ["per_page", "page", "sort", "force_show_brands"];

export default defineCachedEventHandler(
  async (event) => {
    const edition = getRouterParam(event, "edition");
    const query = getQuery(event);
    return pmOneFetch(`/editions/${edition}/brands`, {
      query: {
        per_page: query.per_page || 200,
        ...query,
        ...adminPreviewFlag(event, "force_show_brands"),
      },
      allowedQueryKeys: ALLOWED_QUERY,
      errorPrefix: "Fetch brands for edition",
    });
  },
  {
    name: "api-exhibitors-edition",
    maxAge: API_MAX_AGE,
    // NOT swr, same as every other cached proxy here (see event/rundown.get.ts).
    swr: false,
    // The key is built from the allowlisted query only, and a staff preview skips
    // the cache so a force-shown list never lands under the public key.
    shouldBypassCache: (event) => hasAdminPreviewFlag(event, "force_show_brands"),
    getKey: (event) => {
      const query = getQuery(event);

      return [getRouterParam(event, "edition"), query.per_page, query.page, query.sort]
        .map((value) => String(value ?? ""))
        .join(":");
    },
  },
);
