export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  // Authoritative per-site origin (set server-side, so a client cannot spoof it):
  // lets the backend redirect the guest back to THIS event website after payment
  // instead of a single global frontend. Validated against an allowlist server-side.
  //
  // In production this is the canonical `siteUrl`. In dev the app's `siteUrl` is
  // baked to the production domain, so the post-payment bounce would land on prod
  // (where a locally-created reservation does not exist). Use the real request
  // origin (e.g. http://localhost:3001) in dev so the guest returns to THIS dev
  // site instead. Mirrors `tickets/orders.post.ts`.
  const siteUrl =
    process.env.NODE_ENV === "production"
      ? (config.public as any).siteUrl
      : getRequestURL(event).origin;
  if (siteUrl) {
    body.origin = siteUrl;
  }

  return await pmOnePublicFetch("/reservations", {
    method: "POST",
    body,
    // Longer than the default: this call creates the reservation and mints the
    // payment session upstream.
    timeoutMs: 30000,
    errorShape: "statusMessage",
    errorPrefix: "Reservation",
  });
});
