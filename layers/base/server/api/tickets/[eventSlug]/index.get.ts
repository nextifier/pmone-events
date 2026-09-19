/**
 * Public ticket listing for an event website.
 *
 * Adapter route mirroring `server/api/hotels/index.get.ts`: the X-API-Key is
 * attached server-side so the key never reaches the browser. Proxies PM One's
 * `GET /api/public/events/{eventSlug}/tickets`, which the backend gates behind
 * the per-event tickets toggle (returns 404 TICKETS_DISABLED when off — the
 * `<TicketList>` component treats that as "fall back to the static tickets").
 *
 * CACHED, unlike every other ticket route, and this one is worth explaining.
 *
 * /tickets is prerendered, so Cloudflare serves it without ever waking the
 * Worker — but the page still calls this route from the browser on every visit
 * (pages/tickets/index.vue, onNuxtReady → refreshTickets), because static HTML
 * is a build-time snapshot and sale status moves on its own. This route used to
 * be an uncached passthrough, which made that a 1:1 relationship: one visitor,
 * one hit on api.pmone.id. /api/ is excluded from the edge cache too
 * (server/utils/edgeCache.ts, looksLikePage), so nothing else absorbed it.
 *
 * On 19 Sep 2026 that ratio met a ticket-sale rush. api.pmone.id saturated,
 * nginx ran out of file descriptors, and the origin sat at 100% CPU for an hour.
 * Fifteen seconds of caching turns a burst of thousands into a handful of
 * upstream calls, which is the difference between absorbing a launch and being
 * taken down by one.
 */
export default defineCachedEventHandler(
  async (event) => {
    const eventSlug = getRouterParam(event, "eventSlug");
    const locale = (getQuery(event).locale as string) || "en";

    // Forward the locale so PM One returns localized ticket copy and, in
    // `meta.terms`, the staff-managed purchase terms HTML for this locale.
    return await pmOnePublicFetch(
      `/events/${encodeURIComponent(eventSlug ?? "")}/tickets`,
      {
        query: {
          locale,
          // Staff preview: also lists tickets whose Active toggle is off, so
          // checkout can be smoke-tested on production before sales open.
          // Hidden (access-code) tickets are still never listed.
          ...adminPreviewFlag(event, "force_checkout_ticket"),
          ...previewTokenQuery(event),
        },
        // Fail fast rather than hold the Worker. The default is 15s, which
        // during the outage above meant every invocation stalled for fifteen
        // seconds before rendering nothing useful anyway.
        timeoutMs: API_TIMEOUT_MS,
        errorShape: "statusMessage",
        errorPrefix: "Tickets fetch",
      },
    );
  },
  {
    name: "api-tickets-listing",
    maxAge: API_MAX_AGE,
    // NOT swr, for the same reason as every other cached proxy here: with SWR
    // the expired entry is served while it revalidates, so the request that
    // triggers the refresh still renders stale data.
    //
    // The cost of this cache is that a price phase opening can now take up to
    // maxAge to show, which is exactly what 0eaeda8f went to some trouble to
    // fix on the origin side (TenantCacheResponse::staleAt trims the Laravel
    // entry to the phase boundary). Fifteen seconds is a far smaller window
    // than the five minutes that bug produced, and TicketList's own boundary
    // retry ladder re-fetches at +3s, +13s and +43s, so the second retry
    // clears any window this opened. An origin that stays up is worth it.
    swr: false,
    // Staff preview must never be cached, and must never poison the public
    // entry: it deliberately lists tickets whose Active toggle is off.
    shouldBypassCache: (event) => {
      const query = getQuery(event);

      return (
        query.preview_token !== undefined ||
        query.force_checkout_ticket !== undefined
      );
    },
    getKey: (event) =>
      `${getRouterParam(event, "eventSlug")}:${(getQuery(event).locale as string) || "en"}`,
  },
);
