/** Move the visitor's meeting to another time. */
export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, "eventSlug") ?? "");
  const ulid = encodeURIComponent(getRouterParam(event, "ulid") ?? "");
  const body = await readBody(event).catch(() => ({}));
  return visitorFetch(event, `/events/${slug}/me/meetings/${ulid}`, {
    method: "PATCH",
    body: { starts_at: body?.starts_at, message: body?.message ?? null },
  });
});
