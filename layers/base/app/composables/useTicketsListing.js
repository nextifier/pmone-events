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

export function useTicketsListing(eventSlug) {
  const { locale } = useI18n();
  const cart = useTicketCartStore();

  // Staff preview: `?force-checkout-ticket` also lists tickets whose Active
  // toggle is off, so production checkout can be smoke-tested before sales
  // open. Distinct data key, so a forced payload is never reused for a public
  // visitor after client-side navigation.
  const urlForceCheckout = useForceShow("force-checkout-ticket");
  // `?preview-token=` is what actually unlocks checkout now, and it can pin a
  // price phase so a paid phase can be rehearsed while a free one is selling.
  const urlPreviewToken = usePreviewToken();

  // The URL is where a staff preview STARTS, not where it lives. /tickets/checkout
  // is a separate route reached by navigation, so its own query string carries
  // neither the flag nor the token - which is exactly why the cart persists both.
  //
  // Reading the URL alone made the checkout page fetch the PUBLIC listing while
  // its pricing and its order submit used the pinned one. The listing then
  // reported the caps of the phase that is LIVE rather than the phase being
  // rehearsed, and `reconcile()` culled every cart line those caps disallowed:
  // three day passes bought under an uncapped phase arrived at checkout as one,
  // with "Some tickets are no longer available".
  //
  // The cart is a client-only source (it hydrates from localStorage on mount),
  // so on the server both fall back to the URL and SSR is unchanged.
  const forceCheckout = computed(
    () => urlForceCheckout.value || cart.forceCheckout === true,
  );
  const previewToken = computed(
    () => urlPreviewToken.value ?? cart.previewToken ?? null,
  );

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
