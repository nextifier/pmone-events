// Proxies the on-the-fly ticket order receipt PDF from PM One, keeping the API
// key server-side. See server/utils/streamUpstreamPdf.ts.
export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, "token") ?? "";

  return await streamUpstreamPdf(
    event,
    `/ticket-orders/magic/${encodeURIComponent(token)}/receipt.pdf`,
    `receipt-${token}.pdf`,
  );
});
