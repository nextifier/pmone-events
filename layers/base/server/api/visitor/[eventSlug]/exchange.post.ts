/**
 * Sign in from a token the visitor already holds: the order token on the
 * checkout result page, or the signed link in a meeting email.
 */
export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, "eventSlug") ?? "");
  const body = await readBody(event).catch(() => ({}));
  return openVisitorSession(event, `/events/${slug}/visitor-session/exchange`, {
    order_token: body?.order_token ?? null,
    order_ulid: body?.order_ulid ?? null,
    login_token: body?.login_token ?? null,
  });
});
