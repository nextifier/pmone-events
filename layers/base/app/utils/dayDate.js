// Format an event-day ISO date ("2026-05-28") as "28 May" (day-first, short
// month). Parsed at local midnight to avoid timezone off-by-one. Auto-imported.
export function formatDayDate(iso) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(
      new Date(`${iso}T00:00:00`)
    );
  } catch {
    return "";
  }
}

// Combine a resolved day label with its date: "Day 2 - 28 May".
export function appendDayDate(label, iso) {
  const date = formatDayDate(iso);
  if (!date) return label || "";
  return label ? `${label} - ${date}` : date;
}

// Localized weekday + date for a day-pass pill: "Fri, Nov 20" / "Jum, 20 Nov".
// The locale controls the field order. Parsed at local midnight. Auto-imported.
export function formatWeekdayDate(iso, locale = "en") {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(locale, {
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
