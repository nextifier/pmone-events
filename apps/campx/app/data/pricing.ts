import type { Availability, Pricing, PricingInput } from "./types";

/**
 * Fills in the two derived amounts on a `Pricing` object.
 *
 * `fromAmount` and `toAmount` are never authored by hand. Cards, the price
 * sort, and the AggregateOffer JSON-LD all read them, so a hand-written value
 * that drifts from `tiers` would show one price and charge another.
 *
 * Throws on an empty tier list. A package with no price is a data mistake, and
 * failing at module load turns it into a config error the build reports by name
 * instead of a silent "Rp0" on a live page.
 */
export function derivePricing(input: PricingInput): Pricing {
  if (!input.tiers.length) {
    throw new Error("[campx/data] Pricing needs at least one tier.");
  }

  const amounts = input.tiers.map((tier) => tier.amount);

  return {
    ...input,
    fromAmount: Math.min(...amounts),
    toAmount: Math.max(...amounts),
  };
}

/**
 * "No restriction recorded" — the honest default.
 *
 * Every package gets an `availability`, and most of them genuinely have nothing
 * published: no seasonal window, no closed dates, no lead time. Spelling that
 * out beats leaving the field optional, because "we do not know" and "there is
 * no restriction" then stop looking identical.
 */
export function alwaysAvailable(note: string | null = null): Availability {
  return { days: [], season: null, closedDates: [], leadTimeDays: null, note };
}

/** Shorthand for the common "one price, every day" case. */
export function flatRate(amount: number, label = "Harga per orang"): Pricing["tiers"] {
  return [
    {
      id: "flat",
      label,
      amount,
      rateType: "flat",
      days: null,
      conditions: null,
      order: 1,
    },
  ];
}

/**
 * Weekday/weekend pair, the shape every overnight package uses.
 *
 * Weekend covers Friday, Saturday and Sunday, matching how CampX quotes it —
 * not the calendar definition. Day numbers follow `Date#getDay()`.
 */
export function weekdayWeekendRates(weekday: number, weekend: number): Pricing["tiers"] {
  return [
    {
      id: "weekday",
      label: "Weekday (Senin-Kamis)",
      amount: weekday,
      rateType: "weekday",
      days: [1, 2, 3, 4],
      conditions: null,
      order: 1,
    },
    {
      id: "weekend",
      label: "Weekend (Jumat-Minggu)",
      amount: weekend,
      rateType: "weekend",
      days: [5, 6, 0],
      conditions: null,
      order: 2,
    },
  ];
}

/** Duration-priced rentals: jetski, jetcar, paddle board. */
export function durationRates(rates: { label: string; amount: number }[]): Pricing["tiers"] {
  return rates.map((rate, index) => ({
    id: `duration-${index + 1}`,
    label: rate.label,
    amount: rate.amount,
    rateType: "duration" as const,
    days: null,
    conditions: null,
    order: index + 1,
  }));
}
