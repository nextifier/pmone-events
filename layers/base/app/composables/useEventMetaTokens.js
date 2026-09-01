/**
 * Localized interpolation tokens for meta copy that names the edition, dates
 * and venue ("back for a 9th run, 9-11 October 2026 at NICE PIK 2").
 *
 * Those three facts change every edition, so baking them into a locale string
 * guarantees the description goes stale the moment an event rolls over - and it
 * goes stale silently, in five languages, on the one tag search engines read.
 *
 * Reads the shared `active-event` payload rather than fetching: `useNuxtData`
 * never triggers a request, so this is safe to call from a Pinia store setup
 * where `useFetch` is not. The caller is responsible for having the data - a
 * page whose meta needs these tokens should `await useEventData()` before
 * `usePageMeta`, or the tags render from the empty defaults.
 *
 * Every token is served separately instead of one preformatted date string
 * because the five locales do not share a sentence shape: English wants
 * "9-11 October 2026", Japanese "2026年10月9日から11日". A single `{dates}`
 * token forces four of them to read like a translation of the fifth.
 *
 * `ordinal` is English-only by nature. Pass `{n}` and `{ordinal}` as separate
 * tokens and let each locale decide - "2nd edisi" is what happens when the
 * ordinal travels glued to the number.
 */
const TZ = "Asia/Jakarta";

export function useEventMetaTokens() {
  const { locale } = useI18n();
  const activeEvent = useNuxtData("active-event");

  return computed(() => {
    const e = activeEvent.data.value?.data ?? null;
    const start = e?.start_date ? new Date(e.start_date) : null;

    if (!start || Number.isNaN(start.getTime())) {
      return {
        n: "",
        ordinal: "",
        day1: "",
        day2: "",
        dayRange: "",
        month: "",
        monthNum: "",
        year: "",
        venue: e?.location_short || e?.location || "",
      };
    }

    const end = e?.end_date ? new Date(e.end_date) : start;

    // Numbers are formatted in en-US on purpose. Asking Intl for a bare year in
    // ja/ko/zh returns "2026年" / "2026년", and a bare month returns "10月" -
    // the unit comes glued to the digit, so a template written as
    // `{year}年{monthNum}月` renders "2026年年10月月". All five locales write these
    // as Arabic numerals, so the digits are locale-neutral and the unit belongs
    // to the sentence, not to the token.
    const num = (date, opts) =>
      new Intl.DateTimeFormat("en-US", { timeZone: TZ, ...opts }).format(date);

    // The month NAME is the one part that must follow the reader's language.
    const monthName = new Intl.DateTimeFormat(locale.value, {
      timeZone: TZ,
      month: "long",
    }).format(start);

    const day1 = num(start, { day: "numeric" });
    const day2 = num(Number.isNaN(end.getTime()) ? start : end, { day: "numeric" });

    const n = e?.edition_number ?? "";
    const full = e?.edition_number_with_ordinal ?? "";

    return {
      n,
      ordinal: n !== "" && full ? String(full).replace(String(n), "") : "",
      day1,
      day2,
      dayRange: day1 === day2 ? day1 : `${day1}-${day2}`,
      month: monthName,
      monthNum: num(start, { month: "numeric" }),
      year: num(start, { year: "numeric" }),
      venue: e?.location_short || e?.location || "",
    };
  });
}
