<template>
  <footer class="border-border/60 mt-16 border-t pt-12 lg:mt-24">
    <div class="container space-y-12">
      <div class="grid gap-10 md:grid-cols-[1fr_2fr] lg:gap-16">
        <div class="space-y-5">
          <nuxt-link
            :to="localePath('/')"
            @click="$scrollToTopIfCurrentPageIs(localePath('/'))"
            v-ripple
            aria-label="Beranda"
            class="inline-block"
          >
            <Logo :class="useAppConfig().settings?.footer?.logoClass ?? 'h-8'" />
          </nuxt-link>

          <p class="text-muted-foreground max-w-xs text-sm tracking-tight text-pretty">
            Camping, rafting, dan outing di dua holiday park Jawa Barat: Jatiluhur di Purwakarta
            dan Cikidang di Sukabumi.
          </p>

          <SocialMedia class="gap-x-5" iconClasses="size-5" />
        </div>

        <nav v-if="footerGroups.length" class="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div v-for="group in footerGroups" :key="group.label" class="space-y-3">
            <h2 class="text-sm font-medium tracking-tight">{{ group.label }}</h2>
            <ul class="space-y-2">
              <li v-for="link in group.links" :key="link.path">
                <nuxt-link
                  :to="localePath(link.path)"
                  class="text-muted-foreground hover:text-foreground text-sm tracking-tight transition-colors"
                  @click="$scrollToTopIfCurrentPageIs(localePath(link.path))"
                >
                  {{ link.label }}
                </nuxt-link>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div
        class="border-border/60 text-muted-foreground flex flex-col gap-2 border-t py-8 text-xs tracking-tight sm:flex-row sm:items-center sm:justify-between sm:text-sm"
      >
        <span>
          <span class="hidden sm:inline">Copyright</span> ©
          {{ new Date().getFullYear() }}
          {{ useAppConfig().app?.company?.name ?? useAppConfig().app?.name }}. All rights
          reserved.
        </span>
        <span>{{ useAppConfig().app.name }}</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
const localePath = useLocalePath();

// Groups come straight from app.config `routes.footer`. Labels are already
// Indonesian, so no translation lookup is needed.
const footerGroups = computed(() => useAppConfig().routes?.footer ?? []);
</script>
