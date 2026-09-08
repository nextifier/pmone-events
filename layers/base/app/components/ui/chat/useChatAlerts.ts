import { useVibrate } from "@vueuse/core";

/**
 * Sound and haptics for a chat surface.
 *
 * Mirrors what the check-in scanner does (`useScanSession`): preload a real
 * file, keep a synthesised fallback for when it is missing or autoplay is
 * blocked, and buzz through `useVibrate` behind its `isSupported` guard. The
 * scanner reads its files from AppSetting because staff upload their own; a
 * chat ping is not something anyone asked to customise, so it ships as a static
 * asset instead.
 *
 * Written to be reused by Live Support, which needs exactly this and will need
 * it on a surface where the message arrives without the reader doing anything.
 *
 * The default file is whatever the app ships at `public/sfx/chat-notification.mp3`;
 * a host with a different sound passes `soundSrc`.
 */
// Versioned so a replaced file is not served from a browser or edge cache under the old bytes.
const DEFAULT_SOUND_SRC = "/sfx/chat-notification.mp3?v=2";

/** Per-device, per-browser. Nothing about it belongs on the account. */
const DEFAULT_MUTE_KEY = "pmone:chat-muted";

/**
 * Module scope and keyed by source, not per-caller: several surfaces share one
 * conversation, and each building its own <audio> would mean several copies of
 * the same file and several overlapping plays for one message.
 */
const elements = new Map<string, HTMLAudioElement | null>();

function audio(src: string): HTMLAudioElement | null {
  if (import.meta.server) return null;
  if (elements.has(src)) return elements.get(src) ?? null;

  try {
    const element = new Audio(src);
    element.preload = "auto";
    // Loud enough to hear over a room, quiet enough not to startle someone
    // wearing headphones at 11pm.
    element.volume = 0.5;
    element.load();
    elements.set(src, element);
  } catch {
    elements.set(src, null);
  }

  return elements.get(src) ?? null;
}

/**
 * Last resort when the file will not play: a short, soft two-tone. Copied in
 * spirit from the scanner's `beep()`, which exists for the same reason and is
 * deliberately never removed - a silent failure is indistinguishable from a
 * chat that never answered.
 */
function synthesise() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;

    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(990, ctx.currentTime + 0.09);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);

    osc.start();
    osc.stop(ctx.currentTime + 0.18);
    osc.onended = () => ctx.close();
  } catch {
    // Audio is best-effort only.
  }
}

export interface ChatAlertOptions {
  /** Served from `public/`. Any short, quiet notification will do. */
  soundSrc?: string;
  /** localStorage key for the per-device mute. */
  storageKey?: string;
  /** `navigator.vibrate` pattern. Keep it under a tick. */
  vibration?: number[];
}

export function useChatAlerts(options: ChatAlertOptions = {}) {
  const soundSrc = options.soundSrc ?? DEFAULT_SOUND_SRC;
  const storageKey = options.storageKey ?? DEFAULT_MUTE_KEY;
  const pattern = ref<number[]>(options.vibration ?? [15]);

  const muted = useState(`chat-alerts-muted:${storageKey}`, () => false);

  // localStorage is only readable on the client, and only after hydration, so
  // the stored preference is applied once rather than read on every ping.
  onMounted(() => {
    try {
      muted.value = localStorage.getItem(storageKey) === "1";
    } catch {
      // Private mode, or site data blocked. Unmuted is the safe default.
    }
  });

  function setMuted(value: boolean) {
    muted.value = value;

    try {
      localStorage.setItem(storageKey, value ? "1" : "0");
    } catch {
      // The preference just does not survive a reload.
    }
  }

  function toggleMuted() {
    setMuted(!muted.value);
  }

  // A single 15ms tick by default. The scanner's success buzz is 35ms and is
  // meant to be felt through a lanyard at arm's length; a message arriving on a
  // phone in someone's hand needs far less.
  const { vibrate, isSupported: canVibrate } = useVibrate({ pattern });

  /**
   * Announce one new message. Muting silences the sound only - the haptic is
   * the discreet half, and is what someone who muted the tab still wants.
   */
  function ping() {
    if (!muted.value) {
      const sound = audio(soundSrc);

      if (sound) {
        try {
          sound.currentTime = 0;
          sound.play().catch(synthesise);
        } catch {
          synthesise();
        }
      } else {
        synthesise();
      }
    }

    if (!canVibrate.value) return;

    try {
      vibrate();
    } catch {
      // Best-effort.
    }
  }

  return { muted: readonly(muted), setMuted, toggleMuted, ping };
}
