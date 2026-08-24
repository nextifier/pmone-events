import { defineStore } from "pinia";
import { lineCapFor, maxFor } from "../composables/useTicketLine";

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
    // Tickets as the last-loaded page knows them, keyed by id. Set by
    // `reconcile`, never persisted: a cached copy of a listing that has since
    // changed is worse than no copy, and it is what `addItem`/`setQty` clamp
    // against so no path can push a line past the ticket's real cap.
    catalog: {},
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
      /** A cart item as a line, with no server price behind it yet. */
      const unpriced = (i, pending) => ({
        key: lineKey(i.ticket_id, i.ticket_session_id, i.selected_event_day_id),
        item: i,
        ticket_id: i.ticket_id,
        ticket_session_id: i.ticket_session_id ?? null,
        selected_event_day_id: i.selected_event_day_id ?? null,
        qty: Number(i.qty) || 0,
        unit: 0,
        subtotal: 0,
        pending,
        title: "",
        phaseLabel: "",
        // No preview covered this line, so there is nothing more authoritative
        // than the ticket record - null means "defer to the ticket".
        max_quantity: null,
        max_per_buyer: null,
      });

      if (state.previewLines?.length) {
        const priced = state.previewLines
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
              // The caps in force for the phase this line actually priced under.
              // previewCart resolves that phase from the real cart, so these are
              // right even when the listing payload was fetched in a different
              // mode or before the phase flipped - and the listing payload is
              // where the caps went missing when a ticket had not opened yet.
              max_quantity: l.max_quantity ?? null,
              max_per_buyer: l.max_per_buyer ?? null,
            };
          })
          .filter(Boolean);

        // Every item, not just the priced ones. `previewLines` outlives the
        // request that produced it - the store is one instance across
        // /tickets -> /tickets/checkout -> /tickets, and the listing page never
        // runs a preview at all - so projecting ONLY the preview dropped any
        // line added since. The cart said "43 tickets selected" while the bar
        // showed one row and a total for 40 of them. An item the preview has
        // The appended lines are NOT flagged `pending`: the caller falls back to
        // the ticket's own price, exactly what the listing does for every line
        // when no preview exists. Dimming them would split one list into
        // confident and unsure rows purely because a stale preview happened to
        // cover the first one.
        const pricedKeys = new Set(priced.map((l) => l.key));

        return [
          ...priced,
          ...state.items
            .filter(
              (i) =>
                !pricedKeys.has(
                  lineKey(
                    i.ticket_id,
                    i.ticket_session_id,
                    i.selected_event_day_id,
                  ),
                ),
            )
            .map((i) => unpriced(i, false)),
        ];
      }

      // No preview yet (first paint, or the request failed).
      return state.items.map((i) => unpriced(i, false));
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

    /**
     * The cap for one line, once the catalog is known: the ticket's own limit
     * minus what the same ticket already holds on its other days or sessions.
     * Without the subtraction a day pass could take the maximum on Friday and
     * the maximum again on Saturday and sail past `available` until the server
     * refused the whole order at submit.
     *
     * Returns `Infinity` before `reconcile` has run, so a cart edited before the
     * listing resolves behaves exactly as it did - unclamped, not blocked.
     */
    capFor(ticketId, sessionId = null, dayId = null) {
      const ticket = this.catalog?.[ticketId];
      if (!ticket) return Infinity;
      return lineCapFor(ticket, this.items, sessionId, dayId);
    },

    addItem(ticketId, sessionId = null, qty = 1, dayId = null) {
      const cap = this.capFor(ticketId, sessionId, dayId);
      const n = Math.max(1, Number(qty) || 1);
      const key = lineKey(ticketId, sessionId, dayId);
      const existing = this.items.find(
        (i) => lineKey(i.ticket_id, i.ticket_session_id, i.selected_event_day_id) === key
      );
      if (existing) {
        existing.qty = Math.min(cap, Number(existing.qty) + n);
        this.items = [...this.items];
      } else {
        this.items = [
          ...this.items,
          { ticket_id: ticketId, ticket_session_id: sessionId ?? null, selected_event_day_id: dayId ?? null, qty: Math.min(cap, n) },
        ];
      }
    },

    setQty(ticketId, sessionId, qty, dayId = null) {
      const cap = this.capFor(ticketId, sessionId, dayId);
      const n = Math.min(cap, Math.max(0, Number(qty) || 0));
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
     *
     * The splice used to be blind: if the buyer re-added the same ticket before
     * pressing Undo, the cart ended up with two lines sharing a key, which the
     * preview then priced twice. Merge onto the existing line instead, still
     * respecting the cap.
     */
    restoreItem(item, index) {
      if (!item) return;
      const key = lineKey(item.ticket_id, item.ticket_session_id, item.selected_event_day_id);
      const existing = this.items.find(
        (i) => lineKey(i.ticket_id, i.ticket_session_id, i.selected_event_day_id) === key
      );
      if (existing) {
        this.setQty(
          item.ticket_id,
          item.ticket_session_id ?? null,
          Number(existing.qty) + (Number(item.qty) || 0),
          item.selected_event_day_id ?? null,
        );
        return;
      }
      const cap = this.capFor(
        item.ticket_id,
        item.ticket_session_id ?? null,
        item.selected_event_day_id ?? null,
      );
      const next = [...this.items];
      next.splice(Math.min(Math.max(0, index), next.length), 0, {
        ...item,
        qty: Math.min(cap, Math.max(1, Number(item.qty) || 1)),
      });
      this.items = next;
    },

    /**
     * Check the persisted cart against the tickets the page actually loaded and
     * drop what can no longer be bought, returning the titles dropped so the
     * caller can say so in one toast.
     *
     * `hydrate()` cannot do this: it runs before any ticket has been fetched. So
     * until now a line survived its ticket being switched off, sold out, or
     * losing the day it was booked on - for a full 24 hours, and it was re-sent
     * to the preview and to the order endpoint on every single load.
     *
     * @param {Object|Map} ticketsById
     * @returns {{ removed: Array<string|null> }} titles, `null` for a ticket the
     *   listing no longer carries at all
     */
    reconcile(ticketsById) {
      const lookup =
        ticketsById instanceof Map
          ? Object.fromEntries(ticketsById)
          : (ticketsById ?? {});

      this.catalog = lookup;
      if (!Object.keys(lookup).length) return { removed: [] };

      const removed = [];
      const kept = [];
      // Running total per ticket: the cap is per ticket, not per line, so two
      // day lines of the same pass have to share one budget.
      const spent = {};

      for (const item of this.items) {
        const ticket = lookup[item.ticket_id];
        if (!ticket) {
          // `null`, never the id: the caller turns it into a generic word. A
          // database primary key is not a thing to show a buyer.
          removed.push(null);
          continue;
        }

        const dayId = item.selected_event_day_id ?? null;
        const validDays = ticket.valid_days ?? [];

        // Same predicate the server uses (`Ticket::offersDaySelection`), so the
        // client never keeps a line the order endpoint would reject.
        const needsDay =
          ticket.kind === "entry" && Boolean(ticket.requires_day_selection);

        if (needsDay && !dayId && validDays.length !== 1) {
          removed.push(ticket.title);
          continue;
        }

        if (dayId && !validDays.some((d) => d.id === dayId)) {
          removed.push(ticket.title);
          continue;
        }

        const budget = maxFor(ticket) - (spent[ticket.id] ?? 0);
        const headroom = Math.min(budget, Math.max(1, Number(item.qty) || 1));

        if (headroom < 1) {
          removed.push(ticket.title);
          continue;
        }

        spent[ticket.id] = (spent[ticket.id] ?? 0) + headroom;

        kept.push({
          ...item,
          // A single valid day is implied rather than chosen, so fill it in here
          // instead of shipping a null the server has to guess at.
          selected_event_day_id:
            needsDay && !dayId ? (validDays[0]?.id ?? null) : dayId,
          qty: headroom,
        });
      }

      this.items = kept;
      return { removed };
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
        // Keyed off what the response says each line IS, not where it sits.
        // The server drops ineligible lines silently (inactive ticket, gated
        // ticket with no access code), so one skipped line used to shift every
        // later line onto another line's price and title. `sentItems` is only a
        // fallback for an older API that does not echo the day back.
        this.previewLines = (data?.lines ?? []).map((line, idx) => {
          // `in`, not `??`: the server sends an explicit null for a line with no
          // day, and `??` would fall through to whatever the positional guess
          // held - reintroducing the very bug this replaces.
          const echoesDay = line && "selected_event_day_id" in line;
          const fallback = sentItems[idx] ?? {};
          return {
            ...line,
            _key: lineKey(
              line.ticket_id ?? fallback.ticket_id,
              echoesDay
                ? (line.ticket_session_id ?? null)
                : fallback.ticket_session_id,
              echoesDay
                ? line.selected_event_day_id
                : fallback.selected_event_day_id,
            ),
          };
        });
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
