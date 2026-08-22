import { defineStore } from "pinia";

const STORAGE_KEY = "pmone.ticketCart.v1";
const TTL_MS = 24 * 60 * 60 * 1000;

const defaultState = () => ({
  eventId: null,
  eventSlug: null,
  // items: [{ ticket_id, qty, ticket_session_id }]
  items: [],
  // An applied access code (unlocks gated tickets + optional price effect).
  accessCode: null,
  // Staff preview mode, set from `?force-checkout-ticket` on the tickets page.
  // Persisted because /tickets/checkout is a separate route that the buyer
  // reaches by navigation, so the flag has to survive the hop (and a reload).
  forceCheckout: false,
});

function loadFromStorage() {
  if (!import.meta.client) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function saveToStorage(data) {
  if (!import.meta.client) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // quota exceeded or disabled — ignore
  }
}

let persistTimer = null;
function persistDebounced(state) {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => saveToStorage(state), 300);
}

export function lineKey(ticketId, sessionId, dayId) {
  return `${ticketId}:${sessionId ?? ""}:${dayId ?? ""}`;
}

export const useTicketCartStore = defineStore("ticketCart", {
  state: () => ({
    ...defaultState(),
    hydrated: false,
    // Cached pricing from the last /preview call, for display.
    cachedSubtotal: 0,
    cachedDiscount: 0,
    cachedTotal: 0,
    // { code, discount } when a promo applied, { error_code, message } on failure.
    promoInfo: null,
    // { code, unlocks, price_effect, discount } from the last preview, or error.
    accessInfo: null,
    previewLines: [],
    previewLoading: false,
    // Monotonic request counter. Quantity taps fire a preview each; without this
    // an older response can land last and paint a stale price.
    _previewSeq: 0,
  }),

  getters: {
    count(state) {
      return state.items.reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
    },
    isEmpty(state) {
      return state.items.length === 0;
    },
    qtyFor: (state) => (ticketId, sessionId = null, dayId = null) => {
      const item = state.items.find(
        (i) =>
          i.ticket_id === ticketId &&
          (i.ticket_session_id ?? null) === (sessionId ?? null) &&
          (i.selected_event_day_id ?? null) === (dayId ?? null)
      );
      return item ? Number(item.qty) || 0 : 0;
    },

    /**
     * Cart lines with LOCAL quantity and SERVER pricing, stitched by `_key`.
     *
     * Quantity has to come from `items` or a +/- tap does nothing until the
     * preview round trip returns, which on a venue connection is seconds of dead
     * UI. Price has to come from the preview, because phase pricing is resolved
     * server-side. `pending` marks the window where the two disagree.
     *
     * Matching is by key, never by index: the server silently drops ineligible
     * lines (switched-off ticket, gated ticket with no access code), so
     * positions do not correspond to what was sent.
     */
    mergedLines(state) {
      if (state.previewLines?.length) {
        return state.previewLines
          .map((l) => {
            const item = state.items.find(
              (i) =>
                lineKey(
                  i.ticket_id,
                  i.ticket_session_id,
                  i.selected_event_day_id,
                ) === l._key,
            );
            if (!item) return null; // removed while the preview was in flight
            const qty = Number(item.qty) || 0;
            const unit = Number(l.unit_price) || 0;
            return {
              key: l._key,
              item,
              ticket_id: l.ticket_id,
              ticket_session_id: item.ticket_session_id ?? null,
              selected_event_day_id: item.selected_event_day_id ?? null,
              qty,
              unit,
              subtotal: qty === l.quantity ? Number(l.subtotal) || 0 : unit * qty,
              pending: qty !== l.quantity,
              title: l.title || "",
              phaseLabel: l.phase_label || "",
            };
          })
          .filter(Boolean);
      }

      // No preview yet (first paint, or the request failed).
      return state.items.map((i) => ({
        key: lineKey(i.ticket_id, i.ticket_session_id, i.selected_event_day_id),
        item: i,
        ticket_id: i.ticket_id,
        ticket_session_id: i.ticket_session_id ?? null,
        selected_event_day_id: i.selected_event_day_id ?? null,
        qty: Number(i.qty) || 0,
        unit: 0,
        subtotal: 0,
        pending: false,
        title: "",
        phaseLabel: "",
      }));
    },

    pricingPending() {
      return this.mergedLines.some((l) => l.pending);
    },

    /**
     * Optimistic while a line is pending: multiplication is deterministic
     * client-side. The discount deliberately is not - percentage vs fixed vs
     * capped vs minimum-purchase is only knowable server-side - so consumers
     * dim the discount and total rows instead of guessing at them.
     */
    displaySubtotal(state) {
      if (this.pricingPending || !state.previewLines?.length) {
        return this.mergedLines.reduce((sum, l) => sum + l.subtotal, 0);
      }
      return Number(state.cachedSubtotal) || 0;
    },

    displayDiscount(state) {
      return Number(state.cachedDiscount) || 0;
    },

    /**
     * Computed rather than read from `cachedTotal`, so a 100%-off promo making
     * the total legitimately zero is not mistaken for "not loaded yet".
     */
    displayTotal() {
      return Math.max(0, this.displaySubtotal - this.displayDiscount);
    },
  },

  actions: {
    /**
     * Every cached figure from the last /preview, cleared together. They used to
     * be cleared piecemeal - `cachedSubtotal` here, nothing there - so switching
     * events left a stale `cachedDiscount` that the summary then subtracted from
     * a fresh subtotal. Bumping the sequence invalidates any request still in
     * flight so it cannot repopulate what we just cleared.
     */
    _resetPricing() {
      this.previewLines = [];
      this.cachedSubtotal = 0;
      this.cachedDiscount = 0;
      this.cachedTotal = 0;
      this.promoInfo = null;
      this.accessInfo = null;
      // Bumping the sequence orphans any in-flight request, so nothing else will
      // ever clear its loading flag. Clear it here.
      this._previewSeq += 1;
      this.previewLoading = false;
    },

    hydrate() {
      if (this.hydrated) return;
      const loaded = loadFromStorage();
      if (loaded) {
        Object.assign(this, {
          eventId: loaded.eventId ?? null,
          eventSlug: loaded.eventSlug ?? null,
          items: Array.isArray(loaded.items) ? [...loaded.items] : [],
          accessCode: loaded.accessCode ?? null,
          forceCheckout: Boolean(loaded.forceCheckout),
        });
      }
      this.hydrated = true;
      // `detached` is load-bearing. A Pinia subscription defaults to the
      // lifetime of the component that registered it, and `hydrate()` returns
      // early once `hydrated` is true - so the first client-side route change
      // away from whichever component hydrated the cart tore the subscription
      // down and nothing re-registered it. The cart then lived in memory only
      // and was lost on the next reload, mid-purchase.
      this.$subscribe(
        (_, state) => {
          const snapshot = {
            eventId: state.eventId,
            eventSlug: state.eventSlug,
            items: state.items.map((i) => ({ ...i })),
            accessCode: state.accessCode,
            forceCheckout: state.forceCheckout,
          };
          persistDebounced(snapshot);
        },
        { detached: true },
      );
    },

    /**
     * Bind the cart to the current event. If the event changes, the cart is
     * cleared so stale ticket ids from another event can't leak in.
     */
    setEventContext({ eventId, eventSlug }) {
      const changed = this.eventId !== eventId || this.eventSlug !== eventSlug;
      if (changed && (this.eventId !== null || this.eventSlug !== null)) {
        this.items = [];
        this._resetPricing();
        this.accessCode = null;
        this.forceCheckout = false;
      }
      this.eventId = eventId ?? null;
      this.eventSlug = eventSlug ?? null;
    },

    /**
     * Staff preview mode. Set on every visit to the tickets page (true when the
     * URL carries the flag, false when it does not), so an ordinary visit
     * always clears a flag left over from an earlier one.
     */
    setForceCheckout(enabled) {
      this.forceCheckout = Boolean(enabled);
    },

    setAccessCode(code) {
      this.accessCode = code ? String(code).toUpperCase().trim() : null;
    },

    clearAccessCode() {
      this.accessCode = null;
      this.accessInfo = null;
    },

    addItem(ticketId, sessionId = null, qty = 1, dayId = null) {
      const n = Math.max(1, Number(qty) || 1);
      const key = lineKey(ticketId, sessionId, dayId);
      const existing = this.items.find(
        (i) => lineKey(i.ticket_id, i.ticket_session_id, i.selected_event_day_id) === key
      );
      if (existing) {
        existing.qty = Number(existing.qty) + n;
        this.items = [...this.items];
      } else {
        this.items = [
          ...this.items,
          { ticket_id: ticketId, ticket_session_id: sessionId ?? null, selected_event_day_id: dayId ?? null, qty: n },
        ];
      }
    },

    setQty(ticketId, sessionId, qty, dayId = null) {
      const n = Math.max(0, Number(qty) || 0);
      const key = lineKey(ticketId, sessionId, dayId);
      if (n === 0) {
        this.items = this.items.filter(
          (i) => lineKey(i.ticket_id, i.ticket_session_id, i.selected_event_day_id) !== key
        );
        return;
      }
      const existing = this.items.find(
        (i) => lineKey(i.ticket_id, i.ticket_session_id, i.selected_event_day_id) === key
      );
      if (existing) {
        existing.qty = n;
        this.items = [...this.items];
      } else {
        this.items = [
          ...this.items,
          { ticket_id: ticketId, ticket_session_id: sessionId ?? null, selected_event_day_id: dayId ?? null, qty: n },
        ];
      }
    },

    removeItem(ticketId, sessionId = null, dayId = null) {
      const key = lineKey(ticketId, sessionId, dayId);
      this.items = this.items.filter(
        (i) => lineKey(i.ticket_id, i.ticket_session_id, i.selected_event_day_id) !== key
      );
    },

    /**
     * Put a removed line back exactly where it was, for the Undo action on the
     * remove toast. `addItem` appends, which would silently reorder the cart and
     * make "undo" look like a different edit.
     */
    restoreItem(item, index) {
      if (!item) return;
      const next = [...this.items];
      next.splice(Math.min(Math.max(0, index), next.length), 0, { ...item });
      this.items = next;
    },

    clear() {
      this.items = [];
      this._resetPricing();
      this.accessCode = null;
      this.forceCheckout = false;
    },

    reset() {
      Object.assign(this, defaultState());
      this._resetPricing();
      if (import.meta.client) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
      }
    },

    /**
     * Preview cart pricing through the adapter. Optionally pass a promo code
     * (the backend ignores unknown keys). Stores `lines` + `subtotal` for the
     * summary to render.
     */
    async fetchPreview({ eventId, promoCode = null, email = null, phone = null } = {}) {
      const id = eventId ?? this.eventId;
      if (!id || this.items.length === 0) {
        this._resetPricing();
        return null;
      }

      // Snapshot what we are about to send. This is the ONLY point where request
      // and response order is known, so it is the only place a returned line can
      // be tied back to the cart item that produced it. The server drops
      // ineligible lines silently (inactive ticket, gated ticket with no access
      // code), so positional matching after the fact is not merely fragile -
      // it is wrong the moment a line goes missing.
      const sentItems = this.items.map((i) => ({ ...i }));
      const seq = ++this._previewSeq;

      this.previewLoading = true;
      try {
        const body = {
          event_id: id,
          items: sentItems.map((i) => ({
            ticket_id: i.ticket_id,
            quantity: Number(i.qty) || 1,
            ...(i.ticket_session_id ? { ticket_session_id: i.ticket_session_id } : {}),
            ...(i.selected_event_day_id ? { selected_event_day_id: i.selected_event_day_id } : {}),
          })),
        };
        if (promoCode) body.promo_code = promoCode;
        if (this.accessCode) body.access_code = this.accessCode;
        if (email) body.email = email;
        if (phone) body.phone = phone;
        const res = await $fetch("/api/tickets/preview", {
          method: "POST",
          body,
          // Query string, not body - PM One reads the bypass from the query.
          query: this.forceCheckout ? { force_checkout_ticket: 1 } : undefined,
        });

        // A newer request has already been issued; this response is stale money.
        if (seq !== this._previewSeq) return null;

        const data = res?.data ?? res;
        this.previewLines = (data?.lines ?? []).map((line, idx) => ({
          ...line,
          _key: lineKey(
            sentItems[idx]?.ticket_id,
            sentItems[idx]?.ticket_session_id,
            sentItems[idx]?.selected_event_day_id,
          ),
        }));
        this.cachedSubtotal = Number(data?.subtotal ?? 0);
        this.cachedDiscount = Number(data?.discount ?? 0);
        this.cachedTotal = Number(data?.total ?? data?.subtotal ?? 0);
        this.promoInfo = data?.promo ?? null;
        this.accessInfo = data?.access ?? null;
        return data;
      } catch {
        if (seq !== this._previewSeq) return null;
        this.previewLines = [];
        this.cachedSubtotal = 0;
        this.cachedDiscount = 0;
        this.cachedTotal = 0;
        this.promoInfo = null;
        this.accessInfo = null;
        return null;
      } finally {
        if (seq === this._previewSeq) this.previewLoading = false;
      }
    },
  },
});
