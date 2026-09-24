import type Echo from "laravel-echo";
import { onMounted, onScopeDispose, toValue, watch, type MaybeRefOrGetter } from "vue";

/**
 * Hears the scan that redeems a QR while it is on screen, so the e-ticket can
 * turn to its checked-in state as the gate beeps.
 *
 * It is a nicety, and a crowd holds these pages open at the door, so every
 * rule here is about never costing the API anything:
 *
 * - Public channels only. Subscribing needs no /broadcasting/auth request, so
 *   connecting and reconnecting never reach PHP. The API hands out the channel
 *   (`attendee.live`) and withholds it when there is nothing to wait for.
 * - No polling, ever, and no refetch on reconnect. A missed change shows the
 *   next time the page loads, exactly as before this existed.
 * - The socket lives only while the page is visible and a seat is waiting. A
 *   hidden tab disconnects; a scanned seat is let go after a short grace (long
 *   enough for staff to undo a mistaken check-in and have it show).
 * - An unreachable server gets pusher-js's first round of attempts (two, over
 *   about ten seconds), then silence until the tab is shown again. Left alone,
 *   pusher-js keeps retrying every 15-30 s forever, and a crowd of open pages
 *   would knock on nginx all through an outage. A full server (Reverb's
 *   connection cap, code 4004) is retried every 45-60 s while visible, since a
 *   slot frees up as soon as someone who got in puts their phone away.
 *
 * One socket per page, shared by every seat on it; channels are refcounted.
 */

export interface TicketLiveConfig {
  channel: string;
  key: string;
  host: string;
  port: number;
  scheme: string;
}

export interface TicketLiveState {
  is_checked_in: boolean;
  checked_in_at: string | null;
  /** False for a check-in announced minutes late (an offline scanner syncing). */
  recent: boolean;
}

type Listener = (state: TicketLiveState) => void;

interface ChannelEntry {
  listeners: Set<Listener>;
  retired: boolean;
  grace: ReturnType<typeof setTimeout> | null;
}

const EVENT = ".check-in.changed";
const GRACE_AFTER_SCAN_MS = 60_000;
const FULL_RETRY_MS = 45_000;
const FULL_RETRY_JITTER_MS = 15_000;
const OVER_CAPACITY = 4004;

let echo: Echo<"reverb"> | null = null;
let booting: Promise<Echo<"reverb"> | null> | null = null;
let gaveUp = false;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
const channels = new Map<string, ChannelEntry>();

function pusher(): any {
  return (echo as any)?.connector?.pusher ?? null;
}

function isVisible(): boolean {
  return document.visibilityState === "visible";
}

function hasWaitingSeat(): boolean {
  for (const entry of channels.values()) {
    if (!entry.retired && entry.listeners.size) return true;
  }

  return false;
}

function disconnect(): void {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }

  pusher()?.disconnect();
}

function connectIfWanted(): void {
  if (!echo || gaveUp || !isVisible() || !hasWaitingSeat()) return;

  const state = pusher()?.connection?.state;
  if (state === "connected" || state === "connecting") return;

  pusher()?.connect();
}

function scheduleRetryWhenFull(): void {
  if (retryTimer) return;

  retryTimer = setTimeout(
    () => {
      retryTimer = null;
      connectIfWanted();
    },
    FULL_RETRY_MS + Math.random() * FULL_RETRY_JITTER_MS,
  );
}

function onVisibilityChange(): void {
  if (isVisible()) {
    gaveUp = false;
    connectIfWanted();
  } else {
    disconnect();
  }
}

async function boot(config: TicketLiveConfig): Promise<Echo<"reverb"> | null> {
  if (echo) return echo;

  booting ??= (async () => {
    try {
      const [{ default: EchoClass }, { default: Pusher }] = await Promise.all([
        import("laravel-echo"),
        import("pusher-js"),
      ]);

      const instance = new EchoClass({
        broadcaster: "reverb",
        key: config.key,
        wsHost: config.host,
        wsPort: config.port,
        wssPort: config.port,
        forceTLS: config.scheme === "https",
        enabledTransports: ["ws", "wss"],
        disableStats: true,
        Pusher,
      } as any) as Echo<"reverb">;

      echo = instance;

      const connection = pusher()?.connection;

      // `unavailable` is entered once, after the first round of attempts, and
      // pusher-js then retries inside that state without another state_change -
      // so this is the one moment to stop it.
      connection?.bind("state_change", ({ current }: { current: string }) => {
        if (current === "unavailable" || current === "failed") {
          gaveUp = true;
          disconnect();
        }
      });

      connection?.bind("error", (event: any) => {
        if (event?.error?.data?.code === OVER_CAPACITY) {
          scheduleRetryWhenFull();
        }
      });

      document.addEventListener("visibilitychange", onVisibilityChange);

      // Created while the tab was already hidden: pusher-js connected on
      // construction, so give the slot back until the page is looked at.
      if (!isVisible()) disconnect();

      return instance;
    } catch {
      return null;
    }
  })();

  return booting;
}

function dispatch(name: string, state: TicketLiveState): void {
  const entry = channels.get(name);
  if (!entry) return;

  if (entry.grace) {
    clearTimeout(entry.grace);
    entry.grace = null;
  }

  if (state.is_checked_in) {
    // The subtlest tick that still registers: the same 12 ms the success
    // toast uses (ui/sonner/feedback.ts). Browsers drop it silently unless the
    // visitor has touched the page since it loaded (sticky user activation),
    // and iOS Safari has no vibration at all.
    if (state.recent && isVisible()) navigator.vibrate?.(12);

    entry.grace = setTimeout(() => retire(name), GRACE_AFTER_SCAN_MS);
  }

  for (const listener of entry.listeners) listener(state);
}

function retire(name: string): void {
  const entry = channels.get(name);
  if (!entry || entry.retired) return;

  entry.retired = true;
  entry.grace = null;
  echo?.leave(name);

  if (!hasWaitingSeat()) disconnect();
}

async function subscribe(config: TicketLiveConfig, listener: Listener): Promise<void> {
  const existing = channels.get(config.channel);

  if (existing) {
    existing.listeners.add(listener);
    return;
  }

  channels.set(config.channel, { listeners: new Set([listener]), retired: false, grace: null });

  const instance = await boot(config);
  const entry = channels.get(config.channel);

  // Gone while the client loaded, or the client never loaded.
  if (!instance || !entry || !entry.listeners.size) return;

  instance.channel(config.channel).listen(EVENT, (state: TicketLiveState) => dispatch(config.channel, state));
  connectIfWanted();
}

function unsubscribe(name: string, listener: Listener): void {
  const entry = channels.get(name);
  if (!entry) return;

  entry.listeners.delete(listener);
  if (entry.listeners.size) return;

  if (entry.grace) clearTimeout(entry.grace);
  channels.delete(name);

  if (!entry.retired) echo?.leave(name);
  if (!hasWaitingSeat()) disconnect();
}

/**
 * Listen for the seats in `seats` (each an attendee's `live`, null when there
 * is nothing to wait for) for as long as the calling scope lives. `onChange`
 * gets the channel and the new state; match it back with `live.channel`.
 */
export function useTicketLiveStatus(
  seats: MaybeRefOrGetter<Array<TicketLiveConfig | null | undefined>>,
  onChange: (channel: string, state: TicketLiveState) => void,
): void {
  if (import.meta.server) return;

  const active = new Map<string, Listener>();

  const sync = (configs: Array<TicketLiveConfig | null | undefined>) => {
    try {
      const wanted = new Map<string, TicketLiveConfig>();
      for (const config of configs) {
        if (config?.channel) wanted.set(config.channel, config);
      }

      for (const [name, listener] of active) {
        if (!wanted.has(name)) {
          unsubscribe(name, listener);
          active.delete(name);
        }
      }

      for (const [name, config] of wanted) {
        if (active.has(name)) continue;

        const listener: Listener = (state) => onChange(name, state);
        active.set(name, listener);
        void subscribe(config, listener);
      }
    } catch {
      // Live status is a nicety; the page already shows the server's answer.
    }
  };

  onMounted(() => {
    watch(() => toValue(seats), sync, { immediate: true });
  });

  onScopeDispose(() => {
    for (const [name, listener] of active) unsubscribe(name, listener);
    active.clear();
  });
}

/**
 * The attendee list with the seat on `channel` updated, as new objects: the
 * pages hold their payload in Nuxt's shallow `data` ref, so an in-place write
 * would never render. `checked_in_recent` tells the QR whether to celebrate.
 */
export function applyTicketLiveState<T extends { live?: TicketLiveConfig | null }>(
  attendees: T[],
  channel: string,
  state: TicketLiveState,
): T[] {
  return attendees.map((attendee) =>
    attendee.live?.channel === channel
      ? {
          ...attendee,
          is_checked_in: state.is_checked_in,
          checked_in_at: state.checked_in_at,
          checked_in_recent: state.recent,
        }
      : attendee,
  );
}
