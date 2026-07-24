export default defineCachedEventHandler(
  async () => {
    return await pmOneFetch("", { errorPrefix: "Project profile fetch" });
  },
  {
    name: "api-project-profile",
    maxAge: 15,
    // NOT swr. A stale payload here fossilises: SSR renders the old data into
    // HTML that is then edge-cached for days. See cf-cache-rules.ts.
    swr: false,
    getKey: () => "default",
  },
);
