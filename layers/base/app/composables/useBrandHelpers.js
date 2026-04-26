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

export const displayBrandName = (name) =>
  (name || "")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
