<template>
  <NavigationMenu :disable-hover-trigger="true">
    <NavigationMenuList>
      <NavigationMenuItem
        v-for="(item, index) in headerRoutes"
        :key="index"
        class="relative"
      >
        <NavigationMenuLink v-if="!item.links" as-child>
          <!-- Link dengan hash -->
          <NuxtLink
            v-if="item.path.includes('#')"
            :to="getBasePath(item.path)"
            v-scroll-to="getScrollToOptions(item.path)"
            class="hover:bg-muted relative flex h-full items-center justify-center gap-x-1 rounded-2xl px-3 py-2 tracking-tight transition select-none active:scale-98"
            :class="
              isHashItemActive(item) ? 'text-primary' : 'text-muted-foreground'
            "
            @contextmenu="handleContextMenu($event, item)"
          >
            <span>{{ item.label }}</span>
          </NuxtLink>
          <!-- Link tanpa hash -->
          <NuxtLink
            v-else
            :to="localePath(item.path)"
            class="hover:bg-muted relative flex h-full items-center justify-center gap-x-1 rounded-2xl px-3 py-2 tracking-tight transition select-none active:scale-98"
            :class="
              isPathItemActive(item) ? 'text-primary' : 'text-muted-foreground'
            "
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
const route = useRoute();
const dynamicHeaderRoutes = useDynamicHeaderRoutes("header");
// Hotels dipindah ke action buttons di Header.vue, jadi exclude dari nav center
const headerRoutes = computed(() =>
  dynamicHeaderRoutes.value.filter(
    (item) => !("path" in item) || item.path !== "/hotels"
  )
);

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

// ScrollSpy: lacak section yang sedang in-view di home page
const activeSection = ref("hero");
const homePath = computed(() => localePath("/"));
const isHome = computed(() => route.path === homePath.value);

const sectionIds = computed(() => {
  const ids = headerRoutes.value
    .filter((r) => r.path && r.path.includes("#"))
    .map((r) => r.path.split("#")[1])
    .filter(Boolean);
  // Hero selalu disertakan supaya link Home tetap bisa highlight di atas
  if (!ids.includes("hero")) ids.unshift("hero");
  return ids;
});

const isHashItemActive = (item) => {
  if (!isHome.value) return false;
  const hash = item.path.split("#")[1];
  return activeSection.value === hash;
};

const isPathItemActive = (item) => {
  const target = localePath(item.path);
  // Link Home: aktif saat di home dan section hero in-view (atau belum scroll)
  if (item.path === "/") {
    return (
      isHome.value &&
      (activeSection.value === "hero" || activeSection.value === null)
    );
  }
  return route.path === target;
};

let observer = null;
const observed = new Set();

const observeSections = () => {
  if (!observer) return;
  sectionIds.value.forEach((id) => {
    if (observed.has(id)) return;
    const el = document.getElementById(id);
    if (el) {
      observer.observe(el);
      observed.add(id);
    }
  });
};

onMounted(() => {
  if (typeof IntersectionObserver === "undefined") return;
  observer = new IntersectionObserver(
    (entries) => {
      const intersecting = entries.filter((e) => e.isIntersecting);
      if (!intersecting.length) return;
      // Pilih section dengan posisi paling atas yang masih masuk band
      intersecting.sort(
        (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
      );
      activeSection.value = intersecting[0].target.id;
    },
    {
      // Band aktif di tengah viewport supaya highlight muncul saat section mencapai pusat layar
      rootMargin: "-30% 0px -60% 0px",
      threshold: 0,
    }
  );

  observeSections();
  // Re-scan untuk Lazy components yang mount belakangan
  setTimeout(observeSections, 500);
  setTimeout(observeSections, 1500);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
  observed.clear();
});
</script>
