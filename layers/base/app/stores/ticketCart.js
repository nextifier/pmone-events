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

function lineKey(ticketId, sessionId, dayId) {
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
  },

  actions: {
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
      this.$subscribe((_, state) => {
        const snapshot = {
          eventId: state.eventId,
          eventSlug: state.eventSlug,
          items: state.items.map((i) => ({ ...i })),
          accessCode: state.accessCode,
          forceCheckout: state.forceCheckout,
        };
        persistDebounced(snapshot);
      });
    },

    /**
     * Bind the cart to the current event. If the event changes, the cart is
     * cleared so stale ticket ids from another event can't leak in.
     */
    setEventContext({ eventId, eventSlug }) {
      const changed = this.eventId !== eventId || this.eventSlug !== eventSlug;
      if (changed && (this.eventId !== null || this.eventSlug !== null)) {
        this.items = [];
        this.previewLines = [];
        this.cachedSubtotal = 0;
        this.accessCode = null;
        this.accessInfo = null;
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

    clear() {
      this.items = [];
      this.previewLines = [];
      this.cachedSubtotal = 0;
      this.accessCode = null;
      this.accessInfo = null;
      this.forceCheckout = false;
    },

    reset() {
      Object.assign(this, defaultState());
      this.previewLines = [];
      this.cachedSubtotal = 0;
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
        this.previewLines = [];
        this.cachedSubtotal = 0;
        return null;
      }
      this.previewLoading = true;
      try {
        const body = {
          event_id: id,
          items: this.items.map((i) => ({
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
        const data = res?.data ?? res;
        this.previewLines = data?.lines ?? [];
        this.cachedSubtotal = Number(data?.subtotal ?? 0);
        this.cachedDiscount = Number(data?.discount ?? 0);
        this.cachedTotal = Number(data?.total ?? data?.subtotal ?? 0);
        this.promoInfo = data?.promo ?? null;
        this.accessInfo = data?.access ?? null;
        return data;
      } catch {
        this.previewLines = [];
        this.cachedSubtotal = 0;
        this.cachedDiscount = 0;
        this.cachedTotal = 0;
        this.promoInfo = null;
        this.accessInfo = null;
        return null;
      } finally {
        this.previewLoading = false;
      }
    },
  },
});
