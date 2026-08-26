/**
 * Re-serve a PM One CDN image from this site's own origin.
 *
 * Only the e-ticket image needs this, and it needs it for one reason: a canvas
 * that has drawn a cross-origin image is TAINTED, and `toBlob()` on a tainted
 * canvas throws a SecurityError. `cdn.pmone.id` answers image requests happily
 * but sends no `Access-Control-Allow-Origin`, so `crossOrigin="anonymous"`
 * cannot rescue it either. Every DOM-screenshot library hits the same wall -
 * they all rasterise through a canvas in the end.
 *
 * Served from here the bytes are same-origin, the canvas stays clean, and the
 * poster can go on the ticket.
 *
 * ALLOWLISTED, deliberately. An open image proxy is an SSRF hole: it would let
 * anyone use this server to reach internal addresses and read the response. The
 * host list is exact-match, not a suffix test, so `cdn.pmone.id.evil.com` does
 * not slip through.
 */
const ALLOWED_HOSTS = new Set(["cdn.pmone.id"]);

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

/** A poster is a few hundred KB; anything far past that is not one. */
const MAX_BYTES = 8 * 1024 * 1024;

export default defineEventHandler(async (event) => {
  const raw = getQuery(event).url;
  const value = Array.isArray(raw) ? raw[0] : raw;

  if (typeof value !== "string" || value === "") {
    throw createError({ statusCode: 400, statusMessage: "Missing url" });
  }

  let target: URL;
  try {
    target = new URL(value);
  } catch {
    throw createError({ statusCode: 400, statusMessage: "Malformed url" });
  }

  if (target.protocol !== "https:" || !ALLOWED_HOSTS.has(target.hostname)) {
    throw createError({ statusCode: 403, statusMessage: "Host not allowed" });
  }

  const upstream = await fetch(target.toString(), {
    headers: { Accept: "image/*" },
  });

  if (!upstream.ok) {
    throw createError({
      statusCode: upstream.status,
      statusMessage: "Upstream image failed",
    });
  }

  const type = (upstream.headers.get("content-type") || "").split(";")[0]!.trim();

  if (!ALLOWED_TYPES.has(type)) {
    throw createError({ statusCode: 415, statusMessage: "Not an image" });
  }

  const buffer = Buffer.from(await upstream.arrayBuffer());

  if (buffer.byteLength > MAX_BYTES) {
    throw createError({ statusCode: 413, statusMessage: "Image too large" });
  }

  setHeader(event, "Content-Type", type);
  // A conversion URL carries a content hash, so the bytes behind one never
  // change. Long immutable cache, and the edge absorbs the repeat requests.
  setHeader(event, "Cache-Control", "public, max-age=31536000, immutable");

  return buffer;
});
