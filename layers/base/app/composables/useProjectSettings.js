/**
 * Public website display settings: blog post-card toggles, ticket page tabs,
 * book-space form fields, and the Terms "last updated" date.
 *
 * These were dashboard-managed (PM One website-settings) between Jun and Aug
 * 2026 and now come straight from `app.config.ts` again, so every page that
 * reads them can be prerendered. app.config is the schema: the base layer holds
 * the defaults and each app overrides only what differs, which is why there are
 * no `??` fallback chains left here.
 *
 * NOTE: header/footer `logoClass` and `ogImage.isDarkMode` are also in
 * app.config but stay out of this composable — they are frontend-technical, not
 * editorial settings.
 */
export function useProjectSettings() {
  const { settings } = useAppConfig();

  // Format an ISO "YYYY-MM-DD" to "Month D, YYYY" without a timezone shift.
  // Falls back to the raw value if it is already a human-readable string.
  const formatTermsDate = (raw) => {
    if (!raw) return "";
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(raw));
    if (!match) return raw;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return reactive({
    get blog() {
      return settings.blog;
    },
    get ticketTabs() {
      return settings.ticket.tabs;
    },
    get bookSpaceForm() {
      return settings.bookSpaceForm;
    },
    get termsLastUpdate() {
      return formatTermsDate(settings.terms?.lastUpdate);
    },
  });
}
