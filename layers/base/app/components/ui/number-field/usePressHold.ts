import { onBeforeUnmount, ref } from "vue"

/**
 * A press that survives a scroll.
 *
 * reka's own NumberFieldIncrement/Decrement commit on `pointerdown` - the
 * instant the finger lands, before the browser can tell a tap from the first
 * frame of a scroll. On a phone that means a swipe which merely BEGINS on the
 * minus button decrements once immediately; for a ticket capped at one, that
 * silently empties the cart. reka exposes no movement threshold to opt into and
 * calls preventDefault() on that pointerdown, so the buttons have to be ours.
 * The root context it hands out is public API, so only the trigger changes -
 * every value, bound and disabled rule still comes from reka.
 *
 * The action commits on `click`, which browsers already withhold once a touch
 * turns into a scroll. MOVE_TOLERANCE closes the remaining gap on engines that
 * still deliver a click after a short drag. Press-and-hold repeat is kept, but
 * it starts only after HOLD_DELAY and dies the moment the pointer travels.
 */
const HOLD_DELAY = 400
const HOLD_INTERVAL = 60
/** Roughly a fingertip's wobble. Below this a touch is still a tap. */
const MOVE_TOLERANCE = 10

export function usePressHold(
  action: () => void,
  isDisabled: () => boolean,
  /**
   * Where focus goes once the step has been applied. reka normally does this
   * itself, but its `focusOnChange` is switched off in NumberField.vue: focusing
   * a numeric input from inside a touch activation is what raises the on-screen
   * keypad, and a stepper tap is not a request to type.
   *
   * So focus is restored for a MOUSE only - click + and you can still hold the
   * arrow keys or type over the value, exactly as before. A tap on a phone
   * leaves the keyboard down; tapping the number itself still opens it, because
   * that is a real focus on a real input.
   */
  focusTarget?: () => HTMLElement | null | undefined,
) {
  const isPressed = ref(false)

  let origin: { x: number, y: number } | null = null
  let pointerId: number | null = null
  let travelled = false
  let repeated = false
  let pointerType = ""
  let timer: ReturnType<typeof setTimeout> | undefined

  /**
   * Apply the step, then put focus back where a mouse user expects it. Anything
   * that is not a mouse - touch, pen, or a click with no pointer behind it - is
   * left alone, because those are the ones with a keyboard to raise.
   */
  const commit = () => {
    action()

    if (pointerType !== "mouse") return

    try {
      focusTarget?.()?.focus({ preventScroll: true })
    }
    catch {
      // A detached or hidden input is not worth an exception here.
    }
  }

  const stop = () => {
    if (timer) {
      clearTimeout(timer)
      timer = undefined
    }
    isPressed.value = false
  }

  const scheduleRepeat = (delay: number) => {
    timer = setTimeout(() => {
      if (travelled || isDisabled()) {
        stop()
        return
      }
      repeated = true
      commit()
      scheduleRepeat(HOLD_INTERVAL)
    }, delay)
  }

  const onPointerdown = (event: PointerEvent) => {
    if (event.button !== 0 || isDisabled()) return
    // Capture the pointer, or the guard only half works. Touch gets implicit
    // capture for free, but a mouse does not: drag off the button and neither
    // pointermove nor pointerup ever reaches this element again, so the travel
    // is never noticed and the hold timer keeps firing from under the cursor.
    // Capturing makes both input types take the same path.
    const target = event.currentTarget as Element | null
    try {
      target?.setPointerCapture?.(event.pointerId)
    }
    catch {
      // Capture is a nicety; a browser that refuses still gets the click guard.
    }
    pointerId = event.pointerId
    pointerType = event.pointerType
    origin = { x: event.clientX, y: event.clientY }
    travelled = false
    repeated = false
    isPressed.value = true
    scheduleRepeat(HOLD_DELAY)
  }

  const onPointermove = (event: PointerEvent) => {
    if (!origin || travelled) return
    if (
      Math.abs(event.clientX - origin.x) > MOVE_TOLERANCE
      || Math.abs(event.clientY - origin.y) > MOVE_TOLERANCE
    ) {
      travelled = true
      stop()
    }
  }

  const release = (event: PointerEvent) => {
    const target = event.currentTarget as Element | null
    if (pointerId !== null && target?.hasPointerCapture?.(pointerId)) {
      target.releasePointerCapture(pointerId)
    }
    pointerId = null
  }

  const onPointerup = (event: PointerEvent) => {
    release(event)
    stop()
  }

  /** The browser took the gesture over for scrolling - this was never a tap. */
  const onPointercancel = (event: PointerEvent) => {
    travelled = true
    release(event)
    stop()
  }

  const onClick = () => {
    // A hold has already applied its own steps; the trailing click would add
    // one more on top. `travelled` is reset by the next pointerdown, so a
    // cancelled gesture never poisons the tap after it.
    if (travelled || repeated || isDisabled()) return
    commit()
  }

  onBeforeUnmount(stop)

  return { isPressed, onPointerdown, onPointermove, onPointerup, onPointercancel, onClick }
}
