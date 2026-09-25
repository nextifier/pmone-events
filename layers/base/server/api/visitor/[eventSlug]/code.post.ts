/**
 * Ask for a sign-in code. PM One emails it only when the address holds a
 * ticket to this event; otherwise it answers `no_ticket` and sends nothing.
 */
export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, "eventSlug") ?? "");
  const body = await readBody(event).catch(() => ({}));
  return visitorFetch(event, `/events/${slug}/visitor-session/code`, {
    method: "POST",
    body: { email: body?.email },
  });
});
