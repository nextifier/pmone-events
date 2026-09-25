/** Trade the emailed code for a session cookie on this site. */
export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, "eventSlug") ?? "");
  const body = await readBody(event).catch(() => ({}));
  return openVisitorSession(event, `/events/${slug}/visitor-session`, {
    email: body?.email,
    code: body?.code,
  });
});
