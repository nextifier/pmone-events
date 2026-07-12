/**
 * Generates Schema.org structured data (Organization, Event) from the PM One
 * active event (via useEvent) and app.config.
 *
 * Usage: call `useEventSchema()` in each app's index.vue.
 */
export function useEventSchema() {
  const config = useAppConfig();
  const siteUrl = useRuntimeConfig().public.siteUrl;
  const event = useEvent();
  const profile = useProjectProfile();

  // --- sameAs: social profile URLs sourced from PM One project links ---
  const sameAs = computed(() => profile.socialLinks.map((link) => link.path));

  // --- Parse location "Venue, City" → { venue, city } ---
  function parseLocation(locationStr) {
    if (!locationStr) return { venue: "", city: "" };
    const lastComma = locationStr.lastIndexOf(",");
    if (lastComma === -1) return { venue: locationStr.trim(), city: "" };
    return {
      venue: locationStr.slice(0, lastComma).trim(),
      city: locationStr.slice(lastComma + 1).trim(),
    };
  }

  // --- Strip HTML from the rich-text event description for plain-text schema ---
  function stripHtml(html) {
    if (!html) return "";
    return String(html)
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // --- Organization via useSchemaOrg (proper @id/#identity linking in @graph) ---
  useSchemaOrg([
    defineOrganization({
      name: config.app.name,
      url: siteUrl,
      logo: `${siteUrl}/icons/icon-512x512.png`,
      email: profile.email,
      sameAs,
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: profile.email,
          url: siteUrl,
        },
      ],
    }),
  ]);

  // --- Event schema (raw JSON-LD for full control over all fields) ---
  const eventSchema = computed(() => {
    const { venue, city } = parseLocation(event.location);
    const description = stripHtml(event.description) || event.title;

    const offers = {
      "@type": "Offer",
      url: `${siteUrl}/tickets`,
      name: `Tiket Masuk ${config.app.shortName}`,
      availability: "https://schema.org/InStock",
      priceCurrency: "IDR",
      validFrom: event.startTime || undefined,
      // NOTE (plan 030): the lowest ticket price isn't wired in here because
      // it requires an extra SSR fetch (`useTicketsListing`) on every event
      // homepage purely for schema enrichment - real TTFB cost for a "nice
      // to have" rich-result field, and per-event `tickets_enabled` toggles
      // make the failure modes non-trivial. Left as a follow-up; the offer
      // still carries a valid url/currency/validFrom.
    };

    // Event.image wants a real event photo, not the site logo. The poster
    // (EventResource.poster_image, exposed via useEvent().poster) is an
    // absolute Spatie media URL when present; fall back to the logo only
    // when no poster has been uploaded.
    const image = event.poster || `${siteUrl}/icons/icon-512x512.png`;

    return {
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.title,
      description,
      startDate: event.startTime || undefined,
      endDate: event.endTime || undefined,
      // The Event model only tracks a draft/published workflow status
      // (App\Models\Event::$status) - there is no cancelled/postponed/
      // rescheduled flag to derive a dynamic eventStatus from, so this stays
      // hardcoded to EventScheduled (audited in plan 030, not an oversight).
      eventStatus: "https://schema.org/EventScheduled",
      // Likewise there is no online/hybrid attendance flag on the Event
      // model; every event here is a physical trade show, so this stays
      // hardcoded to OfflineEventAttendanceMode.
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: venue,
        address: {
          "@type": "PostalAddress",
          streetAddress: venue,
          addressLocality: city,
          addressCountry: "ID",
        },
      },
      image: [image],
      organizer: {
        "@type": "Organization",
        "@id": `${siteUrl}/#identity`,
        name: config.app.name,
        url: siteUrl,
      },
      performer: {
        "@type": "Organization",
        name: config.app.name,
        url: siteUrl,
      },
      offers,
    };
  });

  // --- Inject raw JSON-LD via useHead (bypasses @unhead/schema-org normalization) ---
  // FAQPage schema is emitted by <FAQ /> on the /faq page from the PM One API
  // data, so it is not duplicated here.
  useHead(() => ({
    script: [
      { type: "application/ld+json", innerHTML: JSON.stringify(eventSchema.value) },
    ],
  }));
}
