<template>
  <header
    class="border-border/30 bg-background/95 supports-backdrop-filter:bg-background/90 sticky inset-x-0 top-0 z-50 flex h-(--navbar-height-mobile) items-center justify-center border-b text-sm backdrop-blur-sm lg:h-(--navbar-height-desktop)"
    :class="{ 'bg-background': isMenuOpen }"
  >
    <nav
      class="flex h-full items-center transition-all duration-300"
      :class="isHomePage ? 'container-wider' : 'container'"
    >
      <NuxtLink
        to="https://askindo.id"
        aria-label="Back to ASKINDO Home Page"
        v-ripple
        class="bg-muted sm:hover:bg-muted flex items-center gap-x-1.5 rounded-full p-1 transition sm:bg-transparent sm:pr-3"
      >
        <div class="bg-muted flex size-8 items-center justify-center rounded-full">
          <Icon name="hugeicons:arrow-left-02" class="size-5 shrink-0" />
        </div>
        <LogoMarkAskindo class="h-8" />
        <span
          class="text-foreground hidden text-2xl font-semibold tracking-normal sm:block"
          >ASKINDO</span
        >
      </NuxtLink>

      <div class="ml-auto flex h-full items-center gap-x-6">
        <HeaderNav
          class="hidden xl:absolute xl:left-1/2 xl:flex xl:-translate-x-1/2"
        />

        <div class="flex h-full shrink-0 items-center gap-x-1.5">
          <button
            type="button"
            @click="handleRegisterClick"
            class="hover:bg-accent/80 bg-accent text-accent-foreground flex items-center justify-center rounded-lg px-3 py-1.5 font-medium tracking-tight select-none active:scale-98"
            v-ripple
          >
            Register
          </button>

          <LanguageSwitcher />

          <ColorModeToggle />

          <HeaderMenu v-model:open="isMenuOpen" />
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
const appConfig = useAppConfig();
const localePath = useLocalePath();
const route = useRoute();
const isHomePage = computed(() => route.path === "/" || route.path === "/id");

const isMenuOpen = ref(false);

const handleRegisterClick = () => {
  if (appConfig.ticket?.status !== "available") {
    return;
  }

  const url = appConfig.routes.visitorRegistration.path;
  if (url.startsWith("http")) {
    window.open(url, "_blank");
  } else {
    navigateTo(localePath(url));
  }
};
</script>
