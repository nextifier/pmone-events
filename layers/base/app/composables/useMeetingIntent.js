/**
 * A meeting the visitor was about to request when they found out they needed
 * a ticket. Kept in sessionStorage (this tab only, gone when it closes) so the
 * checkout result page can offer to finish it.
 */
const KEY = "pmone:meeting-intent";
const MAX_AGE_MS = 1000 * 60 * 60 * 3;

export function useMeetingIntent() {
  function save(intent) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ ...intent, saved_at: Date.now() }));
    } catch {
      // Private mode or storage full: the visitor just picks the time again.
    }
  }

  function read() {
    try {
      const intent = JSON.parse(sessionStorage.getItem(KEY) || "null");
      if (!intent || Date.now() - intent.saved_at > MAX_AGE_MS) return null;
      return intent;
    } catch {
      return null;
    }
  }

  function clear() {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      // nothing to clear
    }
  }

  return { save, read, clear };
}
