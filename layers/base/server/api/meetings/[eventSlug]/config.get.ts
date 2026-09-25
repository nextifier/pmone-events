/**
 * Whether the event takes meeting requests, its rules, and which exhibitors
 * take them. The same for every visitor, so it is cached like the other
 * proxies; the answer is 404 when the event has meetings off.
 */
export default defineCachedEventHandler(
  async (event) => {
    const slug = getRouterParam(event, "eventSlug");
    return pmOnePublicFetch(`/events/${encodeURIComponent(slug ?? "")}/meetings/config`, {
      errorPrefix: "Meetings config",
    });
  },
  {
    name: "api-meetings-config",
    maxAge: API_MAX_AGE,
    swr: false,
    getKey: (event) => String(getRouterParam(event, "eventSlug")),
  },
);
