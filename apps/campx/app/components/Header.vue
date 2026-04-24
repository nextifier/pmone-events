<template>
  <header
    class="border-border/30 bg-background/95 supports-backdrop-filter:bg-background/90 sticky inset-x-0 top-0 z-50 flex h-(--navbar-height-mobile) items-center justify-center border-b text-sm backdrop-blur-sm lg:h-(--navbar-height-desktop)"
  >
    <nav class="container-wider flex h-full items-center">
      <nuxt-link
        to="/"
        aria-label="Home"
        v-ripple
      >
        <Logo class="text-primary h-7" />
      </nuxt-link>

      <div class="ml-auto flex h-full items-center gap-x-6">
        <div class="flex h-full shrink-0 items-center gap-x-2">
          <ColorModeToggle />
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
</script>
