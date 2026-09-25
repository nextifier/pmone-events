/** Take one of the times the exhibitor suggested when declining. */
export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, "eventSlug") ?? "");
  const ulid = encodeURIComponent(getRouterParam(event, "ulid") ?? "");
  const body = await readBody(event).catch(() => ({}));
  return visitorFetch(event, `/events/${slug}/me/meetings/${ulid}/accept-suggestion`, {
    method: "POST",
    body: { key: body?.key },
  });
});
