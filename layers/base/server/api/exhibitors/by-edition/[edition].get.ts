const ALLOWED_QUERY = ["per_page", "page", "sort"];

export default defineEventHandler(async (event) => {
  const edition = getRouterParam(event, "edition");
  const query = getQuery(event);
  return pmOneFetch(`/editions/${edition}/brands`, {
    query: { per_page: query.per_page || 200, ...query },
    allowedQueryKeys: ALLOWED_QUERY,
    errorPrefix: "Fetch brands for edition",
  });
});
