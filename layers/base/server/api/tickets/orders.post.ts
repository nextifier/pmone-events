export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  // Authoritative per-site origin (set server-side, so a client cannot spoof
  // it): lets the backend redirect the buyer back to THIS event website after
  // payment instead of a single global frontend. Validated against an allowlist
  // server-side. Mirrors `hotels/book.post.ts`.
  //
  // In production this is the canonical `siteUrl`. In dev the app's `siteUrl` is
  // baked to the production domain, so the post-payment bounce would land on prod
  // (where a locally-created order does not exist -> "Order not found"). Use the
  // real request origin (e.g. http://localhost:3001) in dev so the buyer returns
  // to THIS dev site instead.
  const siteUrl =
    process.env.NODE_ENV === "production"
      ? (config.public as any).siteUrl
      : getRequestURL(event).origin;
  if (siteUrl) {
    body.origin = siteUrl;
  }

  return await pmOnePublicFetch("/ticket-orders", {
    method: "POST",
    body,
    // Query string, not body: PM One reads the bypass from the query only,
    // because the body above is forwarded verbatim from the browser.
    query: adminPreviewFlag(event, "force_checkout_ticket"),
    // Longer than the default: this call creates the order and mints the
    // payment session upstream.
    timeoutMs: 30000,
    errorShape: "statusMessage",
    errorPrefix: "Order",
  });
});
