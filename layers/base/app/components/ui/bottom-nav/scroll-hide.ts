/**
 * When a bar that slides away on scroll should hide and when it should come
 * back. One rule for every bar: BottomNav's own hideOnScroll and the app chrome
 * composables that drive a bar from outside (a bar inside a wrapper, or one
 * whose hidden state other elements ride along with) all feed their scroll
 * through here.
 *
 * The bar reacts to a run of scroll in one direction, never to a single pixel,
 * so a thumb that wobbles while reading does not flicker it. Hiding asks for a
 * longer run than showing: scrolling back up is the reader reaching for
 * navigation. Near the top and at the end of the content the bar always shows,
 * since at the end there is nothing left to scroll up from.
 *
 * Not re-exported from ./index (see the note there); import this file directly.
 */
export const SCROLL_HIDE_AFTER_PX = 64;
export const SCROLL_SHOW_AFTER_PX = 32;
export const SCROLL_TOP_ZONE_PX = 56;
export const SCROLL_END_ZONE_PX = 8;

export interface ScrollHideTracker {
  /**
   * Feeds one scroll position of a container whose furthest position is
   * `maxY`. Returns true to hide, false to show, null to leave the bar as it is.
   */
  update: (y: number, maxY: number) => boolean | null;
  /** Forgets the current run, for a route change or a bar switched back on. */
  reset: () => void;
}

export function createScrollHideTracker(): ScrollHideTracker {
  let lastY = 0;
  let run = 0;

  return {
    update(y, maxY) {
      const delta = y - lastY;
      lastY = y;

      if (y <= SCROLL_TOP_ZONE_PX || y >= maxY - SCROLL_END_ZONE_PX) {
        run = 0;
        return false;
      }
      if (delta === 0) {
        return null;
      }

      run = Math.sign(delta) === Math.sign(run) ? run + delta : delta;

      if (run >= SCROLL_HIDE_AFTER_PX) {
        return true;
      }
      if (run <= -SCROLL_SHOW_AFTER_PX) {
        return false;
      }
      return null;
    },
    reset() {
      run = 0;
    },
  };
}

/** The furthest a window or an element can scroll. */
export function maxScrollY(source: HTMLElement | Window): number {
  if (source instanceof Window) {
    return document.documentElement.scrollHeight - source.innerHeight;
  }
  return source.scrollHeight - source.clientHeight;
}

/** The current scroll position of a window or an element. */
export function scrollYOf(source: HTMLElement | Window): number {
  return Math.max(0, source instanceof Window ? source.scrollY : source.scrollTop);
}
