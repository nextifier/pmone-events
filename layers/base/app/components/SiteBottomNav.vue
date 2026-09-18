<template>
  <!-- The bar's top hairline is the header's bottom border, so the site is
       edged the same above and below: BottomNav's own default is
       foreground/20, while Header draws border-border/30. -->
  <BottomNav
    :model-value="pendingKey ?? activeKey"
    :class="cn(barClass, 'before:bg-border/30')"
    :inert="hidden || undefined"
    :data-hidden="hidden || undefined"
    :aria-label="t('bottomNav.label')"
    @update:model-value="onSelect"
  >
    <BottomNavItem
      v-for="item in items"
      :key="item.key"
      :value="item.key"
      :to="item.to"
      :label="item.label"
      :icon="ICONS[item.key].icon"
      :active-icon="ICONS[item.key].activeIcon"
    />
  </BottomNav>
</template>

<script setup lang="ts">
import { BottomNav, BottomNavItem } from "@/components/ui/bottom-nav";
import { cn } from "@/lib/utils";
import type { SiteNavKey } from "../composables/useSiteNav";

/**
 * The phone tab bar (below lg; BottomNav hides itself from lg up), the same bar
 * as the admin app's staff dashboard: default variant, labels under the icons,
 * Solar linear icons with their bold twin on the active tab. The tabs and the
 * active one come from useSiteNav, the hide-on-scroll state from useSiteChrome.
 * Tapping the active tab scrolls the page back to the top (BottomNav's
 * reselect).
 */
const { t } = useI18n();
const router = useRouter();
const { items, activeKey } = useSiteNav();
const { hidden, barClass } = useSiteChrome();

/**
 * The tab lights the moment it is tapped, not when the route settles: a native
 * bar answers the finger and the page follows. Cleared after every navigation,
 * so one that fails or is redirected hands the bar back to the route.
 */
const pendingKey = ref<SiteNavKey | null>(null);

function onSelect(key: string | number | undefined): void {
  if (key !== undefined && key !== activeKey.value) {
    pendingKey.value = key as SiteNavKey;
  }
}

const stopClearingPending = router.afterEach(() => {
  pendingKey.value = null;
});
onBeforeUnmount(stopClearingPending);

/**
 * style-guide: icon family. Solar linear with its bold twin as activeIcon, as
 * the admin app's bar does: a filled glyph marks the active tab by itself, and
 * Hugeicons ships stroke only. The one place on the sites that is not
 * Hugeicons, on purpose, so the two bars match. The names are also listed in
 * nuxt.config `icon.clientBundle.icons`, since they are built from this map.
 */
const ICONS: Record<SiteNavKey, { icon: string; activeIcon: string }> = {
  home: { icon: "solar:home-smile-linear", activeIcon: "solar:home-smile-bold" },
  brands: { icon: "solar:shop-2-linear", activeIcon: "solar:shop-2-bold" },
  rundown: { icon: "solar:clipboard-list-linear", activeIcon: "solar:clipboard-list-bold" },
  exhibit: { icon: "solar:case-round-linear", activeIcon: "solar:case-round-bold" },
  tickets: { icon: "solar:ticket-linear", activeIcon: "solar:ticket-bold" },
};
</script>
