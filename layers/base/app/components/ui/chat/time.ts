import type { Ref } from "vue"
import { onScopeDispose, ref } from "vue"

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
 * One clock for every relative label on screen.
 *
 * `useTimeAgo` arms a timer per call, and a call per row in a `v-for` means one
 * timer for every conversation in the list. This is a single interval, shared,
 * started when the first caller asks and stopped when the last one unmounts.
 *
 * It exists because "computed at render" was not enough: a list that only
 * re-renders when its data changes never re-renders at all while a socket is
 * healthy, so the newest row sat at "1 second ago" for as long as it was left
 * alone. Half a minute is finer than any label this function prints.
 */
const clock = ref(Date.now())
let clockTimer: ReturnType<typeof setInterval> | null = null
let clockReaders = 0

export function useRelativeClock(): Ref<number> {
  clockReaders++

  if (clockTimer === null && typeof window !== "undefined") {
    clockTimer = setInterval(() => (clock.value = Date.now()), 30_000)
  }

  onScopeDispose(() => {
    clockReaders--

    if (clockReaders === 0 && clockTimer !== null) {
      clearInterval(clockTimer)
      clockTimer = null
    }
  })

  return clock
}

/**
 * "2 hours ago", for a list row.
 *
 * Pass `now` - the value from `useRelativeClock()` - to make the label a
 * reactive dependency of that clock. Without it the string is still correct,
 * it just never changes again on its own.
 */
export function relativeTimeOf(iso: string | null | undefined, now?: number): string {
  if (!iso) return ""

  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ""

  let amount = (then - (now ?? Date.now())) / 1000

  for (const [unit, span] of STEPS) {
    if (Math.abs(amount) < span) return relative.format(Math.round(amount), unit)
    amount /= span
  }

  return ""
}
