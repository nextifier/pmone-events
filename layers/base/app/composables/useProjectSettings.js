/**
 * Public website display settings sourced from PM One
 * (`/api/event/website-settings` -> project `settings.website_settings`) instead
 * of each app's hardcoded `app.config.ts` `settings` object. Covers the
 * display/content settings: blog post-card toggles, ticket page tabs, book-space
 * form fields, and the Terms "last updated" date.
 *
 * Uses `server: true` so the values are present during SSR (these drive rendered
 * page content, unlike `useWebsiteSettings`'s `server: false` visibility flags).
 * Getters fall back to the base app.config defaults, so a project that has never
 * saved these renders identically to before the migration.
 *
 * NOTE: header/footer `logoClass`, `ogImage.isDarkMode` and `tiktokPixelId` stay
 * in app.config by design (frontend-technical / pre-hydration), so they are not
 * exposed here.
 */
export function useProjectSettings() {
  const { data } = useFetch("/api/event/website-settings", {
    key: "project-settings",
    server: true,
    default: () => null,
  });

  const settings = () => data.value?.data?.settings ?? null;
  const blog = () => settings()?.blog ?? {};
  const ticket = () => settings()?.ticket_tabs ?? {};
  const book = () => settings()?.book_space_form ?? {};

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
    get _raw() {
      return settings();
    },
    get blog() {
      const b = blog();
      return {
        showPostCardAuthor: b.show_post_card_author ?? false,
        showPostCardExcerpt: b.show_post_card_excerpt ?? false,
      };
    },
    get ticketTabs() {
      const t = ticket();
      return {
        showTickets: t.show_tickets ?? true,
        showGuests: t.show_guests ?? false,
        showBrands: t.show_brands ?? true,
        showRundown: t.show_rundown ?? true,
        showAbout: t.show_about ?? true,
        showPhotos: t.show_photos ?? true,
      };
    },
    get bookSpaceForm() {
      const f = book();
      return {
        showJobTitle: f.show_job_title ?? false,
        showBrandName: f.show_brand_name ?? true,
        showProducts: f.show_products ?? false,
      };
    },
    get termsLastUpdate() {
      return formatTermsDate(settings()?.terms?.last_update);
    },
  });
}
