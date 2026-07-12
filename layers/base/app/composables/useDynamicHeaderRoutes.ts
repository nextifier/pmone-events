import type { ComputedRef } from "vue";

type NavLink = {
  label: string;
  path: string;
  rightClickLink?: string;
};

type NavItem = NavLink | { label: string; links: NavLink[] };

/**
 * Returns the configured nav routes merged with dynamic items that depend on
 * runtime website settings (e.g. the Hotels section toggle).
 *
 * The base list is sourced from the dashboard-managed `site_config.nav`
 * (plan 008) when the project has saved one, falling back to the baked
 * `app.config.ts` `routes[source]` otherwise (fail-open rule - see
 * `docs/site-config-contract.md`). Because `useSiteConfig()` reads the
 * SSR-awaited settings payload, the resolved nav is already in the server
 * HTML - no client-only nav, no hydration mismatch, no CLS.
 *
 * When `show_hotel_section_on_home_page === true` (or `?show-hotel=true`), a
 * "Hotels" entry is injected into the source array:
 *   - desktop `header`: inserted after `/rundown` if present, otherwise before
 *     `/contact`, otherwise appended at the end
 *   - mobile `dialog`: inserted into the first group that has `links` using the
 *     same positional rules
 *   - `footer`: same positional rules, applied like `dialog` (groups only)
 *
 * Returns a plain computed array so existing template loops (`v-for`) can swap
 * `useAppConfig().routes[source]` for this with no other changes.
 */
export function useDynamicHeaderRoutes(
  source: "header" | "dialog" | "footer",
): ComputedRef<NavItem[]> {
  const { visible } = useHotelSectionVisibility();
  const config = useAppConfig();
  const siteConfig = useSiteConfig();

  return computed<NavItem[]>(() => {
    const dashboardNav = (siteConfig.nav as Record<string, NavItem[]> | null)
      ?.[source];
    const base = (
      Array.isArray(dashboardNav) && dashboardNav.length
        ? dashboardNav
        : ((config.routes as Record<string, NavItem[]>)?.[source] ?? [])
    ) as NavItem[];

    if (!visible.value) {
      return base;
    }

    const hotelsLink: NavLink = { label: "Hotels", path: "/hotels" };

    const insertInto = (list: NavLink[]): NavLink[] => {
      if (list.some((l) => l.path === hotelsLink.path)) {
        return list;
      }
      const rundownIdx = list.findIndex((l) => l.path === "/rundown");
      if (rundownIdx >= 0) {
        const next = list.slice();
        next.splice(rundownIdx + 1, 0, hotelsLink);
        return next;
      }
      const ticketsIdx = list.findIndex(
        (l) => l.path === "/#tickets" || l.path === "/tickets",
      );
      if (ticketsIdx >= 0) {
        const next = list.slice();
        next.splice(ticketsIdx + 1, 0, hotelsLink);
        return next;
      }
      const contactIdx = list.findIndex((l) => l.path === "/contact");
      if (contactIdx >= 0) {
        const next = list.slice();
        next.splice(contactIdx, 0, hotelsLink);
        return next;
      }
      return [...list, hotelsLink];
    };

    if (source === "header") {
      // Flat list of NavLink | group. Insert at top level (groups are skipped
      // by the matchers above, so insertion lands among plain links).
      const flat = base as NavItem[];
      if (flat.some((i) => "path" in i && i.path === hotelsLink.path)) {
        return flat;
      }
      const rundownIdx = flat.findIndex(
        (i) => "path" in i && i.path === "/rundown",
      );
      if (rundownIdx >= 0) {
        const next = flat.slice();
        next.splice(rundownIdx + 1, 0, hotelsLink);
        return next;
      }
      const ticketsIdx = flat.findIndex(
        (i) => "path" in i && (i.path === "/#tickets" || i.path === "/tickets"),
      );
      if (ticketsIdx >= 0) {
        const next = flat.slice();
        next.splice(ticketsIdx + 1, 0, hotelsLink);
        return next;
      }
      const contactIdx = flat.findIndex(
        (i) => "path" in i && i.path === "/contact",
      );
      if (contactIdx >= 0) {
        const next = flat.slice();
        next.splice(contactIdx, 0, hotelsLink);
        return next;
      }
      return [...flat, hotelsLink];
    }

    // dialog / footer: groups of { label, links }. Inject into first group
    // that has `links`. This matches the existing "Menu" / footer-column
    // group convention.
    const firstGroupIdx = base.findIndex(
      (i): i is { label: string; links: NavLink[] } => "links" in i,
    );
    if (firstGroupIdx < 0) {
      return base;
    }
    const next = base.slice();
    const group = next[firstGroupIdx] as { label: string; links: NavLink[] };
    next[firstGroupIdx] = {
      ...group,
      links: insertInto(group.links ?? []),
    };
    return next;
  });
}
