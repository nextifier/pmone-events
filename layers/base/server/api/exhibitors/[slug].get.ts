export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  return pmOneFetch(`/brands/${slug}`, {
    errorPrefix: "Fetch brand",
  });
});
