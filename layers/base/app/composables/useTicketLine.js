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

/**
 * CSS aspect-ratio of a ticket poster, from the width and height the upload
 * recorded, so the thumbnail frame takes the poster's own shape before the
 * image arrives and nothing moves when it does. A poster uploaded before the
 * dimensions were recorded keeps the square frame the card always had.
 */
export function posterAspectRatio(ticket) {
  return mediaAspectRatio(ticket?.poster, "1 / 1");
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
 * The ticket record a cart line should be measured against.
 *
 * The listing payload is not always the last word on the caps. It reports the
 * phase that is LIVE, and a ticket whose sale has not opened yet has none - so
 * the caps fell back to the ticket row, which is null whenever the limit is a
 * per-phase rule, and the client read that as "no limit". A ticket capped at one
 * per email address went into a cart four times.
 *
 * `previewCart` does not have that blind spot: it resolves the phase from the
 * real cart on every pricing call, so its per-line caps are right in every mode
 * and stay right when a phase flips while the buyer is sitting on checkout.
 * Where it has spoken, it wins; where it has not, nothing changes.
 */
export function ticketForLine(ticket, line) {
  const perOrder = line?.max_quantity ?? null;
  const perBuyer = line?.max_per_buyer ?? null;

  if (perOrder === null && perBuyer === null) return ticket;

  return {
    ...ticket,
    max_quantity: perOrder ?? ticket?.max_quantity ?? null,
    max_per_buyer: perBuyer ?? ticket?.max_per_buyer ?? null,
  };
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

  // A session has seats of its own. With the ticket's stock unlimited they are
  // the only limit there is, and the stepper used to climb past a full room
  // until checkout refused it.
  const session = sessionId ? (ticket.sessions ?? []).find((s) => s.id === sessionId) : null;
  const seatsLeft = session?.available != null ? Math.max(0, Number(session.available) || 0) : Infinity;

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
  return Math.max(0, Math.min(total - heldElsewhere, seatsLeft));
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

/**
 * True when the ticket cannot be bought for lack of stock.
 *
 * `is_sold_out` means every phase still to come is sold out, whether the
 * organizer flagged it (the only way for a ticket sold on another platform,
 * whose stock lives there) or its quota ran out. A phase that sold out with a
 * later one still ahead is not this: the API names it in
 * `sold_out_phase_label` and the card counts down to the next phase instead.
 */
export function soldOut(ticket) {
  if (ticket?.is_sold_out === true) return true;
  if (ticket?.available != null && ticket.available <= 0) return true;

  // An add-on whose every session is full is sold out even while its own stock
  // is unlimited: the session badges said "Sold out" while the Add button
  // stayed live and checkout refused the order.
  const sessions = ticket?.kind === "add_on" ? (ticket.sessions ?? []) : [];
  return (
    sessions.length > 0 &&
    sessions.every(
      (s) => s.status === "sold_out" || (s.available != null && Number(s.available) <= 0),
    )
  );
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
  if (session?.starts_at) {
    // When it happens, not what staff named it: on a four-day event "Seminar"
    // alone does not tell the buyer which day they are signing up for.
    parts.push($dayjs(eventDate(session.starts_at)).format("ddd, D MMM"));
    parts.push(sessionTimeRange(session));
  } else if (session?.label) {
    parts.push(session.label);
  }

  return parts.join(" · ");
}

// Session times are Jakarta times wherever the buyer sits, like the listing.
const EVENT_TZ = "Asia/Jakarta";

/** `"2026-10-08T13:00:00+07:00"` -> `"2026-10-08"`, the calendar day at the venue. */
export function eventDate(iso) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: EVENT_TZ }).format(new Date(iso));
}

/** `"13:00 - 15:00"`, or `"13:00 - Finish"` for a session with no end, as the Rundown shows it. */
export function sessionTimeRange(session) {
  const { $i18n } = useNuxtApp();
  const fmt = (iso) =>
    new Intl.DateTimeFormat($i18n.locale.value, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: EVENT_TZ,
    }).format(new Date(iso));

  return `${fmt(session.starts_at)} - ${session.ends_at ? fmt(session.ends_at) : $i18n.t("rundown.finish")}`;
}

/**
 * Whether the entry tickets in this cart get the buyer in on the day an add-on
 * session takes place, one entry ticket per seat. Advice only: the order
 * endpoint counts entry tickets bought earlier with the same email too, and
 * refuses the order with its own explanation when they still fall short. A
 * Thursday seminar next to a Sunday pass is almost always a mistake, though,
 * and one that is cheaper to catch in the cart than at checkout.
 *
 * Skipped for an add-on the organizer sells on its own (merchandise, parking).
 *
 * @param {object|null} ticket the add-on line's ticket
 * @param {object} item the add-on line's cart item
 * @param {Array<{ticket: object|null, item: object}>} lines every line in the cart
 * @returns {{ kind: "uncovered"|"no_entry"|"short", sessionDay: string, entryDays: string } | null}
 */
export function addOnDayNotice(ticket, item, lines) {
  if (ticket?.kind !== "add_on" || !item) return null;
  if (ticket.requires_entry_ticket === false) return null;
  const session = (ticket.sessions ?? []).find((s) => s.id === item.ticket_session_id);
  if (!session?.starts_at) return null;

  const { $dayjs } = useNuxtApp();
  // Non-breaking inside each date, so "Thu, 8 Oct" never splits across lines.
  const format = (date) => $dayjs(date).format("ddd, D MMM").replace(/ /g, "\u00a0");
  const sessionDate = eventDate(session.starts_at);

  const entryLines = lines.filter((l) => l.ticket?.kind === "entry");
  if (!entryLines.length) {
    return { kind: "no_entry", sessionDay: format(sessionDate), entryDays: "" };
  }

  const covered = new Set();
  let coveringQty = 0;
  for (const line of entryLines) {
    const days = line.ticket.valid_days ?? [];
    const chosen = days.find((d) => d.id === line.item?.selected_event_day_id);
    // A pass with no day list is valid on every day of the event. A day pass
    // with no day picked yet already reads "Choose a day"; a second warning
    // on top of it would be about a choice not made.
    if (line.ticket.requires_day_selection ? !chosen : !days.length) {
      if (line.ticket.requires_day_selection) return null;
      coveringQty += Number(line.item?.qty) || 0;
      covered.add(sessionDate);
      continue;
    }
    const lineDates = (chosen ? [chosen] : days).map((d) => d.date?.slice(0, 10)).filter(Boolean);
    for (const date of lineDates) covered.add(date);
    if (lineDates.includes(sessionDate)) coveringQty += Number(line.item?.qty) || 0;
  }

  if (!covered.has(sessionDate)) {
    return {
      kind: "uncovered",
      sessionDay: format(sessionDate),
      entryDays: [...covered].sort().map(format).join(", "),
    };
  }

  // Seats of this add-on on the session's day, across every session that day.
  const seats = lines
    .filter((l) => l.ticket?.id === ticket.id)
    .filter((l) => {
      const s = (ticket.sessions ?? []).find((x) => x.id === l.item?.ticket_session_id);
      return s?.starts_at && eventDate(s.starts_at) === sessionDate;
    })
    .reduce((sum, l) => sum + (Number(l.item?.qty) || 0), 0);

  if (seats > coveringQty) {
    return { kind: "short", sessionDay: format(sessionDate), entryDays: "" };
  }

  return null;
}

/**
 * The sentence for an add-on's entry-ticket notice, or "" when there is none.
 *
 * @param {ReturnType<typeof addOnDayNotice>} notice
 * @param {Function} t vue-i18n's t
 */
export function addOnDayNoticeText(notice, t) {
  if (!notice) return "";
  if (notice.kind === "uncovered") {
    return t("tickets.addOnDayUncovered", { session: notice.sessionDay, entry: notice.entryDays });
  }
  if (notice.kind === "short") {
    return t("tickets.addOnEntryPerSeat", { session: notice.sessionDay });
  }
  return t("tickets.addOnNeedsEntry", { session: notice.sessionDay });
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
    ticketForLine,
    lineCapFor,
    singleQuantity,
    minFor,
    soldOut,
    cartLineSubLabel,
    lineMissingDay,
    addOnDayNotice,
    addOnDayNoticeText,
  };
}
