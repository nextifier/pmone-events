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
</script>
