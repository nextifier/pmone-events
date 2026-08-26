import type { H3Event } from "h3";

/**
 * Admin bypass flags, forwarded verbatim to PM One.
 *
 * The public pages carry a dash-cased param the browser can see
 * (`?force-show-brands`); the API takes the snake_cased twin
 * (`force_show_brands=1`). Keeping the two spellings distinct means a link
 * pasted into a browser and a request arriving at PM One are never confused
 * for one another in logs.
 *
 * Truthiness matches `useForceShow()` on the client: a bare param, `=1` and
 * `=true` are all on; anything else (including `=0`) is off.
 *
 * Returns a spreadable object so call sites read as
 * `query: { locale, ...adminPreviewFlag(event, "force_show_brands") }` and the
 * key is simply absent when not forced - which matters, because an always-present
 * key would fragment PM One's response cache on every ordinary request.
 */
export function adminPreviewFlag(
  event: H3Event,
  param: string,
): Record<string, string> {
  const raw = getQuery(event)[param];

  if (raw === undefined) return {};

  const value = Array.isArray(raw) ? raw[0] : raw;

  // Present with no value at all - the shape a hand-typed `?force_show_brands`
  // arrives as. Matches useForceShow() on the client.
  if (value === null || value === "") return { [param]: "1" };

  const normalized = String(value).trim().toLowerCase();

  return normalized === "true" || normalized === "1" ? { [param]: "1" } : {};
}

/** Whether the request carries a truthy bypass flag, without building a query. */
export function hasAdminPreviewFlag(event: H3Event, param: string): boolean {
  return adminPreviewFlag(event, param)[param] !== undefined;
}

/**
 * The staff checkout-preview token, forwarded verbatim.
 *
 * Separate from adminPreviewFlag() because this one carries a VALUE rather than
 * a truthiness: it is a short-lived key minted by an authenticated staff
 * request, and PM One will not unlock checkout without it. The flag helpers
 * above stay for the display-only bypasses, which are deliberately guessable.
 *
 * Absent when there is no token, for the same cache-fragmentation reason.
 */
export function previewTokenQuery(event: H3Event): Record<string, string> {
  const raw = getQuery(event)["preview_token"];
  const value = Array.isArray(raw) ? raw[0] : raw;

  if (typeof value !== "string" || value.trim() === "") return {};

  return { preview_token: value.trim() };
}
