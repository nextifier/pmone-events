<template>
  <footer class="pt-10 lg:pt-16">
    <div class="container">
      <div class="flex flex-col gap-x-2 gap-y-10 lg:flex-row lg:gap-x-8">
        <div class="flex shrink-0 flex-col items-center gap-y-1 lg:items-start">
          <nuxt-link
            :to="localePath('/')"
            @click="$scrollToTopIfCurrentPageIs(localePath('/'))"
            v-ripple
            aria-label="Brand Logo"
          >
            <Logo :class="useAppConfig().settings.footer.logoClass" />
          </nuxt-link>
        </div>
        <div
          class="grid grow grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-x-2 gap-y-10 lg:gap-x-4"
        >
          <div
            v-for="(item, index) in useAppConfig().routes.footer"
            :key="index"
            class="flex flex-col"
          >
            <span
              class="text-muted-foreground px-3 text-xs font-medium tracking-tight uppercase"
            >
              {{ tLabel(item.label) }}
            </span>

            <div class="mt-3 flex flex-col gap-y-0.5">
              <NuxtLink
                v-for="(link, index) in item.links"
                :key="index"
                :to="lp(link.path)"
                :target="link.path.startsWith('http') ? '_blank' : ''"
                @click="$scrollToTopIfCurrentPageIs(lp(link.path))"
                @contextmenu="
                  (event) => {
                    if (link.rightClickLink) {
                      event.preventDefault();
                      navigateTo(link.rightClickLink, {
                        external: true,
                        open: { target: '_blank' },
                      });
                    }
                  }
                "
                class="text-primary hover:bg-muted rounded-lg px-3 py-1 text-base font-medium tracking-[-0.04em]"
                active-class="bg-muted text-primary"
                >{{ tLabel(link.label) }}</NuxtLink
              >
            </div>
          </div>
        </div>
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
const { t, te } = useI18n();
const lp = (path) => (path?.startsWith("http") ? path : localePath(path));
const tLabel = (label) => {
  if (!label) return "";
  const key = `nav.${label}`;
  return te(key) ? t(key) : label;
};
</script>
