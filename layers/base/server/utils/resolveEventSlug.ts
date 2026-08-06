/**
 * The event slug every `/api/event/*` route hangs its upstream call off.
 *
 * WHY THIS IS SHARED: six handlers (faq, gallery, media-coverage, partners,
 * programs, rundown) each carried a byte-identical copy of this resolve, so a
 * page that renders two of those sections asked PM One for the active event
 * twice. Cached as a function rather than inlined, one render resolves it once
 * and every later handler reuses it.
 *
 * `maxAge` deliberately matches the handlers' own cache window. This entry
 * lives inside the worker where no purge can reach it, so raising it means a
 * publish can stay invisible for that long — keep it small.
 *
 * Returns null when the project has no events at all; callers turn that into
 * their own empty shape (`{data: []}`, `{data: {days: []}}`, …) so the section
 * shows an empty state instead of a fetch error.
 */
export const resolveEventSlug = defineCachedFunction(
  async (username: string): Promise<string | null> => {
    const base = `/api/public/projects/${username}`;

    // Resolve to null ONLY when the upstream says "no such resource" (404). Any
    // other failure (network, 5xx, timeout) must propagate so Nitro does not
    // cache an empty result and the edge does not pin a blank page.
    const orNullIf404 = (err: any) => {
      if (err?.response?.status === 404 || err?.statusCode === 404) {
        return null;
      }
      throw err;
    };

    // Prefer the project's active event; fall back to the most recent one by
    // start_date so sections still render when nothing is flagged is_active.
    const active = await pmOneRequest<{ data: { slug: string } }>(
      `${base}/events/active`,
      { errorPrefix: "Active event resolve" },
    ).catch(orNullIf404);

    if (active?.data?.slug) {
      return active.data.slug;
    }

    const latest = await pmOneRequest<{ data: Array<{ slug: string }> }>(
      `${base}/events`,
      {
        query: { per_page: 1, sort: "-start_date" },
        errorPrefix: "Latest event resolve",
      },
    ).catch(orNullIf404);

    return latest?.data?.[0]?.slug ?? null;
  },
  {
    name: "event-slug",
    maxAge: 15,
    swr: false,
    getKey: (username: string) => username,
  },
);

/** The project whose content this site reads (see the App ↔ Project map). */
export function contentUsername(): string {
  const appConfig = useAppConfig();
  return appConfig.app.dataSourceUsername || appConfig.app.projectUsername;
}
