/**
 * The handle that lets the layout-level cart bar drive the checkout page.
 *
 * The bar lives in `app.vue` so it survives the /tickets -> /tickets/checkout
 * navigation instead of unmounting and remounting. That puts it outside the page
 * tree, so it cannot reach `checkout.vue`'s `submit()` directly.
 *
 * The action crosses that gap as a COUNTER, not a callback: `useState` is
 * serialized into the SSR payload by devalue, which throws "Cannot stringify a
 * function" the moment a handler is stored here. The host increments
 * `primaryRequests`; the page watches it and runs its own submit.
 */
const EMPTY = () => ({
  /** True while /tickets/checkout is mounted. The host falls back to `select` mode when false. */
  active: false,
  ctaLabel: "",
  ctaIcon: "hugeicons:credit-card",
  ctaDisabled: false,
  submitting: false,
  /** Bumped by the host when the bar's CTA is pressed in pay mode. */
  primaryRequests: 0,
});

export function useTicketCheckoutBar() {
  return useState("ticket-checkout-bar", EMPTY);
}

/** Publish the page's current CTA state without disturbing `primaryRequests`. */
export function publishTicketCheckoutBar(fields) {
  const state = useTicketCheckoutBar();
  state.value = { ...state.value, ...fields, active: true };
}

/** Ask the page to run its submit. Called by the host, watched by the page. */
export function requestTicketCheckoutPrimary() {
  const state = useTicketCheckoutBar();
  state.value = {
    ...state.value,
    primaryRequests: state.value.primaryRequests + 1,
  };
}

/** Reset to the shape the host treats as "no checkout page mounted". */
export function clearTicketCheckoutBar() {
  const state = useTicketCheckoutBar();
  // primaryRequests is deliberately carried over: zeroing it would look like a
  // fresh request to the next page instance that starts watching it.
  state.value = { ...EMPTY(), primaryRequests: state.value.primaryRequests };
}
