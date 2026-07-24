// Proxies the on-the-fly hotel reservation invoice PDF from PM One, keeping the
// API key server-side. See server/utils/streamUpstreamPdf.ts.
export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, "token") ?? "";

  return await streamUpstreamPdf(
    event,
    `/reservations/magic/${encodeURIComponent(token)}/invoice.pdf`,
    `invoice-${token}.pdf`,
  );
});
