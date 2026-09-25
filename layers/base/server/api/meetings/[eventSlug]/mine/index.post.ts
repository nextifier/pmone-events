/** Request (or book) a meeting as the signed-in visitor. */
export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, "eventSlug") ?? "");
  const body = await readBody(event).catch(() => ({}));
  return visitorFetch(event, `/events/${slug}/me/meetings`, {
    method: "POST",
    body: { brand_event_id: body?.brand_event_id, starts_at: body?.starts_at, message: body?.message ?? null },
  });
});
