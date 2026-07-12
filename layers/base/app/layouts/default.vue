<template>
  <SidebarProvider>
    <SidebarInset>
      <Header v-if="!route?.meta?.noHeader" :class="route?.meta?.headerClass" />
      <main class="flex-auto">
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
