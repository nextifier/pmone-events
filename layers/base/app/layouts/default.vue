<template>
  <SidebarProvider>
    <SidebarInset>
      <Header />
      <main class="flex-auto">
        <slot />
      </main>

      <Footer v-if="!['links', 'winner'].some((n) => route.name?.toString().startsWith(n))" />

      <DialogRundown />
      <DialogEmbedMedia />
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup>
const route = useRoute();
</script>
