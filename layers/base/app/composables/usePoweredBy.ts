/**
 * The vendor credit for this site's footer, or null to print nothing.
 *
 * Read at ACCESS time from the og-pages payload the awaited server plugin
 * already resolved - the same reason useOgPages consumers use useNuxtData
 * rather than capturing a ref at setup. No second request, and on a
 * prerendered page this was one build-time fetch.
 */
export function usePoweredBy() {
  return computed<{ name: string; url: string | null } | null>(() => {
    const payload = useNuxtData("og-pages").data.value as
      | { powered_by?: { name: string; url: string | null } | null }
      | null;

    return payload?.powered_by ?? null;
  });
}
