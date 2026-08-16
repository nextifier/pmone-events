import type { PriceUnit, Pricing } from "~/data/types";

/**
 * How a price is written on screen.
 *
 * One place, because the same number appears on cards, in the price table, in
 * the sticky booking bar, in the WhatsApp message and in JSON-LD. When those
 * disagree the visitor notices before we do.
 *
 * Compact ("Rp255rb") for cards and the sticky bar, full ("Rp255.000") for the
 * price table and anywhere the exact figure matters.
 */

const FULL_FORMATTER = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** What the price is counted per. Rendered right after the amount. */
const UNIT_LABEL: Record<PriceUnit, string> = {
  pax: "/orang",
  "pax-night": "/orang/malam",
  "unit-night": "/malam",
  unit: "/unit",
  boat: "/perahu",
  trip: "/trip",
  session: "/sesi",
};

export function usePriceDisplay() {
  const { format: compact } = useCurrencyFormat();

  const formatCompact = (amount: number | null | undefined): string =>
    amount === null || amount === undefined ? "" : compact(amount);

  const formatFull = (amount: number | null | undefined): string =>
    amount === null || amount === undefined
      ? ""
      : FULL_FORMATTER.format(amount).replace(/\s/g, "");

  const unitLabel = (unit: PriceUnit): string => UNIT_LABEL[unit] ?? "";

  /**
   * The headline price for a card.
   *
   * "Mulai" only appears when there is genuinely more than one tier. Writing
   * "mulai dari" over a single fixed price makes an exact number look like an
   * estimate.
   */
  const headline = (pricing: Pricing) => ({
    prefix: pricing.tiers.length > 1 ? "Mulai" : "",
    amount: pricing.fromAmount,
    compact: formatCompact(pricing.fromAmount),
    full: formatFull(pricing.fromAmount),
    unit: unitLabel(pricing.unit),
  });

  return { formatCompact, formatFull, unitLabel, headline };
}
