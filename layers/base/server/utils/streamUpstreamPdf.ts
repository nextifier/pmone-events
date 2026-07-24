import type { H3Event } from "h3";

/**
 * Proxy a PDF generated on the fly by PM One, keeping the API key server-side.
 *
 * The four routes that use this (ticket order invoice/receipt, hotel
 * reservation invoice/receipt) were byte-identical apart from the upstream path
 * and the filename, and none of them had a timeout — a PDF render that hangs
 * upstream would otherwise hold the Worker open with no ceiling. Rendering is
 * slower than a JSON call, hence the 30 s allowance.
 */
export async function streamUpstreamPdf(
  event: H3Event,
  upstreamPath: string,
  filename: string,
): Promise<Buffer> {
  const buffer = await pmOnePublicFetch<ArrayBuffer>(upstreamPath, {
    responseType: "arrayBuffer",
    timeoutMs: 30000,
    errorShape: "statusMessage",
    errorPrefix: "Document",
  });

  setHeader(event, "Content-Type", "application/pdf");
  setHeader(event, "Content-Disposition", `inline; filename="${filename}"`);

  return Buffer.from(buffer);
}
