/**
 * Home-page visibility for the Hotels section. Delegates to
 * useHomeSection('hotels'), fed by the PM One Website Settings -> Home Page
 * group. `?show-hotel=true` force-shows the section regardless of the toggle.
 */
export function useHotelSectionVisibility() {
  return useHomeSection("hotels", { forceParam: "show-hotel" });
}
