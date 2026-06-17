const ALLOWED_QUERY = ["per_page", "page", "sort", "fallback"];

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  return pmOneFetch("/brands", {
    query: { per_page: query.per_page || 200, ...query },
    allowedQueryKeys: ALLOWED_QUERY,
    errorPrefix: "Fetch brands",
  });
});
