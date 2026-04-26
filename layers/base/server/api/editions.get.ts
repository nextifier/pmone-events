export default defineEventHandler(async () => {
  return pmOneFetch("/editions", {
    errorPrefix: "Fetch editions",
  });
});
