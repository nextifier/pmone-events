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
const TRUTHY = new Set(["", "1", "true"]);

export function adminPreviewFlag(
  event: H3Event,
  param: string,
): Record<string, string> {
  const raw = getQuery(event)[param];
  const value = Array.isArray(raw) ? raw[0] : raw;

  if (value === undefined || value === null) return {};

  return TRUTHY.has(String(value)) ? { [param]: "1" } : {};
}

/** Whether the request carries a truthy bypass flag, without building a query. */
export function hasAdminPreviewFlag(event: H3Event, param: string): boolean {
  return adminPreviewFlag(event, param)[param] !== undefined;
}
