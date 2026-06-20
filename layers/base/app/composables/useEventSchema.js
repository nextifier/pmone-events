/**
 * Generates Schema.org structured data (Organization, Event) from the PM One
 * active event (via useEvent), app.config, and the ticket store.
 *
 * Usage: call `useEventSchema()` in each app's index.vue.
 */
export function useEventSchema() {
  const config = useAppConfig();
  const siteUrl = useRuntimeConfig().public.siteUrl;
  const ticketStore = useTicketStore();
  const event = useEvent();
  const profile = useProjectProfile();

  // --- sameAs: social profile URLs sourced from PM One project links ---
  const sameAs = computed(() => profile.socialLinks.map((link) => link.path));

  // --- Parse a loose date string ("Mar 17, 2026 10:00:00") to ISO +07:00 ---
  function toSchemaDate(dateStr) {
    if (!dateStr) return undefined;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return undefined;
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}+07:00`;
  }

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

  // --- Parse price: "FREE" → "0", "Rp60,000" → "60000" ---
  function parsePrice(priceStr) {
    if (!priceStr) return undefined;
    if (priceStr.toUpperCase() === "FREE") return "0";
    const digits = priceStr.replace(/[^0-9]/g, "");
    return digits || undefined;
  }

  // --- Strip HTML from the rich-text event description for plain-text schema ---
  function stripHtml(html) {
    if (!html) return "";
    return String(html)
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // --- Find first non-VIP ticket ---
  function getFirstTicket() {
    for (const cat of ticketStore.categories) {
      for (const ticket of cat.tickets) {
        if (!ticket.is_vip) return ticket;
      }
    }
    return null;
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
    const ticket = getFirstTicket();
    const ticketPrice = ticket ? parsePrice(ticket.price) : undefined;
    const description = stripHtml(event.description) || event.title;

    const offers = {
      "@type": "Offer",
      url: `${siteUrl}/tickets`,
      name: `Tiket Masuk ${config.app.shortName}`,
      availability: "https://schema.org/InStock",
      price: ticketPrice !== undefined ? ticketPrice : "0",
      priceCurrency: "IDR",
      validFrom: ticket?.starts_in
        ? toSchemaDate(ticket.starts_in)
        : event.startTime || undefined,
    };

    return {
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.title,
      description,
      startDate: event.startTime || undefined,
      endDate: event.endTime || undefined,
      eventStatus: "https://schema.org/EventScheduled",
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
      image: [`${siteUrl}/icons/icon-512x512.png`],
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
