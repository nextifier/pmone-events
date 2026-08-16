import { resolveFacilities } from "~/data/facilities";
import type { Faq, Location, Package } from "~/data/types";

/**
 * Structured data, written by hand into `useHead`.
 *
 * nuxt-schema-org is disabled for every app in this monorepo (its unhead plugin
 * is incompatible with unhead v3 / Nuxt 4.5 and crashes head rendering), so
 * `useSchemaOrg` and `defineBreadcrumb` are registered as no-op stubs. Raw
 * `<script type="application/ld+json">` is the established pattern here — see
 * `layers/base/app/composables/useEventSchema.js` and `FAQ.vue`.
 *
 * Two rules that are not negotiable:
 *
 * 1. NEVER emit `aggregateRating`. The 4.6 on Google and 4.9 on TikTok are
 *    third-party scores for the business, not reviews collected on campx.id.
 *    Marking them up as our own is precisely what Google's review-snippet
 *    policy prohibits, and it risks a manual action. Show them in the UI with
 *    attribution and a link instead.
 *
 * 2. A builder returns `null` when a required field is missing, and the emitter
 *    drops nulls. A half-built node is worse than no node: it validates, gets
 *    indexed, and then says nothing.
 */

type JsonLdNode = Record<string, unknown> | null;

const ORG_ID = "#identity";

export function useJsonLd() {
  const appConfig = useAppConfig();
  const site = appConfig.app.url.replace(/\/+$/, "");
  const abs = (path: string) => `${site}${path.startsWith("/") ? path : `/${path}`}`;

  const buildOrganization = (socialUrls: string[] = []): JsonLdNode => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": abs(ORG_ID),
    name: appConfig.app.name,
    url: site,
    ...(socialUrls.length ? { sameAs: socialUrls } : {}),
  });

  /**
   * A branch is a `Campground`: a LodgingBusiness that is also a CivicStructure,
   * which is exactly what a campground with cabins and day visitors is.
   */
  const buildCampground = (location: Location): JsonLdNode => {
    if (!location.name || !location.address.regency) return null;

    const facilities = resolveFacilities(location.facilitySlugs);

    return {
      "@context": "https://schema.org",
      "@type": "Campground",
      "@id": abs(`/${location.slug}#business`),
      name: location.name,
      description: location.description,
      url: abs(`/${location.slug}`),
      image: abs(location.heroMedia.src),
      parentOrganization: { "@id": abs(ORG_ID) },
      address: {
        "@type": "PostalAddress",
        ...(location.address.line1 ? { streetAddress: location.address.line1 } : {}),
        addressLocality: location.address.district,
        addressRegion: location.address.province,
        ...(location.address.postalCode ? { postalCode: location.address.postalCode } : {}),
        addressCountry: "ID",
      },
      // Only when we actually know where it is. A fabricated pin is worse than
      // no geo at all.
      ...(location.geo
        ? {
            geo: {
              "@type": "GeoCoordinates",
              latitude: location.geo.lat,
              longitude: location.geo.lng,
            },
          }
        : {}),
      ...(location.googleMapsUrl ? { hasMap: location.googleMapsUrl } : {}),
      ...(facilities.length
        ? {
            amenityFeature: facilities.map((facility) => ({
              "@type": "LocationFeatureSpecification",
              name: facility.name,
              value: true,
            })),
          }
        : {}),
      // `checkinTime` only, not openingHoursSpecification: "24 hour support" is
      // a service level, not opening hours, and we do not have real ones.
      ...(location.hours?.checkIn
        ? { checkinTime: location.hours.checkIn.replace(".", ":") }
        : {}),
      ...(location.hours?.checkOut
        ? { checkoutTime: location.hours.checkOut.replace(".", ":") }
        : {}),
    };
  };

  /**
   * An offer for a package. Multiple tiers become an AggregateOffer with a low
   * and high price, because a single `price` would contradict the price table
   * right next to it.
   */
  const buildOffer = (pkg: Package) => {
    const url = abs(`/${pkg.locationSlug}/${pkg.slug}`);
    const availability =
      pkg.status === "available"
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock";

    if (pkg.pricing.tiers.length > 1) {
      return {
        "@type": "AggregateOffer",
        priceCurrency: pkg.pricing.currency,
        lowPrice: pkg.pricing.fromAmount,
        highPrice: pkg.pricing.toAmount,
        offerCount: pkg.pricing.tiers.length,
        availability,
        url,
      };
    }

    return {
      "@type": "Offer",
      priceCurrency: pkg.pricing.currency,
      price: pkg.pricing.fromAmount,
      availability,
      url,
    };
  };

  /** Trips with a real itinerary describe themselves better as a TouristTrip. */
  const buildPackage = (pkg: Package, location: Location | null): JsonLdNode => {
    if (!pkg.title) return null;

    const url = abs(`/${pkg.locationSlug}/${pkg.slug}`);
    const common = {
      "@context": "https://schema.org",
      name: pkg.title,
      description: pkg.shortDescription,
      url,
      ...(pkg.coverImage ? { image: abs(pkg.coverImage.src) } : {}),
      offers: buildOffer(pkg),
    };

    if (pkg.itinerary.length && pkg.type === "trip") {
      return {
        ...common,
        "@type": "TouristTrip",
        provider: { "@id": abs(ORG_ID) },
        itinerary: {
          "@type": "ItemList",
          itemListElement: pkg.itinerary
            .flatMap((day) => day.steps)
            .map((step, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: { "@type": "Place", name: step.title },
            })),
        },
      };
    }

    return {
      ...common,
      "@type": "Product",
      brand: { "@id": abs(ORG_ID) },
      ...(location ? { category: `${location.name}` } : {}),
    };
  };

  const buildBreadcrumbList = (items: { label: string; to: string }[]): JsonLdNode => {
    if (items.length < 2) return null;
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        item: abs(item.to),
      })),
    };
  };

  const buildItemList = (packages: Package[], name: string): JsonLdNode => {
    if (!packages.length) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name,
      numberOfItems: packages.length,
      itemListElement: packages.map((pkg, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: pkg.title,
        url: abs(`/${pkg.locationSlug}/${pkg.slug}`),
      })),
    };
  };

  /** Strips tags so the answer reads as plain text, which is what Google wants. */
  const buildFaqPage = (faqs: Faq[]): JsonLdNode => {
    if (!faqs.length) return null;
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
        },
      })),
    };
  };

  const buildService = (name: string, description: string): JsonLdNode => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType: "Corporate outing & team building",
    provider: { "@id": abs(ORG_ID) },
    areaServed: ["Jawa Barat", "Jabodetabek"],
  });

  /** Emits the nodes that survived their builders. */
  const emit = (nodes: JsonLdNode[]) => {
    const scripts = nodes
      .filter((node): node is Record<string, unknown> => node !== null)
      .map((node) => ({
        type: "application/ld+json" as const,
        innerHTML: JSON.stringify(node),
      }));

    if (scripts.length) useHead({ script: scripts });
  };

  return {
    abs,
    buildOrganization,
    buildCampground,
    buildPackage,
    buildBreadcrumbList,
    buildItemList,
    buildFaqPage,
    buildService,
    emit,
  };
}
