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
            useAppConfig().settings?.header?.logoClass ?? 'text-primary h-6'
          "
        />
      </nuxt-link>

      <div class="ml-auto flex h-full items-center gap-x-6">
        <HeaderNav
          class="hidden xl:absolute xl:left-1/2 xl:flex xl:-translate-x-1/2"
        />

        <div class="flex h-full shrink-0 items-center gap-x-2">
          <button
            @click="openContactDialog"
            class="hover:bg-primary/80 bg-primary text-primary-foreground h-8 items-center justify-center gap-x-1.5 rounded-md px-2.5 font-semibold tracking-tight select-none active:scale-98 sm:flex sm:h-9 sm:px-3"
          >
            Let's Talk
          </button>

          <!-- <LanguageSwitcher v-if="!route.name?.toString().startsWith('news')" /> -->

          <Tippy>
            <ColorModeToggle />
            <template #content>
              <span class="inline-flex items-center gap-x-1.5 tracking-tight">
                <span>Light / Dark Mode</span>
                <kbd class="keyboard-symbol">D</kbd>
              </span>
            </template>
          </Tippy>

          <Tippy v-if="route.name?.toString().startsWith('news-slug')">
            <button
              data-sidebar="trigger"
              data-slot="sidebar-trigger"
              class="text-primary hover:bg-muted flex size-8 items-center justify-center rounded-lg"
              @click="toggleSidebar"
            >
              <Icon
                v-if="open && !isMobile"
                name="hugeicons:sidebar-right-01"
                class="text-primary size-5"
              />
              <Icon
                v-else
                name="hugeicons:sidebar-right"
                class="text-primary size-5"
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
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { useSidebar } from "../../../../layers/base/app/components/ui/sidebar/utils";
const { toggleSidebar, open, isMobile } = useSidebar();

const route = useRoute();
const localePath = useLocalePath();
const { metaSymbol } = useShortcuts();

const isMenuOpen = ref(false);

const uiStore = useUiStore();
const openContactDialog = () => {
  uiStore.openContactDialog();
};
</script>
