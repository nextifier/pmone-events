import type { MaybeRefOrGetter } from "vue"
import { onBeforeUnmount, onMounted, toValue, watch } from "vue"

/**
 * Hold the page still while an overlay locks body scroll.
 *
 * `main.css` reserves the scrollbar gutter with `scrollbar-gutter: stable`, then
 * releases it again while the body is locked so a fixed overlay can cover the
 * whole viewport instead of leaving a bare strip down the right edge. That
 * release is what moves the page: on a route that never scrolls, the body is
 * one gutter narrower with the gutter reserved than without it, so opening a
 * lightbox widens everything behind it and closing it snaps back. Measured on
 * `/live-support` at 1470px: body 1459 -> 1470 -> 1459.
 *
 * reka-ui already compensates for a scrollbar it can see, and it looks at
 * `window.innerWidth - documentElement.clientWidth`. A reserved gutter does not
 * appear there - that reads 0 while the body is genuinely 11px narrower - so on
 * exactly the pages that shift, reka concludes there is nothing to do.
 *
 * Nothing here is inferred. The body's width is recorded before the lock and
 * compared after it, and whatever the release handed back is handed straight to
 * `padding-right`: a page with no gutter gets nothing, and a page whose
 * scrollbar reka already padded for gets nothing either.
 *
 * The lock is watched rather than assumed, because reka applies it in its own
 * `nextTick` and drops it while the close animation is still running - a timer
 * of our own would pad a frame too late and unpad a frame too early.
 *
 * Reference counted: overlays stack, and a dialog opened from inside a sheet
 * must not clear the padding the sheet still needs.
 *
 * Call it from a component that exists only while its overlay does - which is
 * how every overlay here renders - or pass the open state when the caller
 * outlives the overlay it owns.
 */

let holders = 0
let observer: MutationObserver | null = null
let padded = false
let widthBeforeLock = 0

function isLocked(): boolean {
  return document.body.style.overflow === "hidden"
}

function sync(): void {
  if (!isLocked()) {
    if (padded) {
      document.body.style.paddingRight = ""
      padded = false
    }

    return
  }

  if (padded || holders === 0) {
    return
  }

  // reka pads the body itself whenever it could measure a scrollbar. Its work is
  // correct where it happens; this only fills the case it cannot see.
  if (document.body.style.paddingRight) {
    return
  }

  const released = document.body.clientWidth - widthBeforeLock
  if (released > 0) {
    document.body.style.paddingRight = `${released}px`
    padded = true
  }
}

export function useScrollLockGutter(open?: MaybeRefOrGetter<boolean>): void {
  let holding = false

  function acquire(): void {
    if (holding) {
      return
    }
    holding = true
    holders++

    if (holders === 1) {
      widthBeforeLock = document.body.clientWidth
      observer = new MutationObserver(sync)
      observer.observe(document.body, { attributes: true, attributeFilter: ["style"] })
    }

    sync()
  }

  function release(): void {
    if (!holding) {
      return
    }
    holding = false
    holders = Math.max(0, holders - 1)

    if (holders > 0) {
      return
    }

    observer?.disconnect()
    observer = null

    if (padded) {
      document.body.style.paddingRight = ""
      padded = false
    }
  }

  if (open === undefined) {
    onMounted(acquire)
  } else {
    watch(() => toValue(open), (isOpen) => (isOpen ? acquire() : release()), { immediate: true })
  }

  onBeforeUnmount(release)
}
