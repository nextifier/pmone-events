<template>
  <footer class="relative pt-16">
    <div class="container">
      <div class="flex flex-col items-center gap-y-1.5 text-center">
        <nuxt-link
          :to="localePath('/')"
          @click="$scrollToTopIfCurrentPageIs(localePath('/'))"
          v-ripple
          aria-label="Brand Logo"
        >
          <Logo class="text-accent h-12" />
        </nuxt-link>

        <!-- <nuxt-link
          to="https://askindo.id"
          target="_blank"
          class="mt-2 inline-flex items-center gap-1 text-sm tracking-tight text-black hover:underline sm:text-sm dark:text-gray-400"
        >
          <span>by ASKINDO</span>
        </nuxt-link> -->
      </div>

      <SocialMedia class="mt-10 gap-x-4" iconClasses="size-6 " />

      <div
        class="mt-8 flex items-center justify-center gap-x-2 text-xs sm:text-sm"
      >
        <nuxt-link
          :to="localePath('/terms')"
          class="hover:bg-muted hover:text-foreground rounded-full px-3 py-2 transition"
          >Terms</nuxt-link
        >
        <span class="h-1 w-px bg-gray-300 dark:bg-gray-700"></span>
        <nuxt-link
          :to="localePath('/privacy')"
          class="hover:bg-muted hover:text-foreground rounded-full px-3 py-2 transition"
          >Privacy</nuxt-link
        >
      </div>

      <div
        class="text-muted-foreground flex items-center justify-center pt-4 pb-8 text-center text-xs tracking-tight"
      >
        <span class="leading-relaxed"
          ><span class="hidden sm:inline">Copyright</span> ©
          {{ new Date().getFullYear() }} IICC - ASKINDO. All rights
          reserved.</span
        >
      </div>
    </div>
  </footer>
</template>

<script setup>
const localePath = useLocalePath();
</script>
