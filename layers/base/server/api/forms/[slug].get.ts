/**
 * Public form definition for an event website (/f/{slug}).
 *
 * Cached GET proxy (X-API-Key server-side) that pmOneFetch prefixes to PM One's
 * project-scoped `GET /api/public/projects/{username}/forms/{slug}`. Because it
 * is project-scoped server-side, a slug belonging to another project 404s
 * regardless of what the browser asks for. Only the form definition is cached;
 * per-visitor state (duplicate check) has its own no-store route.
 *
 * The page no longer sends ?locale: the payload is the same in every language.
 * Field labels ship as a `label_translations` map that the renderer resolves
 * client-side, and Form itself is not translatable. The locale plumbing below
 * is kept for the day that changes — until then every request keys to `en`.
 */
export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const slug = getRouterParam(event, "slug");

    return pmOneFetch(`/forms/${slug}`, {
      query,
      allowedQueryKeys: ["locale"],
      errorPrefix: "Form fetch",
    });
  },
  {
    name: "api-form-public",
    maxAge: API_MAX_AGE,
    // NOT swr. With SWR the expired entry is served while it revalidates, so
    // the request that triggers the refresh still renders stale data — and a
    // purge that lands in that window is undone. Kept false even though HTML is
    // no longer edge-cached (7 Aug 2026): 15 s of staleness is the budget.
    swr: false,
    getKey: (event) =>
      `${getRouterParam(event, "slug")}:${(getQuery(event).locale as string) || "en"}`,
  },
);
