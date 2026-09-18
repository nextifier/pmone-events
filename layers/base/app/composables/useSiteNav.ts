/**
 * The phone tab bar on the event sites: which tabs it has, which one is lit,
 * and whether this page shows it at all. The look (icons) lives in
 * SiteBottomNav.vue, as the admin app keeps its own in AppBottomNav.vue.
 */

export type SiteNavKey = "home" | "brands" | "rundown" | "exhibit" | "tickets";

export interface SiteNavItem {
  key: SiteNavKey;
  label: string;
  to: string;
}

/** Where each tab points, before the locale and edition prefixes. */
const TAB_PATHS: Record<SiteNavKey, string> = {
  home: "/",
  brands: "/brands",
  rundown: "/rundown",
  exhibit: "/book-space",
  tickets: "/tickets",
};

/**
 * The routes that light each tab, by base name (the i18n `___<locale>` suffix
 * stripped). A past edition keeps its section lit: `/25/brands` is still
 * Brands. Anything else (news, FAQ, programs) lights nothing. Detail pages
 * (a brand, an article, a guest) drop the bar altogether.
 */
const TAB_ROUTES: Record<SiteNavKey, string[]> = {
  home: ["index"],
  brands: ["brands", "edition-brands"],
  rundown: ["rundown", "edition-rundown"],
  exhibit: ["book-space"],
  tickets: ["tickets"],
};

export function useSiteNav() {
  const route = useRoute();
  const { t } = useI18n();
  const getRouteBaseName = useRouteBaseName();
  const editionPath = useEditionPath();
  const appConfig = useAppConfig();

  const items = computed<SiteNavItem[]>(() =>
    (Object.keys(TAB_PATHS) as SiteNavKey[]).map((key) => ({
      key,
      label: t(`bottomNav.${key}`),
      to: editionPath(TAB_PATHS[key]),
    })),
  );

  const activeKey = computed<SiteNavKey | "">(() => {
    const name = getRouteBaseName(route) ?? "";
    const key = (Object.keys(TAB_ROUTES) as SiteNavKey[]).find((candidate) =>
      TAB_ROUTES[candidate].includes(name),
    );

    return key ?? "";
  });

  /**
   * On where the app turns it on (`settings.bottomNav` in its app.config) and
   * the page has not opted out with `definePageMeta({ bottomNav: false })`:
   * checkout, the post-purchase ticket pages, forms, the hotel booking flow,
   * the detail pages (brand, article, guest), the lucky draw and the
   * link-in-bio page each carry their own bottom UI or stand on their own.
   */
  const showBottomNav = computed(
    () => appConfig.settings?.bottomNav === true && route.meta.bottomNav !== false,
  );

  return { items, activeKey, showBottomNav };
}
