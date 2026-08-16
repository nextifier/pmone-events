import { CATEGORIES } from "~/data/categories";
import { LOCATIONS } from "~/data/locations";
import { PUBLIC_PACKAGES } from "~/data/packages";
import type { Audience, LocationSlug, Package, PackageType } from "~/data/types";

/**
 * Filtering and sorting for /paket.
 *
 * Modelled on the shape of `useBrandsListing` (search, multi-select facets,
 * derived counts, sort, active-filter count) but none of its machinery: that
 * one fetches thousands of remote rows and virtualises them. This works on 24
 * local objects, so there is no fetch, no pending state, no skeleton, no
 * virtualiser, and filtering is a single pure computed.
 *
 * Facet counts are computed against the OTHER active facets, so a facet never
 * offers a choice that would return nothing.
 */

export type SortKey = "rekomendasi" | "harga-asc" | "harga-desc" | "nama";

const TYPE_LABEL: Record<PackageType, string> = {
  stay: "Menginap",
  activity: "Aktivitas",
  trip: "Trip",
  outing: "Outing",
  pass: "Tiket harian",
};

const AUDIENCE_LABEL: Record<Audience, string> = {
  personal: "Sendiri atau berdua",
  keluarga: "Keluarga",
  grup: "Rombongan",
  korporat: "Kantor",
};

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "rekomendasi", label: "Rekomendasi" },
  { value: "harga-asc", label: "Harga terendah" },
  { value: "harga-desc", label: "Harga tertinggi" },
  { value: "nama", label: "Nama A-Z" },
];

/** Reads `?a=x,y` into an array, tolerating spaces and empty segments. */
function parseList(value: unknown): string[] {
  if (typeof value !== "string" || !value.trim()) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function usePackageCatalog() {
  const route = useRoute();
  const router = useRouter();

  const search = ref(typeof route.query.q === "string" ? route.query.q : "");
  const debouncedSearch = refDebounced(search, 250);

  const selectedLocations = ref<string[]>(parseList(route.query.lokasi));
  const selectedTypes = ref<string[]>(parseList(route.query.tipe));
  const selectedCategories = ref<string[]>(parseList(route.query.kategori));
  const selectedAudiences = ref<string[]>(parseList(route.query.untuk));
  const includeUnavailable = ref(route.query.status === "semua");

  const sort = ref<SortKey>(
    SORT_OPTIONS.some((option) => option.value === route.query.urut)
      ? (route.query.urut as SortKey)
      : "rekomendasi",
  );

  const toggle = (list: Ref<string[]>, value: string) => {
    const index = list.value.indexOf(value);
    if (index === -1) list.value = [...list.value, value];
    else list.value = list.value.filter((entry) => entry !== value);
  };

  const matchesSearch = (pkg: Package, term: string) => {
    if (!term) return true;
    const haystack = [
      pkg.title,
      pkg.subtitle ?? "",
      pkg.shortDescription,
      pkg.categorySlugs.join(" "),
      pkg.locationSlug,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  };

  /**
   * One predicate, with the ability to ignore a single facet. Ignoring a facet
   * is what makes that facet's own counts correct: a count must reflect what
   * would happen if you picked it, not what is showing now.
   */
  const passes = (pkg: Package, ignore?: "location" | "type" | "category" | "audience") => {
    if (!includeUnavailable.value && pkg.status !== "available") return false;
    if (!matchesSearch(pkg, debouncedSearch.value.trim().toLowerCase())) return false;

    if (
      ignore !== "location" &&
      selectedLocations.value.length &&
      !selectedLocations.value.includes(pkg.locationSlug)
    ) {
      return false;
    }
    if (ignore !== "type" && selectedTypes.value.length && !selectedTypes.value.includes(pkg.type)) {
      return false;
    }
    if (
      ignore !== "category" &&
      selectedCategories.value.length &&
      !pkg.categorySlugs.some((slug) => selectedCategories.value.includes(slug))
    ) {
      return false;
    }
    if (
      ignore !== "audience" &&
      selectedAudiences.value.length &&
      !pkg.audience.some((entry) => selectedAudiences.value.includes(entry))
    ) {
      return false;
    }
    return true;
  };

  const results = computed(() => {
    const filtered = PUBLIC_PACKAGES.filter((pkg) => passes(pkg));

    switch (sort.value) {
      case "harga-asc":
        return [...filtered].sort((a, b) => a.pricing.fromAmount - b.pricing.fromAmount);
      case "harga-desc":
        return [...filtered].sort((a, b) => b.pricing.toAmount - a.pricing.toAmount);
      case "nama":
        return [...filtered].sort((a, b) => a.title.localeCompare(b.title, "id"));
      default:
        return filtered;
    }
  });

  const locationFacets = computed(() =>
    LOCATIONS.map((location) => ({
      value: location.slug as string,
      label: location.shortName,
      count: PUBLIC_PACKAGES.filter(
        (pkg) => pkg.locationSlug === location.slug && passes(pkg, "location"),
      ).length,
    })),
  );

  const typeFacets = computed(() =>
    (Object.keys(TYPE_LABEL) as PackageType[])
      .map((type) => ({
        value: type as string,
        label: TYPE_LABEL[type],
        count: PUBLIC_PACKAGES.filter((pkg) => pkg.type === type && passes(pkg, "type")).length,
      }))
      .filter((facet) => facet.count > 0 || selectedTypes.value.includes(facet.value)),
  );

  const categoryFacets = computed(() =>
    CATEGORIES.map((category) => ({
      value: category.slug,
      label: category.name,
      icon: category.icon,
      count: PUBLIC_PACKAGES.filter(
        (pkg) => pkg.categorySlugs.includes(category.slug) && passes(pkg, "category"),
      ).length,
    })).filter((facet) => facet.count > 0 || selectedCategories.value.includes(facet.value)),
  );

  const audienceFacets = computed(() =>
    (Object.keys(AUDIENCE_LABEL) as Audience[])
      .map((audience) => ({
        value: audience as string,
        label: AUDIENCE_LABEL[audience],
        count: PUBLIC_PACKAGES.filter(
          (pkg) => pkg.audience.includes(audience) && passes(pkg, "audience"),
        ).length,
      }))
      .filter((facet) => facet.count > 0 || selectedAudiences.value.includes(facet.value)),
  );

  const activeFilterCount = computed(
    () =>
      selectedLocations.value.length +
      selectedTypes.value.length +
      selectedCategories.value.length +
      selectedAudiences.value.length +
      (includeUnavailable.value ? 1 : 0),
  );

  const hasQuery = computed(() => Boolean(debouncedSearch.value.trim()));

  function reset() {
    search.value = "";
    selectedLocations.value = [];
    selectedTypes.value = [];
    selectedCategories.value = [];
    selectedAudiences.value = [];
    includeUnavailable.value = false;
    sort.value = "rekomendasi";
  }

  /**
   * Mirror state into the query string so a filtered view can be shared and
   * linked to from the home page and the branch hubs.
   *
   * `replace`, not `push`: filtering is not navigation, and filling the back
   * stack with every checkbox click makes the back button useless.
   */
  const syncQuery = () => {
    const query: Record<string, string> = {};
    const term = debouncedSearch.value.trim();

    if (term) query.q = term;
    if (selectedLocations.value.length) query.lokasi = selectedLocations.value.join(",");
    if (selectedTypes.value.length) query.tipe = selectedTypes.value.join(",");
    if (selectedCategories.value.length) query.kategori = selectedCategories.value.join(",");
    if (selectedAudiences.value.length) query.untuk = selectedAudiences.value.join(",");
    if (includeUnavailable.value) query.status = "semua";
    if (sort.value !== "rekomendasi") query.urut = sort.value;

    if (JSON.stringify(query) === JSON.stringify(route.query)) return;
    router.replace({ query });
  };

  if (import.meta.client) {
    watch(
      [
        debouncedSearch,
        selectedLocations,
        selectedTypes,
        selectedCategories,
        selectedAudiences,
        includeUnavailable,
        sort,
      ],
      syncQuery,
      { deep: true },
    );
  }

  return {
    search,
    selectedLocations,
    selectedTypes,
    selectedCategories,
    selectedAudiences,
    includeUnavailable,
    sort,
    sortOptions: SORT_OPTIONS,
    toggleLocation: (value: string) => toggle(selectedLocations, value),
    toggleType: (value: string) => toggle(selectedTypes, value),
    toggleCategory: (value: string) => toggle(selectedCategories, value),
    toggleAudience: (value: string) => toggle(selectedAudiences, value),
    locationFacets,
    typeFacets,
    categoryFacets,
    audienceFacets,
    activeFilterCount,
    hasQuery,
    results,
    reset,
  };
}
