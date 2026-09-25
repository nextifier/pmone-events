// Meeting times are always shown in the EVENT's timezone, never the device's:
// a visitor abroad and the booth in Jakarta must read the same "10:00".
// Auto-imported.

function safeFormat(options, value, locale = "en-GB") {
  // "en" alone writes month-first ("Oct 9"); every meeting surface reads day-first.
  if (locale === "en") locale = "en-GB";
  try {
    return new Intl.DateTimeFormat(locale, options).format(new Date(value));
  } catch {
    return "";
  }
}

/** "10:00" in the event's timezone. */
export function meetingClock(iso, timezone, locale = "en-GB") {
  if (!iso) return "";
  return safeFormat({ hour: "2-digit", minute: "2-digit", hour12: false, timeZone: timezone }, iso, locale);
}

/** "10:00-10:30". */
export function meetingClockRange(startIso, endIso, timezone, locale = "en-GB") {
  const start = meetingClock(startIso, timezone, locale);
  const end = meetingClock(endIso, timezone, locale);
  return end ? `${start}-${end}` : start;
}

/** "WIB", "SGT", "GMT+9": the short name of the event's timezone. */
export function meetingZone(timezone, locale = "en-US") {
  if (!timezone) return "";
  const known = { "Asia/Jakarta": "WIB", "Asia/Makassar": "WITA", "Asia/Jayapura": "WIT" };
  if (known[timezone]) return known[timezone];
  try {
    const part = new Intl.DateTimeFormat(locale, { timeZone: timezone, timeZoneName: "short" })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName");
    return part?.value || timezone;
  } catch {
    return timezone;
  }
}

/** "Fri, 3 Oct" for a slot instant, in the event's timezone. */
export function meetingDay(iso, timezone, locale = "en-GB") {
  if (!iso) return "";
  const weekday = safeFormat({ weekday: "short", timeZone: timezone }, iso, locale);
  const date = safeFormat({ day: "numeric", month: "short", timeZone: timezone }, iso, locale);
  return weekday && date ? `${weekday}, ${date}` : date;
}

/** "Fri, 3 Oct · 10:00-10:30 WIB": the one full form a meeting time is written in. */
export function meetingWhen(meeting, locale = "en-GB") {
  if (!meeting?.starts_at) return "";
  const tz = meeting.timezone || meeting.event?.timezone;
  return `${meetingDay(meeting.starts_at, tz, locale)} · ${meetingClockRange(meeting.starts_at, meeting.ends_at, tz, locale)} ${meetingZone(tz)}`.trim();
}

/** Whether the device sits in another timezone than the event right now. */
export function meetingZoneDiffers(timezone) {
  if (!timezone) return false;
  try {
    const here = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (here === timezone) return false;
    const now = new Date();
    const offset = (tz) => new Date(now.toLocaleString("en-US", { timeZone: tz })).getTime();
    return offset(here) !== offset(timezone);
  } catch {
    return false;
  }
}

/** Badge variant for a meeting status; the words come from the API or i18n. */
export const MEETING_STATUS_VARIANT = {
  pending: "warning",
  accepted: "success",
  declined: "muted",
  cancelled: "muted",
  expired: "muted",
};

const MEETING_ERROR_CODES = [
  "MEETINGS_CLOSED",
  "MEETINGS_NOT_OPEN",
  "BRAND_NOT_TAKING_MEETINGS",
  "SLOT_CLOSED",
  "SLOT_FULL",
  "SLOT_CONFLICT",
  "BRAND_ALREADY_REQUESTED",
  "REQUEST_LIMIT_REACHED",
  "NO_TICKET",
  "TICKET_NOT_ELIGIBLE",
  "TICKET_NOT_VALID_ON_DAY",
  "PROFILE_REQUIRED",
  "MESSAGE_REQUIRED",
  "MEETING_NOT_PENDING",
  "MEETING_NOT_OPEN",
  "SLOT_HAS_MEETING",
];

/** Codes after which the slot list is stale and should be picked again. */
export const MEETING_SLOT_ERRORS = ["SLOT_CLOSED", "SLOT_FULL", "SLOT_CONFLICT", "TICKET_NOT_VALID_ON_DAY"];

/**
 * The translated sentence for a meeting error, from the API's error_code and
 * context. Falls back to the API's own message, then a generic line.
 */
export function meetingErrorText(err, t) {
  const data = err?.data ?? {};
  const code = data.error_code;
  if (code && MEETING_ERROR_CODES.includes(code)) {
    const ctx = data.context ?? {};
    return t(`meetings.errors.${code}`, {
      brand: ctx.brand ?? "",
      count: ctx.limit ?? "",
      ticket: ctx.ticket ?? "",
      date: ctx.opens_at ?? "",
    });
  }
  const first = data.errors ? Object.values(data.errors)[0]?.[0] : null;
  return first || data.message || t("meetings.errors.generic");
}
