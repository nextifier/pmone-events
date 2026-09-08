/**
 * When a message happened, in the words a transcript uses.
 *
 * A transcript people come back to needs both the clock and the day. Without
 * the clock a reader cannot tell an answer from five minutes ago from one from
 * last week, and without the day rule the clock lies by looking recent.
 *
 * Only ever called on the client - a transcript is fetched after mount - so the
 * reader's own locale and timezone are the right ones to format in.
 */
const time = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" })
const fullDate = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
})

/** "10:02", or "" for a date that does not parse. */
export function formatMessageTime(iso: string): string {
  const at = new Date(iso)

  return Number.isNaN(at.getTime()) ? "" : time.format(at)
}

/** The local midnight a timestamp belongs to, as epoch milliseconds. */
export function midnightOf(iso: string): number | null {
  const at = new Date(iso)
  if (Number.isNaN(at.getTime())) return null

  return new Date(at.getFullYear(), at.getMonth(), at.getDate()).getTime()
}

/** "Today", "Yesterday", or the date. */
export function dayLabelOf(iso: string): string {
  const day = midnightOf(iso)
  if (day === null) return ""

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const oneDay = 86_400_000

  if (day === today) return "Today"
  if (day === today - oneDay) return "Yesterday"

  return fullDate.format(new Date(day))
}

/**
 * True for the first message, and whenever the calendar date changes between
 * one message and the next.
 */
export function startsNewDay(previousIso: string | null | undefined, currentIso: string): boolean {
  if (!currentIso) return false
  if (!previousIso) return true

  return midnightOf(previousIso) !== midnightOf(currentIso)
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

const STEPS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["second", 60],
  ["minute", 60],
  ["hour", 24],
  ["day", 7],
  ["week", 4.35],
  ["month", 12],
  ["year", Infinity],
]

/**
 * "2 hours ago", for a list row.
 *
 * A plain function rather than `useTimeAgo`: that composable sets up a
 * reactive interval per call, and a call per row in a `v-for` would mean one
 * timer for every conversation in the list. A value computed at render is
 * accurate enough for a list that refreshes on its own.
 */
export function relativeTimeOf(iso: string | null | undefined): string {
  if (!iso) return ""

  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ""

  let amount = (then - Date.now()) / 1000

  for (const [unit, span] of STEPS) {
    if (Math.abs(amount) < span) return relative.format(Math.round(amount), unit)
    amount /= span
  }

  return ""
}
