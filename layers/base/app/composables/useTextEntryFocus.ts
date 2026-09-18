import { useEventListener } from "@vueuse/core";

/**
 * A field the on-screen keyboard would cover. A quantity stepper is not one:
 * reka marks it `role="spinbutton"` and focuses it on every +/- press, so
 * counting it as typing tore the cart bar down and rebuilt it on each tap - the
 * panel blinked shut and back open under the buyer's thumb. The role, rather
 * than "is it inside the bar", because the checkout aside has the same stepper
 * and the same tap must not move the bar there either.
 */
function isTextEntry(el: Element | null): boolean {
  return (
    !!el &&
    el.getAttribute("role") !== "spinbutton" &&
    (el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA" ||
      (el as HTMLElement).isContentEditable === true)
  );
}

/**
 * Whether a text field has focus, i.e. whether the software keyboard is up.
 * Fixed bottom bars read it to step out of the way: the viewport's
 * `interactive-widget=resizes-content` lifts anything anchored to the bottom
 * edge onto the keyboard. Rather than measure `visualViewport` (which reports
 * late on iOS and lands after paint), follow focus.
 *
 * The listeners are attached unconditionally; callers gate on the flag. The
 * cart bar is mounted once in app.vue and lives across /tickets ->
 * /tickets/checkout, and an early return while its prop was still false left
 * the listeners off for the rest of the session.
 */
export function useTextEntryFocus() {
  const typing = ref(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  function onFocusChange(): void {
    if (timer) clearTimeout(timer);
    // Debounced so tabbing from one field to the next does not flash the bar.
    timer = setTimeout(() => {
      typing.value = isTextEntry(document.activeElement);
    }, 80);
  }

  if (import.meta.client) {
    useEventListener(document, "focusin", onFocusChange);
    useEventListener(document, "focusout", onFocusChange);
  }

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer);
  });

  return typing;
}
