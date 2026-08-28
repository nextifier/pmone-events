import { markRaw, ref, computed, unref } from "vue";
import { refDebounced } from "@vueuse/core";
import {
  VALID_VIEW_MODES,
  normalizeBoothNumber,
} from "./useBrandHelpers";

const SORT_OPTIONS = [
  { label: "Recommended", val: "score" },
  { label: "Brand Name", val: "brand_name" },
  { label: "Booth Number", val: "booth_number" },
  { label: "Last Created", val: "-created_at" },
];

export const useBrandsListing = (opts = {}) => {
  const { edition = ref(null) } = opts;

  const localePath = useLocalePath();
  const appConfig = useAppConfig();
  const event = useEvent();

  // Conjunction/profile avatars come from PM One as a conversion object
  // ({ sm, md, ... }); the brand UI expects a plain URL string. `size` picks
  // the conversion: `sm` is 200x200 and only holds up in the 20-24px filter
  // rows, so anything rendered larger must ask for `md` (400x400) or it is
  // upscaled and reads blurry on a hi-DPI screen.
  const imgUrl = (image, size = "sm") =>
    image?.[size] || image?.sm || image?.url || image || null;

  const editionValue = computed(() => unref(edition));

  // ----- Search & filter state -----
  const searchInput = ref("");
  const debouncedSearchInput = refDebounced(searchInput, 300);
  const selectedCategories = ref([]);
  const selectedEvents = ref([]);

  const toggleCategoryFilter = (name, checked) => {
    if (checked) {
      if (!selectedCategories.value.includes(name)) {
        selectedCategories.value = [...selectedCategories.value, name];
      }
    } else {
      selectedCategories.value = selectedCategories.value.filter((c) => c !== name);
    }
  };

  const toggleEventFilter = (projectUsername, checked) => {
    if (checked) {
      if (!selectedEvents.value.includes(projectUsername)) {
        selectedEvents.value = [...selectedEvents.value, projectUsername];
      }
    } else {
      selectedEvents.value = selectedEvents.value.filter((u) => u !== projectUsername);
    }
  };

  const totalActiveFilters = computed(
    () => selectedCategories.value.length + selectedEvents.value.length,
  );

  // ----- View mode (cookie-persisted) -----
  const viewModeCookie = useCookie("brands-view-mode", {
    default: () => "grid",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  const viewMode = computed({
    get: () =>
      VALID_VIEW_MODES.includes(viewModeCookie.value)
        ? viewModeCookie.value
        : "grid",
    set: (v) => {
      if (VALID_VIEW_MODES.includes(v)) viewModeCookie.value = v;
    },
  });

  // ----- Sort -----
  const sortOptions = SORT_OPTIONS;
  const selectedSortOption = ref(SORT_OPTIONS[0]);
  const changeSelectedSortOption = (option) => {
    selectedSortOption.value = option;
  };

  // ----- Editions fetch -----
  // Shared key with Header.vue's picker — see useEditions().
  const { data: editions } = useEditions();

  const selectedEdition = computed(() => {
    if (editionValue.value) {
      return editions.value?.find(
        (e) => String(e.edition_number) === String(editionValue.value),
      );
    }
    return editions.value?.find((e) => e.is_active);
  });

  const brandBasePath = computed(() =>
    editionValue.value ? `/${editionValue.value}/brands` : "/brands",
  );

  const changeEdition = (item) => {
    if (item.is_active) {
      navigateTo(localePath("/brands"));
    } else {
      navigateTo(localePath(`/${item.edition_number}/brands`));
    }
  };

  // ----- Conjunction logic -----
  const hasConjunctions = computed(
    () => event.inConjunction?.list?.length > 0,
  );
  const useConjunctionEndpoint = computed(
    () => hasConjunctions.value && !editionValue.value,
  );

  const getConjunction = (projectUsername) =>
    event.inConjunction?.list?.find(
      (c) => c.projectUsername === projectUsername,
    ) ?? null;

  const getConjunctionImg = (projectUsername, size = "sm") =>
    imgUrl(getConjunction(projectUsername)?.img, size);

  /**
   * Brands page of a conjunction event's own site. `url` is the project's
   * "Website" link, so it can arrive with or without a trailing slash and is
   * always cross-origin. No locale prefix: the sibling sites don't all ship the
   * same locale set, and a missing one would 404 - `/brands` always exists.
   */
  const getConjunctionBrandsUrl = (projectUsername) => {
    const website = getConjunction(projectUsername)?.url;
    if (!website) return null;
    try {
      const url = new URL(website);
      url.pathname = `${url.pathname.replace(/\/+$/, "")}/brands`;
      return url.toString();
    } catch {
      return null;
    }
  };

  // ----- Brands fetch -----
  const brandsUrl = computed(() => {
    if (useConjunctionEndpoint.value) return "/api/exhibitors/with-conjunctions";
    return editionValue.value
      ? `/api/exhibitors/by-edition/${editionValue.value}`
      : "/api/exhibitors";
  });

  // Staff preview: `?force-show-brands` reveals the list (and the conjunction
  // groups) while the event's brands switch is off, so content can be staged on
  // production. The forced payload gets its own data key so it can never be
  // reused for a public visitor after client-side navigation.
  const forceShowBrands = useForceShow("force-show-brands");

  const {
    data: rawData,
    refresh,
    pending: fetchPending,
    error,
  } = useFetch(brandsUrl, {
    lazy: true,
    server: false, // client-only: keeps SSR HTML/payload small; SEO via sitemap
    query: computed(() =>
      forceShowBrands.value ? { force_show_brands: 1 } : {},
    ),
    key: `fetchExhibitors-${editionValue.value || "active"}-${
      useConjunctionEndpoint.value ? "conj" : "single"
    }${forceShowBrands.value ? "-forced" : ""}`,
    transform: (res) => (res?.data ? markRaw(res.data) : res?.data),
  });

  // Loading until the first response lands. With server:false the fetch runs
  // only on the client, so during SSR + the initial client tick rawData is null
  // while fetchPending may be false — treat that as loading (show skeleton, not
  // the empty state). A genuine empty result sets rawData to [] (truthy).
  const isLoading = computed(
    () => fetchPending.value || (rawData.value == null && !error.value),
  );

  // ----- Brand groups (metadata injected once at fetch level) -----
  const allBrandGroups = computed(() => {
    if (!rawData.value) return [];

    let groups;
    if (useConjunctionEndpoint.value && rawData.value?.groups) {
      groups = rawData.value.groups;
    } else {
      const brands = rawData.value?.groups
        ? rawData.value.groups[0]?.brands
        : rawData.value;
      groups = [
        {
          is_primary: true,
          event_title: event.title,
          project_username: appConfig.app.projectUsername,
          brands: brands || [],
        },
      ];
    }

    return groups.map((group) => ({
      ...group,
      brands: (group.brands || []).map((b) => ({
        ...b,
        _project_username: group.project_username,
        _project_title: group.event_title,
        _project_img: group.is_primary
          ? imgUrl(event.profileImage)
          : getConjunctionImg(group.project_username),
        _is_primary: !!group.is_primary,
      })),
    }));
  });

  const hasConjunctionGroups = computed(() =>
    allBrandGroups.value.some((g) => !g.is_primary && g.brands?.length),
  );

  const allBrands = computed(
    () => allBrandGroups.value?.flatMap((group) => group.brands || []) || [],
  );

  const availableEvents = computed(() =>
    (allBrandGroups.value || [])
      .map((group) => ({
        projectUsername: group.project_username,
        title: group.event_title,
        img: group.is_primary
          ? imgUrl(event.profileImage)
          : getConjunctionImg(group.project_username),
        count: group.brands?.length || 0,
        isPrimary: !!group.is_primary,
      }))
      .sort((a, b) => {
        if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
        return (
          b.count - a.count || (a.title || "").localeCompare(b.title || "")
        );
      }),
  );

  const availableCategories = computed(() => {
    const counts = new Map();
    for (const brand of allBrands.value) {
      const cats = brand.business_categories;
      if (!Array.isArray(cats)) continue;
      for (const raw of cats) {
        const name = typeof raw === "string" ? raw.trim() : "";
        if (!name) continue;
        counts.set(name, (counts.get(name) || 0) + 1);
      }
    }
    return Array.from(counts, ([name, count]) => ({ name, count })).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name),
    );
  });

  // ----- Pure filter & sort -----
  const filterBrands = (brands) => {
    if (!brands?.length) return brands;
    const search = debouncedSearchInput.value?.toLowerCase() || "";
    const normalizedSearch = search.replace(/[^\w\s]/gi, "").replace(/\s/g, "");
    const cats = selectedCategories.value;
    const events = selectedEvents.value;
    if (!search && cats.length === 0 && events.length === 0) return brands;

    return brands.filter((brand) => {
      if (events.length > 0 && !events.includes(brand._project_username)) {
        return false;
      }
      if (cats.length > 0) {
        const brandCats = Array.isArray(brand.business_categories)
          ? brand.business_categories
          : [];
        if (!cats.some((c) => brandCats.includes(c))) return false;
      }
      if (!search) return true;
      return (
        brand.brand_name?.toLowerCase().includes(search) ||
        brand.company_name?.toLowerCase().includes(search) ||
        brand.brand_description?.toLowerCase().includes(search) ||
        brand.business_categories?.toString().toLowerCase().includes(search) ||
        brand.booth_number
          ?.replace(/[^\w\s]/gi, "")
          .replace(/\s/g, "")
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  };

  const sortBrands = (brands) => {
    if (!brands?.length) return brands;
    const sorted = [...brands];
    const val = selectedSortOption.value?.val;
    if (val === "score") {
      sorted.sort((a, b) => {
        const diff = (b.score ?? 0) - (a.score ?? 0);
        if (diff !== 0) return diff;
        return (a.brand_name || "").localeCompare(b.brand_name || "");
      });
    } else if (val === "brand_name") {
      sorted.sort((a, b) =>
        (a.brand_name || "").localeCompare(b.brand_name || ""),
      );
    } else if (val === "-created_at") {
      sorted.sort((a, b) =>
        (b.created_at || "").localeCompare(a.created_at || ""),
      );
    } else if (val === "booth_number") {
      sorted.sort((a, b) => {
        const x = normalizeBoothNumber(a.booth_number);
        const y = normalizeBoothNumber(b.booth_number);
        if (x === null && y !== null) return 1;
        if (y === null && x !== null) return -1;
        if (x === null && y === null) return 0;
        return x.localeCompare(y, undefined, { numeric: true });
      });
    }
    return sorted;
  };

  // Filter only — independent of viewMode so toggling grid/card/table
  // doesn't trigger a full re-filter pass.
  const baseFilteredBrands = computed(() => filterBrands(allBrands.value));

  // Flat list — for search mode + counter. Table view delegates sort to TanStack.
  const filteredBrands = computed(() =>
    viewMode.value === "table"
      ? baseFilteredBrands.value
      : sortBrands(baseFilteredBrands.value),
  );

  // Map<groupIndex, Brand[]> — template reads each group's list once.
  // Pre-filtered groups split out so the heavier sort step is the only
  // thing that re-runs when sort option (or viewMode → table) changes.
  const baseFilteredGroups = computed(() => {
    const map = new Map();
    (allBrandGroups.value || []).forEach((group, idx) => {
      map.set(idx, filterBrands(group.brands || []));
    });
    return map;
  });

  const groupedFilteredSorted = computed(() => {
    const map = new Map();
    baseFilteredGroups.value.forEach((brands, idx) => {
      map.set(idx, sortBrands(brands));
    });
    return map;
  });

  const showProjectColumn = computed(() => {
    if (availableEvents.value.length <= 1) return false;
    if (selectedEvents.value.length === 1) return false;
    return true;
  });

  return {
    // search
    searchInput,
    debouncedSearchInput,

    // view mode
    viewMode,

    // sort
    sortOptions,
    selectedSortOption,
    changeSelectedSortOption,

    // filters
    selectedCategories,
    selectedEvents,
    totalActiveFilters,
    toggleCategoryFilter,
    toggleEventFilter,

    // edition
    editions,
    selectedEdition,
    brandBasePath,
    changeEdition,

    // data
    pending: isLoading,
    error,
    refresh,
    allBrandGroups,
    brandGroups: allBrandGroups,
    allBrands,
    availableEvents,
    availableCategories,
    filteredBrands,
    groupedFilteredSorted,
    hasConjunctionGroups,
    useConjunctionEndpoint,
    getConjunction,
    getConjunctionImg,
    getConjunctionBrandsUrl,
    showProjectColumn,
  };
};
