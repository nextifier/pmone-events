import { getLocation } from "~/data/locations";
import { otaLinksFor, resolveOtaLinks } from "~/data/ota";
import type { Location, Package } from "~/data/types";

/**
 * Where the two order paths come from.
 *
 * WhatsApp is the primary channel and always available. OTA links are secondary
 * and which ones apply is a rule about the products, so it lives in
 * `data/ota.ts` as `otaLinksFor()` rather than here.
 *
 * The phone number is not in this repo. It comes from PM One via
 * `useProjectProfile()`, so every link here degrades to empty rather than
 * pointing at wa.me with a blank number.
 */

const TOKEN_PATTERN = /\{(package|location|price|url|pax|date)\}/g;

export function useBooking() {
  const profile = useProjectProfile();
  const appConfig = useAppConfig();
  const { formatCompact } = usePriceDisplay();

  const buildWhatsappUrl = (message: string): string => {
    if (!profile.whatsappNumber) return "";
    return `https://api.whatsapp.com/send?phone=${profile.whatsappNumber}&text=${encodeURIComponent(message)}`;
  };

  /**
   * Fills the template tokens. An unknown token is left as-is rather than
   * replaced with "undefined", so a typo in the data is visible instead of
   * silently shipping a broken sentence to a customer.
   */
  const fillTemplate = (
    template: string,
    values: Partial<Record<"package" | "location" | "price" | "url" | "pax" | "date", string>>,
  ) => template.replace(TOKEN_PATTERN, (match, token: string) => values[token as never] ?? match);

  const forPackage = (pkg: Package) => {
    const location = getLocation(pkg.locationSlug);
    const channels = pkg.bookingChannels ?? location?.bookingChannels ?? null;

    const template =
      pkg.whatsappTemplate ??
      channels?.whatsapp.template ??
      "Halo CampX {location}! Saya mau tanya paket {package}.";

    const message = fillTemplate(template, {
      package: pkg.title,
      location: location?.shortName ?? "",
      price: formatCompact(pkg.pricing.fromAmount),
      url: `${appConfig.app.url}/${pkg.locationSlug}/${pkg.slug}`,
    });

    return {
      whatsappUrl: buildWhatsappUrl(message),
      whatsappEnabled: channels?.whatsapp.enabled !== false && Boolean(profile.whatsappNumber),
      ota: resolveOtaLinks(otaLinksFor(pkg, location)),
      onlineBooking: channels?.onlineBooking ?? null,
      bookable: pkg.status === "available",
    };
  };

  const forLocation = (location: Location) => {
    const message = fillTemplate(location.bookingChannels.whatsapp.template, {
      package: "yang tersedia di sini",
      location: location.shortName,
      url: `${appConfig.app.url}/${location.slug}`,
    });

    return {
      whatsappUrl: buildWhatsappUrl(message),
      whatsappEnabled:
        location.bookingChannels.whatsapp.enabled && Boolean(profile.whatsappNumber),
      ota: resolveOtaLinks(location.bookingChannels.ota),
      onlineBooking: location.bookingChannels.onlineBooking,
    };
  };

  return { forPackage, forLocation, buildWhatsappUrl };
}
