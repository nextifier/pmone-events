/**
 * Public embeddable form definition for an event website (/forms/{slug}).
 *
 * Cached GET proxy (X-API-Key server-side) that pmOneFetch prefixes to PM One's
 * project-scoped `GET /api/public/projects/{username}/forms/{slug}`. Because it
 * is project-scoped server-side, a slug belonging to another project 404s
 * regardless of what the browser asks for. Only the form definition is cached;
 * per-visitor state (duplicate check) has its own no-store route.
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
    maxAge: 15,
    // NOT swr. A stale payload here fossilises: SSR renders the old data into
    // HTML that is then edge-cached for days. See cf-cache-rules.ts.
    swr: false,
    getKey: (event) =>
      `${getRouterParam(event, "slug")}:${(getQuery(event).locale as string) || "en"}`,
  },
);
