<template>
  <SidebarProvider>
    <SidebarInset>
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
  </SidebarProvider>
</template>

<script setup>
const route = useRoute();

// Dev-only loud signal for a missing content-store key (see
// plans/015-content-contract-and-campx-500.md). No-ops in production.
if (import.meta.dev) {
  watch(() => route.name, () => checkContentContract(route.name), {
    immediate: true,
  });
}
</script>
