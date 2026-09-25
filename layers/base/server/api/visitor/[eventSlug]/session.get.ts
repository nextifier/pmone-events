/** Who is signed in on this site, and what their ticket allows. 401 when nobody. */
export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, "eventSlug") ?? "");
  if (!visitorToken(event)) {
    setResponseHeader(event, "cache-control", "private, no-store");
    return { data: null };
  }
  try {
    return await visitorFetch(event, `/events/${slug}/visitor-session`);
  } catch (error: any) {
    if (error?.statusCode === 401) return { data: null };
    throw error;
  }
});
