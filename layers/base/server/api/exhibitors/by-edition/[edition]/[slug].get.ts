export default defineEventHandler(async (event) => {
  const edition = getRouterParam(event, "edition");
  const slug = getRouterParam(event, "slug");
  return pmOneFetch(`/editions/${edition}/brands/${slug}`, {
    errorPrefix: "Fetch brand for edition",
  });
});
