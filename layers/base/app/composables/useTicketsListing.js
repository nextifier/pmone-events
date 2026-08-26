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

  // Staff preview: `?force-checkout-ticket` also lists tickets whose Active
  // toggle is off, so production checkout can be smoke-tested before sales
  // open. Distinct data key, so a forced payload is never reused for a public
  // visitor after client-side navigation.
  const forceCheckout = useForceShow("force-checkout-ticket");
  // `?preview-token=` is what actually unlocks checkout now, and it can pin a
  // price phase so a paid phase can be rehearsed while a free one is selling.
  const previewToken = usePreviewToken();

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
