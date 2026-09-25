import type { H3Event } from "h3";

/**
 * The ticket holder's session on this event website.
 *
 * PM One issues the token once (a verified email code, the checkout order
 * token, or a meeting email link). It lives in an httpOnly cookie on THIS
 * site's domain, so page scripts never see it, and this server forwards it as
 * `X-Visitor-Session`. The token opens only PM One's visitor meeting routes.
 */
const COOKIE = "visitor_session";

export function visitorToken(event: H3Event): string | null {
  return getCookie(event, COOKIE) || null;
}

export function storeVisitorToken(event: H3Event, token: string, expiresAt: string): void {
  setCookie(event, COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export function clearVisitorToken(event: H3Event): void {
  deleteCookie(event, COOKIE, { path: "/" });
}

function clientHeaders(event: H3Event): Record<string, string> {
  const ip =
    getRequestHeader(event, "cf-connecting-ip") ||
    getRequestHeader(event, "x-forwarded-for")?.split(",")[0]?.trim() ||
    getRequestHeader(event, "x-real-ip") ||
    "";
  const userAgent = getRequestHeader(event, "user-agent") || "";

  return {
    ...(ip ? { "X-Forwarded-For": ip } : {}),
    ...(userAgent ? { "User-Agent": userAgent } : {}),
  };
}

/**
 * A PM One call on behalf of the signed-in visitor. Never cached. A 401 means
 * the session ended (expired, signed out elsewhere), so the stale cookie goes.
 */
export async function visitorFetch<T = any>(
  event: H3Event,
  path: string,
  opts: { method?: string; body?: any; optional?: boolean } = {},
): Promise<T> {
  setResponseHeader(event, "cache-control", "private, no-store");

  const token = visitorToken(event);

  try {
    return await pmOnePublicFetch<T>(path, {
      method: (opts.method ?? "GET") as any,
      body: opts.body,
      headers: {
        ...clientHeaders(event),
        ...(token ? { "X-Visitor-Session": token } : {}),
      },
      errorShape: "statusMessage",
      errorPrefix: "Meetings",
    });
  } catch (error: any) {
    if (error?.statusCode === 401 && token) {
      clearVisitorToken(event);
    }
    throw error;
  }
}

/** A PM One call that opens a session: the returned token goes into the cookie. */
export async function openVisitorSession(event: H3Event, path: string, body: any) {
  const res = await visitorFetch<{ data: { token: string; expires_at: string; visitor: any } }>(event, path, {
    method: "POST",
    body,
  });

  if (res?.data?.token) {
    storeVisitorToken(event, res.data.token, res.data.expires_at);
  }

  // The token never reaches the page.
  return { data: { visitor: res?.data?.visitor ?? null } };
}
