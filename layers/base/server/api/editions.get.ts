export default defineCachedEventHandler(
  async () => {
    return pmOneFetch("/editions", {
      errorPrefix: "Fetch editions",
    });
  },
  {
    name: "api-editions",
    maxAge: 15,
    swr: true,
    getKey: () => "default",
  },
);
