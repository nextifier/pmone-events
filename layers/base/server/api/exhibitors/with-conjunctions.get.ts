const ALLOWED_QUERY = ["per_page", "page", "sort"];

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  return pmOneFetch("/brands-with-conjunctions", {
    query: { per_page: query.per_page || 200, ...query },
    allowedQueryKeys: ALLOWED_QUERY,
    errorPrefix: "Fetch brands with conjunctions",
  });
});
