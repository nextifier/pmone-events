/**
 * The ticket holder signed in on this event website, for meetings.
 *
 * The session itself is an httpOnly cookie the site's server holds; the page
 * only ever sees who is signed in and what their ticket allows. State is
 * shared across components with useState and loaded in the browser only.
 */
export function useVisitorSession() {
  const visitor = useState("visitor-session", () => null);
  const loaded = useState("visitor-session-loaded", () => false);
  const event = useEvent();

  async function load(eventSlug = event.slug, { force = false } = {}) {
    if (!eventSlug || (loaded.value && !force)) return visitor.value;
    try {
      const res = await $fetch(`/api/visitor/${eventSlug}/session`);
      visitor.value = res?.data ?? null;
    } catch {
      visitor.value = null;
    } finally {
      loaded.value = true;
    }
    return visitor.value;
  }

  /** Ask for a code. Resolves to the API's answer: code_sent, no_ticket or ticket_not_eligible. */
  async function sendCode(eventSlug, email) {
    const res = await $fetch(`/api/visitor/${eventSlug}/code`, { method: "POST", body: { email } });
    return res?.data ?? null;
  }

  async function verify(eventSlug, email, code) {
    const res = await $fetch(`/api/visitor/${eventSlug}/verify`, { method: "POST", body: { email, code } });
    visitor.value = res?.data?.visitor ?? null;
    loaded.value = true;
    return visitor.value;
  }

  /** Sign in with the checkout order token or a meeting email's link token. */
  async function exchange(eventSlug, payload) {
    const res = await $fetch(`/api/visitor/${eventSlug}/exchange`, { method: "POST", body: payload });
    visitor.value = res?.data?.visitor ?? null;
    loaded.value = true;
    return visitor.value;
  }

  async function signOut() {
    try {
      await $fetch("/api/visitor/session", { method: "DELETE" });
    } finally {
      visitor.value = null;
    }
  }

  return { visitor, loaded, load, sendCode, verify, exchange, signOut };
}
