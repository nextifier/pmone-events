import { useEventListener, useMediaQuery } from "@vueuse/core";
import type { MaybeRefOrGetter } from "vue";

/**
 * The phone tab bar slides away while the reader scrolls down and comes back
 * on the way up, the way the admin app's does (useAppChrome there). The sticky
 * header holds still. It also steps aside while a text field has focus: the
 * viewport's `interactive-widget=resizes-content` would otherwise stand the
 * bar on top of the keyboard.
 *
 * Phones only (below lg, where BottomNav hides itself anyway).
 */

/** Near the top the bar always shows: there is nothing under it to reveal. */
const TOP_ZONE_PX = 56;

/** Distance travelled in one direction before the bar reacts, so a wobbling thumb does not flip it. */
const TRAVEL_PX = 8;

/**
 * Motion is transitions-dev 07 (panel reveal): slower in than out, the same
 * values as the admin app's bar.
 */
const BAR_HIDDEN =
  "pointer-events-none translate-y-4 opacity-0 blur-(--panel-blur) duration-(--panel-close-dur)";

export function useSiteChrome() {
  const hidden = useState<boolean>("site-chrome-hidden", () => false);

  /** The bar's hidden state, merged over its visible one through the class prop (tailwind-merge). */
  const barClass = computed(() => (hidden.value ? BAR_HIDDEN : undefined));

  return { hidden, barClass };
}

/**
 * Installed once, by the default layout. Follows the window's scroll and the
 * focused field, and mirrors the flag onto <body> as `data-chrome-hidden`,
 * which the floating button and the ticket cart bar ride down with.
 */
export function installSiteChromeScroll(enabled: MaybeRefOrGetter<boolean>): void {
  const { hidden } = useSiteChrome();
  const route = useRoute();
  const isPhone = useMediaQuery("(width < 64rem)");
  const typing = useTextEntryFocus();
  const active = computed(() => isPhone.value && toValue(enabled));

  const scrolledAway = ref(false);
  let lastY = 0;
  let travel = 0;

  function reveal(): void {
    scrolledAway.value = false;
    travel = 0;
  }

  /** A menu open in the header (language, the drawer menu) holds the bar on screen too. */
  function headerIsEngaged(): boolean {
    return (
      document.querySelector(
        "[data-site-header] [data-state='open'], [data-site-header] [aria-expanded='true']",
      ) !== null
    );
  }

  // Unthrottled on purpose: browsers already deliver scroll once per frame, and
  // a timer-based throttle drops the lone event a short flick produces.
  useEventListener(
    import.meta.client ? window : null,
    "scroll",
    () => {
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY;
      lastY = y;

      if (!active.value || y <= TOP_ZONE_PX) {
        reveal();
        return;
      }
      if (delta === 0) {
        return;
      }

      travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;

      if (travel >= TRAVEL_PX && !headerIsEngaged()) {
        scrolledAway.value = true;
      } else if (travel <= -TRAVEL_PX) {
        scrolledAway.value = false;
      }
    },
    { passive: true },
  );

  watch(() => route.path, reveal);

  watch(
    [active, scrolledAway, typing],
    () => {
      hidden.value = active.value && (scrolledAway.value || typing.value);
    },
    { immediate: true },
  );

  if (import.meta.client) {
    watch(hidden, (value) => document.body.toggleAttribute("data-chrome-hidden", value), {
      immediate: true,
    });
    onBeforeUnmount(() => document.body.removeAttribute("data-chrome-hidden"));
  }
}
