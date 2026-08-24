/**
 * Shared helpers for anything that renders a ticket as a cart line: the ticket
 * listing, the sticky cart bar, and the checkout order summary.
 *
 * These lived privately inside `TicketList.vue`, which is why the same cart line
 * used to read "Fri, 20 Nov" on /tickets and "Day 1" on /tickets/checkout, and
 * why the checkout `+` button had no quantity cap while the listing's did.
 * One source, three call sites.
 */

// Non-compact currency. Deliberately NOT `useCurrencyFormat()`, which is locked
// to `notation: "compact"` and renders "Rp95,5rb" - fine on a listing card, wrong
// on a line the buyer is about to pay.
const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** `350000` -> `"Rp350.000"` (no space after the symbol, matching the old hand-rolled output). */
export function fmtIdr(value) {
  return idrFormatter.format(Number(value) || 0).replace(/\s/g, "");
}

/**
 * Responsive conversion for the poster lightbox: mobile reuses the same `md`
 * conversion already shown in the trigger thumbnail (instant, no extra
 * download), while larger screens load progressively bigger versions.
 */
export const POSTER_FULL_KEY = { base: "md", sm: "lg", xl: "xl" };

/** Best available poster conversion for a thumbnail, or `null` when the ticket has no poster. */
export function posterSrc(ticket) {
  const p = ticket?.poster;
  if (!p) return null;
  return p.md || p.sm || p.lg || p.url || null;
}

/** A single-image lightbox payload for a ticket poster (opens the larger image). */
export function posterLightboxItems(ticket) {
  const p = ticket?.poster;
  if (!p) return [];
  return [
    {
      sm: p.sm,
      md: p.md,
      lg: p.lg,
      xl: p.xl,
      url: p.url,
      alt: ticket.title,
      caption: ticket.title,
    },
  ];
}

/**
 * Highest quantity this ticket accepts in one order: `min(max_quantity,
 * max_per_buyer, available)`, 50 when none is set.
 *
 * The two zeroes mean opposite things and used to be filtered out together by a
 * single `> 0` guard. `max_quantity: 0` is a nonsense limit and is ignored, but
 * `available: 0` is the ticket being SOLD OUT - dropping it made `maxFor` report
 * the per-order limit for a ticket with no stock left, so `reconcile` kept its
 * cart lines and the stepper would happily raise them. `soldOut()` below has
 * always read the same field correctly; this brings the cap into line with it.
 */
export function maxFor(ticket) {
  const caps = [];

  const perOrder = Number(ticket?.max_quantity);
  if (ticket?.max_quantity != null && perOrder > 0) caps.push(perOrder);

  // Per-EMAIL cap (the ticket's own, or - during a capped price phase - that
  // phase's; the API resolves which and sends one number). This is the exact
  // bound for a first-time buyer and a deliberate over-estimate for a returning
  // one: the client cannot know what an address already holds, and asking the
  // server would turn a public endpoint into an "has this person registered?"
  // oracle. A repeat buyer is caught at submit, inline on the email field.
  const perBuyer = Number(ticket?.max_per_buyer);
  if (ticket?.max_per_buyer != null && perBuyer > 0) caps.push(perBuyer);

  if (ticket?.available != null) {
    caps.push(Math.max(0, Number(ticket.available) || 0));
  }

  return caps.length ? Math.min(...caps) : 50;
}

/**
 * The cap that actually applies to ONE line, once the rest of the cart is taken
 * into account.
 *
 * `maxFor` answers "how many of this ticket may an order hold", and every
 * surface used to apply it per line. A day pass keeps one line per day, so a
 * buyer could take the maximum on Friday and the maximum again on Saturday and
 * walk past `available` - the server then refuses the whole order at submit.
 * Subtracting what the ticket's OTHER lines already hold makes the `+` stop
 * where the order will actually stop.
 *
 * `items` is `cart.items`; `dayId`/`sessionId` identify the line being edited.
 */
export function lineCapFor(ticket, items = [], sessionId = null, dayId = null) {
  const total = maxFor(ticket);
  if (!ticket?.id) return total;
  const heldElsewhere = (items ?? [])
    .filter(
      (i) =>
        i.ticket_id === ticket.id &&
        !(
          (i.ticket_session_id ?? null) === (sessionId ?? null) &&
          (i.selected_event_day_id ?? null) === (dayId ?? null)
        ),
    )
    .reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
  return Math.max(0, total - heldElsewhere);
}

/**
 * True when this ticket can only ever be bought one at a time, so a `- 1 +`
 * stepper would be two dead controls around a number that cannot move. Call
 * sites render a single add/remove toggle instead.
 */
export function singleQuantity(ticket) {
  return maxFor(ticket) <= 1;
}

/** Lowest quantity this ticket accepts. `addToCart` seeds a new line with this, so `-` must floor here too. */
export function minFor(ticket) {
  return Math.max(1, Number(ticket?.min_quantity) || 1);
}

export function soldOut(ticket) {
  return ticket?.available != null && ticket.available <= 0;
}

/**
 * A concise "Day · Session" sub-label for a cart line, built from the same
 * valid_days / sessions the picker uses (omitted when neither applies).
 *
 * The day is formatted from `date`, not from the stored `label`: the picker
 * shows the buyer "Fri, 20 Nov", so every downstream surface has to say the
 * same thing or they cannot verify what they selected.
 */
export function cartLineSubLabel(ticket, item) {
  if (!ticket || !item) return "";
  const { $dayjs } = useNuxtApp();
  const parts = [];

  const day = (ticket.valid_days ?? []).find(
    (d) => d.id === item.selected_event_day_id,
  );
  if (day?.date) {
    parts.push($dayjs(day.date).format("ddd, D MMM"));
  }

  const session = (ticket.sessions ?? []).find(
    (s) => s.id === item.ticket_session_id,
  );
  if (session?.label) {
    parts.push(session.label);
  }

  return parts.join(" · ");
}

/**
 * True when a line is missing the day its ticket requires.
 *
 * Mirrors the server predicate exactly - `Ticket::offersDaySelection()` is
 * `isEntry() && requires_day_selection`, and a cart that disagrees with it is a
 * cart the order endpoint will refuse.
 */
export function lineMissingDay(ticket, item) {
  if (!ticket || !item) return false;
  if (ticket.kind !== "entry" || !ticket.requires_day_selection) return false;
  return !item.selected_event_day_id;
}

export function useTicketLine() {
  return {
    fmtIdr,
    posterSrc,
    posterLightboxItems,
    POSTER_FULL_KEY,
    maxFor,
    lineCapFor,
    singleQuantity,
    minFor,
    soldOut,
    cartLineSubLabel,
    lineMissingDay,
  };
}
