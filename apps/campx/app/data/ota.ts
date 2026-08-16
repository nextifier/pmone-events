import type { Location, OtaLink, OtaProvider, OtaProviderSlug, Package } from "./types";

/**
 * Online travel agents CampX is listed on.
 *
 * These are a secondary channel: WhatsApp stays the primary CTA because the
 * activity packages (rafting, paintball, ATV, flying fox) are not sold on any
 * OTA at all. Only the overnight stays are.
 *
 * Neither simple-icons nor hugeicons ships an Agoda or Traveloka brand mark, and
 * drawing an approximation of someone else's logo is worse than not showing one.
 * Each row carries a neutral outbound-link icon and lets the provider name do
 * the identifying.
 */
export const OTA_PROVIDERS: OtaProvider[] = [
  { slug: "agoda", name: "Agoda", icon: "hugeicons:link-square-02", order: 10 },
  { slug: "traveloka", name: "Traveloka", icon: "hugeicons:link-square-02", order: 20 },
  { slug: "tiket-com", name: "tiket.com", icon: "hugeicons:link-square-02", order: 30 },
  { slug: "trip-com", name: "Trip.com", icon: "hugeicons:link-square-02", order: 40 },
];

const BY_SLUG = new Map(OTA_PROVIDERS.map((provider) => [provider.slug, provider]));

export function getOtaProvider(slug: OtaProviderSlug): OtaProvider | null {
  return BY_SLUG.get(slug) ?? null;
}

/** Jatiluhur is listed on four OTAs. Cikidang, opened Aug 2026, is on none yet. */
export const JATILUHUR_OTA_LINKS: OtaLink[] = [
  {
    providerSlug: "agoda",
    url: "https://www.agoda.com/campx-holiday-park/hotel/purwakarta-id.html",
    order: 10,
  },
  {
    providerSlug: "traveloka",
    url: "https://www.traveloka.com/id-id/hotel/indonesia/campx-holiday-park-9000003292278",
    order: 20,
  },
  {
    providerSlug: "tiket-com",
    url: "https://www.tiket.com/homes/indonesia/campx-jatiluhur-803001741761006499",
    order: 30,
  },
  {
    providerSlug: "trip-com",
    url: "https://id.trip.com/hotels/tegalwaru-hotel-detail-113564300/campx-holiday-park",
    order: 40,
  },
];

export const CIKIDANG_OTA_LINKS: OtaLink[] = [];

/**
 * Which OTA links a package shows.
 *
 * The rule: an explicit list on the package always wins. Otherwise the package
 * inherits its branch's list, but only when it is an overnight stay — Agoda and
 * Traveloka sell rooms, not rafting slots, and pointing a rafting page at a
 * hotel listing sends people somewhere they cannot buy what they came for.
 *
 * This lives in `data/` rather than in `useBooking()` because it is a rule about
 * the products, not about the interface. When these packages move into the PM
 * One CMS the rule moves with them; if it stayed in a composable it would have
 * to be rewritten from scratch on the other side.
 */
export function otaLinksFor(pkg: Package, location: Location | null): OtaLink[] {
  if (pkg.bookingChannels?.ota.length) return pkg.bookingChannels.ota;
  if (pkg.type !== "stay") return [];
  return location?.bookingChannels.ota ?? [];
}

/** Sorts links by `order` and drops any whose provider is not in the catalog. */
export function resolveOtaLinks(links: OtaLink[]): { provider: OtaProvider; url: string }[] {
  return links
    .map((link) => {
      const provider = BY_SLUG.get(link.providerSlug);
      return provider ? { provider, url: link.url, order: link.order } : null;
    })
    .filter((entry): entry is { provider: OtaProvider; url: string; order: number } => entry !== null)
    .sort((a, b) => a.order - b.order)
    .map(({ provider, url }) => ({ provider, url }));
}
