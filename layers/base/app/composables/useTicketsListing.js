import { useTicketCartStore } from "../stores/ticketCart";

/**
 * Shared public ticket listing fetch. Called by both the tickets page (to
 * decide the full-page "coming soon" state during SSR) and <TicketList>; the
 * shared key + identical options guarantee a single asyncData entry, and the
 * custom getCachedData reuses the page's server-fetched payload so the second
 * call never re-hits PM One during the same SSR render.
 */
export function ticketsListingCachedData(key, nuxtApp) {
  if (import.meta.server || nuxtApp.isHydrating) {
    return nuxtApp.payload.data[key];
  }
}

/**
 * The staff-preview state behind both the listing request and the fallback copy
 * <TicketList> keeps. One definition because the two must agree: a preview
 * response lists tickets whose Active toggle is off, and must never become what
 * an ordinary visit falls back to.
 *
 * Staff preview: `?force-checkout-ticket` also lists tickets whose Active
 * toggle is off, so production checkout can be smoke-tested before sales open.
 * Distinct data key, so a forced payload is never reused for a public visitor
 * after client-side navigation. `?preview-token=` is what actually unlocks
 * checkout now, and it can pin a price phase so a paid phase can be rehearsed
 * while a free one is selling.
 *
 * The URL is where a staff preview STARTS, not where it lives. /tickets/checkout
 * is a separate route reached by navigation, so its own query string carries
 * neither the flag nor the token - which is exactly why the cart persists both.
 *
 * Reading the URL alone made the checkout page fetch the PUBLIC listing while
 * its pricing and its order submit used the pinned one. The listing then
 * reported the caps of the phase that is LIVE rather than the phase being
 * rehearsed, and `reconcile()` culled every cart line those caps disallowed:
 * three day passes bought under an uncapped phase arrived at checkout as one,
 * with "Some tickets are no longer available".
 *
 * The cart is a client-only source (it hydrates from localStorage on mount), so
 * on the server both fall back to the URL and SSR is unchanged.
 */
export function useTicketsListingPreview() {
  const cart = useTicketCartStore();
  const urlForceCheckout = useForceShow("force-checkout-ticket");
  const urlPreviewToken = usePreviewToken();

  const forceCheckout = computed(
    () => urlForceCheckout.value || cart.forceCheckout === true,
  );
  const previewToken = computed(
    () => urlPreviewToken.value ?? cart.previewToken ?? null,
  );

  return {
    forceCheckout,
    previewToken,
    active: computed(() => forceCheckout.value || previewToken.value !== null),
  };
}

/**
 * How long a stored listing may stand in for a live one.
 *
 * The copy this backs up is the prerendered one, which is itself only as fresh
 * as the last deploy, so a week is the same order of staleness a visitor can
 * already be served. Past that a browser left idle for months would resurrect
 * prices for an event that has since happened, which is worse than the error
 * state it replaces.
 */
const FALLBACK_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Keyed by locale, NOT by event slug, and the slug travels inside the record
 * instead.
 *
 * The slug is itself read from PM One (`/api/event/active` -> `useEvent()`), so
 * the outage that makes this fallback necessary is the same one that can leave
 * the slug an empty string. Keying on it meant looking up
 * `tickets-listing::en` and missing - measured 22 Sep 2026 against a dev server
 * with the API pointed at a dead port, where the listing was in storage and the
 * page still showed "Couldn't load tickets".
 *
 * A site serves one active event, so a stored listing found without a slug to
 * check against is the right one. When there IS a slug it still has to match,
 * which is what stops an edition rollover from serving last year's prices.
 */
function fallbackKey(locale) {
  return `tickets-listing:${locale}`;
}

/**
 * The last listing this browser received for the event, or null when there is
 * none, it has aged out, it belongs to a different event, or storage is
 * unavailable (private windows, quota, site data blocked). Never throws: a
 * missing fallback is not an error, it just means the regular error state shows.
 */
export function readStoredTicketsListing(eventSlug, locale) {
  if (!import.meta.client) return null;

  try {
    const raw = localStorage.getItem(fallbackKey(locale));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > FALLBACK_TTL_MS) {
      localStorage.removeItem(fallbackKey(locale));
      return null;
    }

    if (eventSlug && parsed.eventSlug && parsed.eventSlug !== eventSlug) {
      return null;
    }

    return parsed.data ?? null;
  } catch {
    return null;
  }
}

/** Counterpart to readStoredTicketsListing. Same silence on failure. */
export function storeTicketsListing(eventSlug, locale, listing) {
  if (!import.meta.client || !listing) return;

  try {
    localStorage.setItem(
      fallbackKey(locale),
      JSON.stringify({ savedAt: Date.now(), eventSlug, data: listing }),
    );
  } catch {
    // Quota exceeded or storage disabled - the fallback is optional.
  }
}

export function useTicketsListing(eventSlug) {
  const { locale } = useI18n();
  const { forceCheckout, previewToken } = useTicketsListingPreview();

  return useFetch(() => `/api/tickets/${toValue(eventSlug)}`, {
    key: () =>
      `tickets-${toValue(eventSlug)}-${locale.value}${forceCheckout.value ? "-forced" : ""}${previewToken.value ? `-preview-${previewToken.value.slice(0, 8)}` : ""}`,
    query: computed(() => ({
      locale: locale.value,
      ...(forceCheckout.value ? { force_checkout_ticket: 1 } : {}),
      ...(previewToken.value ? { preview_token: previewToken.value } : {}),
    })),
    watch: [locale, () => toValue(eventSlug)],
    dedupe: "defer",
    default: () => null,
    getCachedData: ticketsListingCachedData,
  });
}
