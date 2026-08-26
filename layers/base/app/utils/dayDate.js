/**
 * "en" on these sites means the product's English, not American English.
 *
 * Every other date in the product is day-first - "8 Oct" on a cart line, "Thu,
 * 8 Oct" on the admin screens a visitor's ticket gets checked against - so
 * asking Intl for plain "en", which resolves to en-US and puts the month first,
 * left the day picker as the one surface writing "Thu, Oct 8". Every other
 * locale is passed through untouched and keeps its own field order; Japanese
 * still reads 10月8日(木).
 */
function dateLocale(locale) {
  return locale === "en" || !locale ? "en-GB" : locale;
}

// Format an event-day ISO date ("2026-05-28") as "28 May" (day-first, short
// month). Parsed at local midnight to avoid timezone off-by-one. Auto-imported.
export function formatDayDate(iso, locale = "en") {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(dateLocale(locale), {
      day: "numeric",
      month: "short",
    }).format(new Date(`${iso}T00:00:00`));
  } catch {
    return "";
  }
}

/**
 * A ticket's day, written out in full: "Day 1 · Thu, 8 Oct".
 *
 * `label` is the operator's own name for the day when there is one ("Opening
 * Day"), already resolved out of its multi-language object. Most operators never
 * name their days, so `dayWord` - the localized "Day {n}" the caller builds from
 * i18n - is the common case rather than the fallback.
 *
 * This is THE way a day is written across the product: the ticket card, the
 * downloaded image, the cart lines, the day picker, and every admin screen. They
 * each used to carry a shape of their own - "8 Oct", "Thu, Oct 8", "Day 1 - 8
 * Oct" - so one seat read three ways depending on which screen you were on.
 *
 * The separator is a middot: the two halves are peers, and a dash between a day
 * name and a date reads as a range on a page already full of dates.
 */
export function formatTicketDay(label, dayWord, iso, locale = "en") {
  const name = label || dayWord || "";

  return [name, formatWeekdayDate(iso, locale)].filter(Boolean).join(" · ");
}

/**
 * Localized weekday + date: "Thu, 8 Oct" / "Kam, 8 Okt" / "10月8日(木)".
 *
 * Composed rather than left to a single Intl call for English, because no
 * English locale produces this shape: "en-GB" gives "Thu 8 Oct" with no comma
 * and "en" gives "Thu, Oct 8" with the month first. Other locales are formatted
 * whole, so their own punctuation and field order survive.
 */
export function formatWeekdayDate(iso, locale = "en") {
  if (!iso) return "";

  const resolved = dateLocale(locale);

  try {
    if (resolved === "en-GB") {
      const weekday = new Intl.DateTimeFormat(resolved, { weekday: "short" }).format(
        new Date(`${iso}T00:00:00`)
      );
      return `${weekday}, ${formatDayDate(iso, locale)}`;
    }

    return new Intl.DateTimeFormat(resolved, {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(new Date(`${iso}T00:00:00`));
  } catch {
    return "";
  }
}

// Parse an event-day ISO date ("2026-11-20") to a local-midnight Date, or null.
export function isoToLocalDate(iso) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}
