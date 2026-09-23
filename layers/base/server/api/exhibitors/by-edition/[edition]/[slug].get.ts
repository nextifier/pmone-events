export default defineCachedEventHandler(
  async (event) => {
    const edition = getRouterParam(event, "edition");
    const slug = getRouterParam(event, "slug");
    return pmOneFetch(`/editions/${edition}/brands/${slug}`, {
      query: adminPreviewFlag(event, "force_show_brands"),
      errorPrefix: "Fetch brand for edition",
    });
  },
  {
    name: "api-exhibitor-edition",
    maxAge: API_MAX_AGE,
    // NOT swr, same as every other cached proxy here (see event/rundown.get.ts).
    swr: false,
    shouldBypassCache: (event) => hasAdminPreviewFlag(event, "force_show_brands"),
    getKey: (event) =>
      `${getRouterParam(event, "edition")}:${getRouterParam(event, "slug")}`,
  },
);
