<template>
  <header
    class="flex h-(--navbar-height-mobile) items-center justify-center text-sm lg:h-(--navbar-height-desktop)"
    :class="{
      'sticky inset-x-0 top-0 z-50': ![].includes(route.name),
      'bg-background': isMenuOpen,
      'border-border/30 bg-background/95 supports-backdrop-filter:bg-background/90 border-b backdrop-blur-sm':
        !isMenuOpen,
    }"
  >
    <nav class="container-wider flex h-full items-center">
      <nuxt-link
        :to="localePath('/')"
        aria-label="Home"
        @click="$scrollToTopIfCurrentPageIs(localePath('/'))"
        v-ripple
      >
        <Logo
          :class="
            useAppConfig().settings?.header?.logoClass ?? 'text-foreground h-6'
          "
        />
      </nuxt-link>

      <Transition name="header-edition">
        <div v-if="showEditionPicker" key="brands-edition" class="ml-2 flex">
          <HeaderBrandsEditionPicker :editions="editions" />
        </div>
      </Transition>

      <div class="ml-auto flex h-full items-center gap-x-6">
        <HeaderNav
          class="hidden xl:absolute xl:left-1/2 xl:flex xl:-translate-x-1/2"
        />

        <div class="flex h-full shrink-0 items-center gap-x-2">
          <nuxt-link
            :to="localePath('/book-space')"
            class="border-border text-foreground hover:bg-muted hidden items-center justify-center gap-x-2 rounded-xl border px-3 py-2 font-semibold tracking-tight select-none active:scale-98 sm:flex"
            @click="$scrollToTopIfCurrentPageIs(localePath('/book-space'))"
            v-ripple
          >
            <span>{{ $t("ui.bookSpace") }}</span>
          </nuxt-link>

          <nuxt-link
            :to="localePath('/tickets')"
            class="hover:bg-primary/80 bg-primary text-primary-foreground hidden items-center justify-center rounded-xl px-3 py-2 font-semibold tracking-tight select-none active:scale-98 sm:flex"
            @click="$scrollToTopIfCurrentPageIs(localePath('/tickets'))"
            v-ripple
            >{{ $t("ui.getTicket") }}</nuxt-link
          >

          <LanguageSwitcher />

          <ColorModeToggle v-if="!route.meta.colorMode" />

          <!-- The sidebar only holds the table of contents, and below 1024px
               that moved to the sticky ScrollSpyPopover — so on mobile news
               pages fall back to the regular menu. -->
          <Tippy
            v-if="route.name?.toString().startsWith('news-slug') && !isMobile"
          >
            <button
              data-sidebar="trigger"
              data-slot="sidebar-trigger"
              aria-label="Toggle Sidebar"
              class="text-foreground hover:bg-muted flex size-8 items-center justify-center rounded-lg"
              @click="toggleSidebar"
            >
              <Icon
                v-if="open && !isMobile"
                name="hugeicons:sidebar-right-01"
                class="text-foreground size-5"
              />
              <Icon
                v-else
                name="hugeicons:sidebar-right"
                class="text-foreground size-5"
              />
            </button>
            <template #content>
              <span class="inline-flex items-center gap-x-1.5 tracking-tight">
                <span>Toggle Sidebar</span>
                <kbd class="keyboard-symbol">{{ metaSymbol }} B</kbd>
              </span>
            </template>
          </Tippy>

          <Tippy v-else>
            <HeaderMenu v-model:open="isMenuOpen" />
            <template #content>
              <span class="inline-flex items-center gap-x-1.5 tracking-tight">
                <span>Open Menu</span>
                <kbd class="keyboard-symbol">M</kbd>
              </span>
            </template>
          </Tippy>

          <button
            v-if="route.name?.toString().startsWith('winner')"
            @click="toggleFullScreen"
            type="button"
            v-tippy="'Toggle Fullscreen'"
            aria-label="Toggle Fullscreen"
            class="text-foreground hover:bg-muted flex size-8 items-center justify-center rounded-lg"
          >
            <Icon name="lucide:fullscreen" class="text-foreground size-4" />
          </button>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.header-edition-enter-active {
  transition:
    opacity 320ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 320ms cubic-bezier(0.16, 1, 0.3, 1);
}
.header-edition-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}
.header-edition-enter-from {
  opacity: 0;
  transform: translateX(-10px) scale(0.9);
}
.header-edition-leave-to {
  opacity: 0;
  transform: translateX(-6px) scale(0.92);
}
</style>

<script setup>
import { useSidebar } from "@/components/ui/sidebar/utils";
const { toggleSidebar, open, isMobile } = useSidebar();

const route = useRoute();
const localePath = useLocalePath();
const { metaSymbol } = useShortcuts();

const isMenuOpen = ref(false);

const isEditionableRoute = computed(() => {
  const baseName = (route.name?.toString() ?? "").split("___")[0];
  return ["brands", "edition-brands", "rundown", "edition-rundown"].includes(
    baseName,
  );
});

const { data: editions } = useFetch("/api/editions", {
  transform: (res) => res.data,
});

const showEditionPicker = computed(
  () => isEditionableRoute.value && (editions.value?.length ?? 0) > 1,
);

function toggleFullScreen() {
  const elem = document.documentElement; // Target the entire document

  if (!document.fullscreenElement) {
    // Enter fullscreen mode
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  } else {
    // Exit fullscreen mode
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}
</script>
