<template>
  <SidebarProvider>
    <!-- pb: the phone tab bar's room (--app-bottom-inset, 0 without it), so
         the footer's last line clears the bar. -->
    <SidebarInset class="pb-(--app-bottom-inset)">
      <a
        href="#main"
        class="bg-background focus-visible:ring-ring sr-only rounded-lg px-4 py-2 text-sm font-medium shadow-lg outline-none focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:ring-2"
      >
        Skip to content
      </a>
      <Header v-if="!route?.meta?.noHeader" :class="route?.meta?.headerClass" />
      <main id="main" tabindex="-1" class="flex-auto outline-none">
        <slot />
      </main>

      <Footer
        v-if="
          !route?.meta?.noFooter &&
          !['brands', 'links', 'winner'].some((n) =>
            route?.name?.toString().includes(n),
          )
        "
      />

      <DialogRundown />
      <DialogEmbedMedia />
      <DialogContact v-if="useAppConfig().contactDialog" />
    </SidebarInset>

    <SiteBottomNav v-if="showBottomNav" />
  </SidebarProvider>
</template>

<script setup>
const route = useRoute();

/**
 * The phone tab bar and the room it takes. The flag sits on <body> rather than
 * on this layout because what has to clear the bar - the floating button,
 * toasts, the ticket cart bar - is fixed or mounted outside it; main.css turns
 * the flag into --app-bottom-inset. Rendered on the server too (and so into
 * the prerendered pages), so the first paint already pads the page.
 */
const { showBottomNav } = useSiteNav();

useHead({
  bodyAttrs: computed(() => ({
    "data-bottom-nav": showBottomNav.value ? "" : undefined,
  })),
});

installSiteChromeScroll(showBottomNav);

// Dev-only loud signal for a missing content-store key (see
// plans/015-content-contract-and-campx-500.md). No-ops in production.
if (import.meta.dev) {
  watch(() => route.name, () => checkContentContract(route.name), {
    immediate: true,
  });
}
</script>
