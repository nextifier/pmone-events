/** The visitor answers an exhibitor's invitation: decline. */
export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, "eventSlug") ?? "");
  const ulid = encodeURIComponent(getRouterParam(event, "ulid") ?? "");
  const body = await readBody(event).catch(() => ({}));
  return visitorFetch(event, `/events/${slug}/me/meetings/${ulid}/decline`, {
    method: "POST",
    body: { note: body?.note ?? null },
  });
});
