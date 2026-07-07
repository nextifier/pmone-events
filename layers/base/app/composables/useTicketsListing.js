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
  return useFetch(() => `/api/tickets/${toValue(eventSlug)}`, {
    key: () => `tickets-${toValue(eventSlug)}-${locale.value}`,
    query: { locale },
    watch: [locale, () => toValue(eventSlug)],
    dedupe: "defer",
    default: () => null,
    getCachedData: ticketsListingCachedData,
  });
}
