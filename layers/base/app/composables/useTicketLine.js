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

/** Highest quantity this ticket accepts in one order: `min(max_quantity, available)`, 50 when uncapped. */
export function maxFor(ticket) {
  const caps = [ticket?.max_quantity];
  if (ticket?.available != null) caps.push(ticket.available);
  const valid = caps.filter((n) => n != null && Number(n) > 0);
  return valid.length ? Math.min(...valid) : 50;
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

export function useTicketLine() {
  return {
    fmtIdr,
    posterSrc,
    posterLightboxItems,
    POSTER_FULL_KEY,
    maxFor,
    minFor,
    soldOut,
    cartLineSubLabel,
  };
}
