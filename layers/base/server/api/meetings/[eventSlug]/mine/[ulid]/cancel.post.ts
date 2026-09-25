/** Cancel the visitor's request or meeting. */
export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, "eventSlug") ?? "");
  const ulid = encodeURIComponent(getRouterParam(event, "ulid") ?? "");
  return visitorFetch(event, `/events/${slug}/me/meetings/${ulid}/cancel`, { method: "POST" });
});
