<template>
  <footer class="pt-10 lg:pt-16">
    <div class="container">
      <div class="flex shrink-0 flex-col items-center">
        <nuxt-link
          :to="localePath('/')"
          @click="$scrollToTopIfCurrentPageIs(localePath('/'))"
          v-ripple
          aria-label="Brand Logo"
        >
          <Logo :class="useAppConfig().settings.footer.logoClass" />
        </nuxt-link>
      </div>

      <SocialMedia class="mt-10 gap-x-6" iconClasses="size-6" />

      <div
        class="text-muted-foreground flex items-center justify-center pt-8 pb-16 text-center text-xs"
      >
        <span
          ><span class="hidden sm:inline">Copyright</span> ©
          {{ new Date().getFullYear() }}
          {{ useAppConfig().app?.company?.name ?? useAppConfig().app?.name }}.
          All rights reserved.</span
        >
      </div>
    </div>
  </footer>
</template>

<script setup>
const localePath = useLocalePath();
const lp = (path) => (path?.startsWith("http") ? path : localePath(path));
</script>
