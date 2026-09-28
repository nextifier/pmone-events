import { useEventListener, useMediaQuery } from "@vueuse/core";
import type { MaybeRefOrGetter } from "vue";
import { createScrollHideTracker, maxScrollY, scrollYOf } from "../components/ui/bottom-nav/scroll-hide";

/**
 * The phone tab bar slides away while the reader scrolls down and comes back
 * on the way up, the way the admin app's does (useAppChrome there). The sticky
 * header holds still. It also steps aside while a text field has focus: the
 * viewport's `interactive-widget=resizes-content` would otherwise stand the
 * bar on top of the keyboard.
 *
 * Phones only (below lg, where BottomNav hides itself anyway). When it hides
 * and shows is BottomNav's rule (components/ui/bottom-nav/scroll-hide.ts),
 * shared with every other bar.
 */

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
  const scrollHide = createScrollHideTracker();

  function reveal(): void {
    scrolledAway.value = false;
    scrollHide.reset();
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
      const next = scrollHide.update(scrollYOf(window), maxScrollY(window));

      if (!active.value) {
        reveal();
        return;
      }
      if (next === true && !headerIsEngaged()) {
        scrolledAway.value = true;
      } else if (next === false) {
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
