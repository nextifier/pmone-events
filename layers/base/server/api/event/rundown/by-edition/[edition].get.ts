export default defineCachedEventHandler(
  async (event) => {
    const edition = getRouterParam(event, "edition");
    const query = getQuery(event);
    const locale = (query.locale as string) || "en";
    return pmOneFetch(`/editions/${edition}/rundown`, {
      query: {
        locale,
        ...adminPreviewFlag(event, "force_show_rundown"),
      },
      allowedQueryKeys: ["locale", "force_show_rundown"],
      errorPrefix: "Fetch rundown for edition",
    });
  },
  {
    name: "api-rundown-edition",
    maxAge: API_MAX_AGE,
    // NOT swr, same as every other cached proxy here (see event/rundown.get.ts).
    swr: false,
    shouldBypassCache: (event) => hasAdminPreviewFlag(event, "force_show_rundown"),
    getKey: (event) =>
      `${getRouterParam(event, "edition")}:${(getQuery(event).locale as string) || "en"}`,
  },
);
