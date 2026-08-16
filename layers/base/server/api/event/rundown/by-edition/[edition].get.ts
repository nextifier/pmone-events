export default defineEventHandler(async (event) => {
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
});
