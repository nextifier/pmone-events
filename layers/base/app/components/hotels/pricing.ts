import type { DateValue } from "@internationalized/date";

export type PricingDay = {
  rate: number | null;
  available: number;
};

export type PricingMap = Record<string, PricingDay>;

export function formatIsoDate(d: DateValue): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.year}-${pad(d.month)}-${pad(d.day)}`;
}

/**
 * Compact Rupiah for a calendar cell, on the same Indonesian short scale as
 * useFormatters' formatRupiahCompact (rb, jt, miliar, never an English "M"),
 * but with no space before the suffix and thousands rounded to a whole "rb",
 * so the rate fits under the day number.
 */
export function formatRupiahShort(value: number): string {
  const short = (v: number, suffix: string) =>
    `Rp${v.toLocaleString("id-ID", { maximumFractionDigits: 1 })}${suffix}`;
  if (value >= 1_000_000_000) return short(value / 1_000_000_000, "miliar");
  if (value >= 1_000_000) return short(value / 1_000_000, "jt");
  if (value >= 1_000) return short(Math.round(value / 1_000), "rb");
  return `Rp${Math.round(value)}`;
}

/**
 * The `YYYY-MM-DD` window spanned by `months` calendar months starting at
 * `start`: the first day of the start month through the last day of the final
 * visible month. Used to lazy-load pricing for whatever the calendar shows.
 */
export function visibleMonthRange(start: DateValue, months: number): { start: string; end: string } {
  const pad = (n: number) => String(n).padStart(2, "0");
  const last = start.add({ months: Math.max(0, months - 1) });
  const lastMonthDays = new Date(last.year, last.month, 0).getDate();
  return {
    start: `${start.year}-${pad(start.month)}-01`,
    end: `${last.year}-${pad(last.month)}-${pad(lastMonthDays)}`,
  };
}
