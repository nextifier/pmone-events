/**
 * Public hotels listing for the current event website.
 *
 * Adapter route: unlike the pmone admin app (which proxies `/api/public/hotels`
 * unscoped and shows every hotel), each event site must only ever surface the
 * hotels that belong to its own project. We force `project_slug` from the
 * app config so the `<Hotels />` component can stay byte-identical across repos
 * while still being correctly project-scoped here.
 */
export default defineEventHandler(async (event) => {
  const appConfig = useAppConfig();
  const username =
    appConfig.app.dataSourceUsername || appConfig.app.projectUsername;

  const query = getQuery(event);

  return await pmOnePublicFetch("/hotels", {
    // Allowlisted rather than spreading the raw client query: `project_slug` is
    // what scopes this site to its own hotels, and a forwarded query could
    // otherwise carry keys the upstream honours.
    query: {
      per_page: query.per_page,
      page: query.page,
      sort: query.sort,
      locale: query.locale,
      project_slug: username,
    },
    allowedQueryKeys: ["per_page", "page", "sort", "locale", "project_slug"],
    errorPrefix: "Hotels fetch",
  });
});
