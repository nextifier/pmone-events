export default defineCachedEventHandler(
  async () => {
    return pmOneFetch("/editions", {
      errorPrefix: "Fetch editions",
    });
  },
  {
    name: "api-editions",
    maxAge: 15,
    // NOT swr. A stale payload here fossilises: SSR renders the old data into
    // HTML that is then edge-cached for days. See cf-cache-rules.ts.
    swr: false,
    getKey: () => "default",
  },
);
