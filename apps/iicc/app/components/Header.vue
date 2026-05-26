<template>
  <header
    class="border-border/30 bg-background/95 supports-backdrop-filter:bg-background/90 sticky inset-x-0 top-0 z-50 flex h-(--navbar-height-mobile) items-center justify-center border-b text-sm backdrop-blur-sm lg:h-(--navbar-height-desktop)"
    :class="{ 'bg-background': isMenuOpen }"
  >
    <nav
      class="flex h-full items-center transition-all duration-300"
      :class="isHomePage ? 'container-wider' : 'container'"
    >
      <div class="flex items-center gap-x-2">
        <Button
          to="https://askindo.id"
          variant="outline"
          size="iconSm"
          aria-label="Back to ASKINDO Home Page"
        >
          <Icon name="hugeicons:arrow-left-02" class="size-5 shrink-0" />
        </Button>

        <NuxtLink
          :to="localePath('/')"
          variant="outline"
          aria-label="ASKINDO Home"
          class="flex items-center gap-x-1.5"
          @click="$scrollToTopIfCurrentPageIs(localePath('/'))"
        >
          <LogoMarkAskindo class="h-8 shrink-0" />
          <span
            class="text-foreground hidden text-xl font-semibold tracking-normal sm:inline"
            >ASKINDO</span
          >
        </NuxtLink>
      </div>

      <div class="ml-auto flex h-full items-center gap-x-6">
        <HeaderNav
          class="hidden xl:absolute xl:left-1/2 xl:flex xl:-translate-x-1/2"
        />

        <div class="flex h-full shrink-0 items-center gap-x-1.5">
          <Button
            v-if="hotelVisible"
            :to="localePath('/hotels')"
            variant="secondary"
            size="sm"
            class="hidden xl:inline-flex"
          >
            {{ $t("hotels.bookNow") }}
          </Button>

          <Button
            size="sm"
            class="bg-accent text-accent-foreground hover:bg-accent/80"
            @click="handleBuyTicket"
          >
            {{ $t("tickets.buyNow") }}
          </Button>

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
const { visible: hotelVisible } = useHotelSectionVisibility();

const handleBuyTicket = () => {
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
