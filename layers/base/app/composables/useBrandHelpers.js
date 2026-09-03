export const VALID_VIEW_MODES = ["grid", "card", "table"];

export const VIEW_OPTIONS = [
  { value: "grid", label: "Grid view", icon: "hugeicons:layout-grid" },
  { value: "card", label: "Card view", icon: "hugeicons:grid-view" },
  { value: "table", label: "Table view", icon: "hugeicons:layout-table-01" },
];

export const findInstagram = (brand) =>
  brand?.links?.find((l) => l.url?.includes("instagram.com"));

export const hasInstagram = (brand) => Boolean(findInstagram(brand));

export const normalizeBoothNumber = (value) => {
  if (!value) return null;
  return value
    .split("&")[0]
    .replace(/[^\w\s-]/gi, "")
    .replace(/\s/g, "")
    .toUpperCase();
};

/**
 * Sort key for a booth, preferring the one the API builds.
 *
 * `booth_sort_key` is zero-padded server-side, so A-01, A-02, A-10 come out in
 * that order rather than A-1, A-10, A-2 - and it is keyed off the first pitch,
 * which is the only sane anchor for an exhibitor renting several ("B-20, SS-05").
 * The local normalization stays as the fallback for a cached response that
 * predates the key.
 */
export const boothSortValue = (brand) =>
  brand?.booth_sort_key || normalizeBoothNumber(brand?.booth_number);
