<template>
  <NavigationMenu :disable-hover-trigger="true">
    <NavigationMenuList>
      <NavigationMenuItem
        v-for="(item, index) in useAppConfig().routes.header"
        :key="index"
        class="relative"
      >
        <NavigationMenuLink v-if="!item.links" as-child>
          <!-- Link dengan hash -->
          <NuxtLink
            v-if="item.path.includes('#')"
            :to="getBasePath(item.path)"
            v-scroll-to="getScrollToOptions(item.path)"
            class="text-muted-foreground hover:bg-muted relative flex h-full items-center justify-center gap-x-1 rounded-2xl px-3 py-2 tracking-tight transition select-none active:scale-98"
            active-class="text-primary"
            @contextmenu="handleContextMenu($event, item)"
          >
            <span>{{ item.label }}</span>
          </NuxtLink>
          <!-- Link tanpa hash -->
          <NuxtLink
            v-else
            :to="localePath(item.path)"
            class="text-muted-foreground hover:bg-muted relative flex h-full items-center justify-center gap-x-1 rounded-2xl px-3 py-2 tracking-tight transition select-none active:scale-98"
            active-class="text-primary"
            @click="$scrollToTopIfCurrentPageIs(localePath(item.path))"
            @contextmenu="handleContextMenu($event, item)"
          >
            <span>{{ item.label }}</span>
          </NuxtLink>
        </NavigationMenuLink>

        <NavigationMenuTrigger
          v-else
          class="text-muted-foreground hover:bg-muted relative flex h-full items-center justify-center gap-x-1 rounded-2xl py-2 pr-1.5 pl-3 tracking-tight transition select-none active:scale-98"
        >
          <span>{{ item.label }}</span>
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul class="flex flex-col gap-y-1">
            <li v-for="(link, index) in item.links" :key="index">
              <NavigationMenuLink as-child>
                <!-- Link dengan hash -->
                <NuxtLink
                  v-if="link.path.includes('#')"
                  :to="getBasePath(link.path)"
                  v-scroll-to="getScrollToOptions(link.path)"
                  class="text-foreground hover:bg-muted flex h-full w-full items-center gap-x-1.5 rounded-xl px-4 py-1 text-sm tracking-tight transition select-none active:scale-98 sm:text-base lg:py-2"
                  active-class="text-primary bg-muted"
                  @contextmenu="handleContextMenu($event, link)"
                >
                  <span>{{ link.label }}</span>
                </NuxtLink>
                <!-- Link tanpa hash -->
                <NuxtLink
                  v-else
                  :to="link.path.startsWith('/') ? localePath(link.path) : link.path"
                  :target="link.path.startsWith('http') ? '_blank' : ''"
                  class="text-foreground hover:bg-muted flex h-full w-full items-center gap-x-1.5 rounded-xl px-4 py-1 text-sm tracking-tight transition select-none active:scale-98 sm:text-base lg:py-2"
                  active-class="text-primary bg-muted"
                  @click="$scrollToTopIfCurrentPageIs(link.path.startsWith('/') ? localePath(link.path) : link.path)"
                  @contextmenu="handleContextMenu($event, link)"
                >
                  <span>{{ link.label }}</span>
                </NuxtLink>
              </NavigationMenuLink>
            </li>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
</template>

<script setup>
const localePath = useLocalePath();

// Offset untuk scroll (negatif supaya section tidak terpotong header)
const SCROLL_OFFSET = -100;

const getBasePath = (path) => {
  if (path.includes("#")) {
    return localePath(path.split("#")[0] || "/");
  }
  return localePath(path);
};

const getScrollToOptions = (path) => {
  if (path.includes("#")) {
    return {
      el: `#${path.split("#")[1]}`,
      offset: SCROLL_OFFSET,
    };
  }
  return {};
};

const handleContextMenu = (event, item) => {
  if (item.rightClickLink) {
    event.preventDefault();
    navigateTo(item.rightClickLink, {
      external: true,
      open: { target: "_blank" },
    });
  }
};
</script>
