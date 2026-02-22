<template>
  <SidebarProvider>
    <SidebarInset>
      <Header />
      <main class="flex-auto">
        <slot />
      </main>

      <Footer v-if="!['links', 'winner'].includes(route.name)" />

      <DialogRundown />
      <DialogEmbedMedia />
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup>
const route = useRoute();
</script>
