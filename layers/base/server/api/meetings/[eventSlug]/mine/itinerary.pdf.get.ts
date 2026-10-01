/**
 * The signed-in visitor's meeting itinerary as a PDF, rendered by PM One in
 * the language the site is showing. The API key and the visitor session stay
 * server-side, as for every other meetings call (see utils/visitorSession.ts).
 */
export default defineEventHandler(async (event) => {
  setResponseHeader(event, "cache-control", "private, no-store");

  const token = visitorToken(event);
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: "Sign in to download your itinerary" });
  }

  const slug = encodeURIComponent(getRouterParam(event, "eventSlug") ?? "");
  const locale = String(getQuery(event).locale ?? "").replace(/[^a-z-]/gi, "").slice(0, 8);

  try {
    const buffer = await pmOnePublicFetch<ArrayBuffer>(
      `/events/${slug}/me/meetings/itinerary${locale ? `?locale=${locale}` : ""}`,
      {
        responseType: "arrayBuffer",
        timeoutMs: 30000,
        headers: { ...clientHeaders(event), "X-Visitor-Session": token },
        errorShape: "statusMessage",
        errorPrefix: "Itinerary",
      },
    );

    setHeader(event, "Content-Type", "application/pdf");
    setHeader(event, "Content-Disposition", `attachment; filename="itinerary-${slug}.pdf"`);

    return Buffer.from(buffer);
  } catch (error: any) {
    if (error?.statusCode === 401) {
      clearVisitorToken(event);
    }
    throw error;
  }
});
