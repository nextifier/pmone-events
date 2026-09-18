import { loadVisitorId } from "../components/ui/public-form/core.js";

const STORAGE_KEY = "pmone.browserId";

let pending: Promise<string | null> | null = null;

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function store(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Storage disabled or full: the computed id still goes out this time.
  }
}

/**
 * The browser's id for an invitation code limited to one use per browser. It
 * rides along on the validate call and on the order.
 *
 * The first FingerprintJS visitor id a browser produces is kept and reused.
 * The open-source visitor id folds in the screen frame and resolution, so the
 * same browser got a new id just by opening in another window, with the Dock
 * moved, or on a second monitor, and the per-browser cap let it through. The
 * stored copy survives all of that; clearing site data falls back to a fresh
 * fingerprint, which comes out the same as long as the screen setup has not
 * changed.
 *
 * Resolves to null when the library cannot load; the server then skips the
 * browser check the way the Form Builder does, and a failure is not cached so
 * the next call gets another try.
 */
export function getBrowserFingerprint(): Promise<string | null> {
  if (!import.meta.client) return Promise.resolve(null);

  pending ??= (async () => {
    const stored = readStored();
    if (stored) return stored;

    const id: string | null = await loadVisitorId();
    if (id) {
      store(id);
      return id;
    }

    pending = null;
    return null;
  })();

  return pending;
}
