export default defineCachedEventHandler(
  async (event) => {
    const locale = (getQuery(event).locale as string) || "en";

    return await pmOneFetch("/website-pages", {
      query: { locale },
      // Short timeout: legal pages await this during SSR, so a PM One outage
      // with a cold cache must not stall renders for long.
      timeoutMs: 3000,
      errorPrefix: "Website pages fetch",
    });
  },
  {
    name: "api-website-pages",
    maxAge: 15,
    // NOT swr. A stale payload here fossilises: SSR renders the old data into
    // HTML that is then edge-cached for days. See cf-cache-rules.ts.
    swr: false,
    getKey: (event) => `l:${(getQuery(event).locale as string) || "en"}`,
  },
);
