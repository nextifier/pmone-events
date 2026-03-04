/**
 * Generates Schema.org structured data (Organization, Event, FAQPage)
 * from app.config, ticket store, and FAQ store.
 *
 * Usage: call `useEventSchema()` in each app's index.vue.
 */
export function useEventSchema() {
  const config = useAppConfig();
  const siteUrl = useRuntimeConfig().public.siteUrl;
  const faq = useFAQStore();
  const ticketStore = useTicketStore();

  // --- sameAs: only active social platforms ---
  const sameAs = Object.values(config.socialLinks).map((link) => link.path);

  // --- Strip HTML tags, replacing with spaces to prevent text run-together ---
  function stripHtml(html) {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  // --- Parse date string like "May 7, 2026 10:00:00" to ISO 8601 +07:00 ---
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

  // --- Find first non-VIP ticket ---
  function getFirstTicket() {
    for (const cat of ticketStore.categories) {
      for (const ticket of cat.tickets) {
        if (!ticket.is_vip) return ticket;
      }
    }
    return null;
  }

  const { venue, city } = parseLocation(config.event.location);
  const ticket = getFirstTicket();

  // --- Organization via useSchemaOrg (proper @id/#identity linking in @graph) ---
  useSchemaOrg([
    defineOrganization({
      name: config.app.name,
      url: siteUrl,
      logo: `${siteUrl}/icons/icon-512x512.png`,
      email: config.contact.email,
      sameAs,
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: config.contact.email,
          url: siteUrl,
        },
      ],
    }),
  ]);

  // --- Build offers (ticket data with config fallback) ---
  const ticketPrice = ticket ? parsePrice(ticket.price) : undefined;
  const offers = {
    "@type": "Offer",
    url: `${siteUrl}/ticket`,
    name: config.event.offersName || `Tiket Masuk ${config.app.shortName}`,
    description: config.event.offersDescription || undefined,
    availability: "https://schema.org/InStock",
    price: ticketPrice !== undefined ? ticketPrice : "0",
    priceCurrency: "IDR",
    validFrom: toSchemaDate(
      ticket?.starts_in || config.event.startTime,
    ),
  };

  // --- Event schema (raw JSON-LD for full control over all fields) ---
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: config.event.title,
    description: config.event.description || config.event.title,
    startDate: toSchemaDate(config.event.startTime),
    endDate: toSchemaDate(config.event.endTime),
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

  // --- FAQPage schema (raw JSON-LD for Google Rich Results detection) ---
  const faqList = unref(faq.list);
  const faqSchema =
    faqList && faqList.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqList.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: stripHtml(item.a),
            },
          })),
        }
      : undefined;

  // --- Inject raw JSON-LD via useHead (bypasses @unhead/schema-org normalization) ---
  const scripts = [
    { type: "application/ld+json", innerHTML: JSON.stringify(eventSchema) },
  ];

  if (faqSchema) {
    scripts.push({
      type: "application/ld+json",
      innerHTML: JSON.stringify(faqSchema),
    });
  }

  useHead({ script: scripts });
}
