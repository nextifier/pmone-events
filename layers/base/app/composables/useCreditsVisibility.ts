/**
 * Home-page visibility for the Credits (Partners) section. Delegates to
 * useHomeSection('partners'), fed by the PM One Website Settings -> Home Page
 * group (the toggle is keyed `partners` for backward compatibility).
 *
 * The empty-state guard lives in Credits.vue itself (`v-if="partners.length"`),
 * and the server-side previous-event fallback borrows partners from the most
 * recent prior event, so this composable only needs the toggle — no partners
 * re-fetch here. `?show-partners=true` force-shows the section.
 */
export function useCreditsVisibility() {
  return useHomeSection("partners", { forceParam: "show-partners" });
}
