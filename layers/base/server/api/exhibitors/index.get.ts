const ALLOWED_QUERY = ["per_page", "page", "sort", "fallback", "force_show_brands"];

export default defineEventHandler(async (event) => {
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
});
