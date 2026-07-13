import type { ComputedRef } from "vue";

type NavLink = {
  label: string;
  path: string;
  rightClickLink?: string;
  hidden?: boolean;
};

type NavItem = NavLink | { label: string; links: NavLink[]; hidden?: boolean };

/**
 * Returns the configured nav routes merged with dynamic items that depend on
 * runtime website settings (e.g. the Hotels section toggle).
 *
 * The base list is sourced from the dashboard-managed `site_config.nav`
 * (plan 008) when the project has saved one, falling back to the baked
 * `app.config.ts` `routes[source]` otherwise (fail-open rule - see
 * `docs/site-config-contract.md`). It reads the SSR-awaited settings payload
 * via `useNuxtData("project-settings")`, so the resolved nav is already in the
 * server HTML - no client-only nav, no hydration mismatch, no CLS.
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

  return computed<NavItem[]>(() => {
    // Read the SSR-resolved settings payload at ACCESS time via useNuxtData
    // (the shared `project-settings` asyncData the projectSettings plugin
    // already awaited). Capturing the ref at setup instead returned the
    // `default: null` in component contexts, so the dashboard nav silently fell
    // back to baked app.config routes - the bug this composable exists to fix.
    const settings = useNuxtData("project-settings").data.value as {
      data?: { settings?: { site_config?: { nav?: Record<string, NavItem[]> } } };
    } | null;
    const dashboardNav = settings?.data?.settings?.site_config?.nav?.[source];
    const rawBase = (
      Array.isArray(dashboardNav) && dashboardNav.length
        ? dashboardNav
        : ((config.routes as Record<string, NavItem[]>)?.[source] ?? [])
    ) as NavItem[];

    // Drop dashboard-hidden entries (temporary show/hide without deleting):
    // a hidden top-level item is removed outright; inside a group, hidden
    // links are stripped and a group left with no visible links is dropped
    // entirely so no empty dropdown renders. Only dashboard-managed navs carry
    // `hidden` - baked app.config routes never set it, so this is a no-op there.
    const base = rawBase
      .filter((i) => !i.hidden)
      .map((i) =>
        "links" in i && Array.isArray(i.links)
          ? { ...i, links: i.links.filter((l) => !l.hidden) }
          : i,
      )
      .filter(
        (i) => !("links" in i) || (i as { links: NavLink[] }).links.length > 0,
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
