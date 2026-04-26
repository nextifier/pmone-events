import { h } from "vue";
import BrandTableNameCell from "../components/BrandTableNameCell.vue";
import { findInstagram, normalizeBoothNumber } from "./useBrandHelpers";

export const useBrandTableColumns = (brandBasePath, options = {}) => {
  const { $dayjs } = useNuxtApp();
  const { showProjectColumn } = options;

  const resolveBasePath = () =>
    typeof brandBasePath === "string" ? brandBasePath : brandBasePath?.value || "/brands";

  const isProjectColumnVisible = () =>
    typeof showProjectColumn === "boolean"
      ? showProjectColumn
      : showProjectColumn?.value || false;

  const Icon = resolveComponent("Icon");

  const columns = computed(() => {
    const base = [
      {
        accessorKey: "brand_name",
        header: () => h("span", { class: "pl-3" }, "Brand"),
        size: 280,
        enableSorting: true,
        enableHiding: false,
        sortingFn: (a, b) =>
          (a.original.brand_name || "").localeCompare(b.original.brand_name || ""),
        cell: ({ row }) =>
          h(
            "div",
            { class: "pl-3" },
            [
              h(BrandTableNameCell, {
                brand: row.original,
                brandBasePath: resolveBasePath(),
              }),
            ],
          ),
      },
      {
        accessorKey: "booth_number",
        header: "Booth",
        size: 110,
        enableSorting: true,
        sortingFn: (a, b) => {
          const x = normalizeBoothNumber(a.original.booth_number);
          const y = normalizeBoothNumber(b.original.booth_number);
          if (x === null && y !== null) return 1;
          if (y === null && x !== null) return -1;
          if (x === null && y === null) return 0;
          return x.localeCompare(y, undefined, { numeric: true });
        },
        cell: ({ row }) =>
          h(
            "span",
            { class: "text-sm tracking-tight" },
            row.original.booth_number || "-",
          ),
      },
      {
        accessorKey: "business_categories",
        header: "Categories",
        size: 200,
        enableSorting: false,
        cell: ({ row }) => {
          const cats = row.original.business_categories;
          const text = Array.isArray(cats) && cats.length ? cats.join(", ") : "-";
          return h(
            "span",
            {
              class: "text-muted-foreground line-clamp-1 text-sm tracking-tight",
              title: text,
            },
            text,
          );
        },
      },
      {
        id: "promotions_count",
        header: "Promotions",
        size: 110,
        enableSorting: true,
        accessorFn: (row) => row.promotions?.length || 0,
        cell: ({ row }) =>
          h(
            "span",
            { class: "text-sm tracking-tight tabular-nums" },
            row.original.promotions?.length || 0,
          ),
      },
      {
        id: "social",
        header: "Social",
        size: 80,
        enableSorting: false,
        enableHiding: true,
        cell: ({ row }) => {
          const instagram = findInstagram(row.original.links);
          if (!instagram) {
            return h("span", { class: "text-muted-foreground/50 text-sm" }, "-");
          }
          return h(
            "a",
            {
              href: instagram.url,
              target: "_blank",
              rel: "noopener noreferrer",
              "aria-label": "Instagram",
              class:
                "text-muted-foreground hover:text-primary inline-flex size-7 items-center justify-center rounded-md transition active:scale-95",
            },
            [h(Icon, { name: "ri:instagram-line", class: "size-4" })],
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Added",
        size: 130,
        enableSorting: true,
        cell: ({ row }) => {
          const date = row.original.created_at;
          if (!date) return h("span", { class: "text-muted-foreground text-sm" }, "-");
          return h(
            "span",
            {
              class: "text-muted-foreground text-sm tracking-tight whitespace-nowrap",
              title: $dayjs(date).format("MMMM D, YYYY [at] h:mm A"),
            },
            $dayjs(date).fromNow(),
          );
        },
      },
    ];

    if (!isProjectColumnVisible()) return base;

    const projectColumn = {
      id: "project",
      header: "Event",
      size: 200,
      enableSorting: true,
      accessorFn: (row) => row._project_title || "",
      sortingFn: (a, b) =>
        (a.original._project_title || "").localeCompare(b.original._project_title || ""),
      cell: ({ row }) => {
        const title = row.original._project_title;
        const img = row.original._project_img;
        if (!title) return h("span", { class: "text-muted-foreground/50 text-sm" }, "-");
        const children = [];
        if (img) {
          children.push(
            h("img", {
              src: img,
              alt: title,
              width: 24,
              height: 24,
              loading: "lazy",
              class: "bg-muted border-border size-6 shrink-0 rounded-full border object-cover",
            }),
          );
        }
        children.push(
          h(
            "span",
            {
              class: "text-muted-foreground truncate text-sm tracking-tight",
              title,
            },
            title,
          ),
        );
        return h("div", { class: "flex items-center gap-x-2" }, children);
      },
    };

    return [base[0], projectColumn, ...base.slice(1)];
  });

  return { columns };
};
