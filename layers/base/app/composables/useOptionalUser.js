/**
 * No-op variant for the public pmone-events event sites, which have no login
 * system. Always resolves to a null user, so the hotel booking flow simply
 * skips guest prefill and the visitor fills the form manually.
 *
 * The pmone admin app ships a Sanctum-backed variant of this composable — by
 * keeping the call site identical, the hotel booking pages and components stay
 * byte-identical and copy-paste maintainable across both repositories.
 */
export const useOptionalUser = () => {
  return { user: ref(null) };
};
