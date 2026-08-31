<template>
  <nav
    :class="[
      'bg-background relative z-10 -mx-4 flex h-(--tabnav-height) shrink-0 sm:mx-0',
      // Nothing in the falsy branch on purpose. `relative` above keeps `z-10`
      // working when the nav is not sticky, and a `static` here would land in
      // the same Tailwind position group and win the cascade.
      props.sticky && 'sticky top-(--navbar-height-mobile) lg:top-(--navbar-height-desktop)',
    ]"
  >
    <!--
      The scrollport is a child, not the nav itself, because `scroll-fade-x`
      masks the element it sits on - background included. Masking the nav made
      its own `bg-background` fade out at the edges and whatever sits underneath
      (a hero banner, page content scrolling past a sticky nav) bled through.
      Keeping the background one level up leaves the mask to the tabs alone.
      This div is also what the indicator measures its `offsetLeft` against.
    -->
    <div
      class="no-scrollbar scroll-fade-x relative flex h-full w-full min-w-0 gap-x-5 overflow-x-auto px-4 sm:px-0"
    >
      <NuxtLink
        v-for="(tab, index) in tabs"
        :key="tab.value ?? tab.to"
        :ref="(el) => (tabRefs[index] = el?.$el || el)"
        :to="tab.to"
        :class="[
          'relative flex shrink-0 items-center justify-center gap-x-1.5 py-3 text-sm font-medium tracking-tight transition-colors select-none',
          isActive(tab) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        ]"
      >
        <Icon v-if="tab.icon" :name="tab.icon" class="size-4 shrink-0" />
        {{ tab.label }}
      </NuxtLink>

      <span
        v-if="indicatorStyle"
        class="bg-foreground absolute bottom-0 h-0.5 rounded-full transition-[left,width] duration-(--tabs-dur) ease-(--tabs-ease)"
        :style="indicatorStyle"
      />
    </div>
  </nav>
</template>

<script setup>
const props = defineProps({
  tabs: {
    type: Array,
    required: true,
  },
  /**
   * Turn off inside a page shell that is pinned to the viewport and therefore
   * never scrolls. The offset is measured from the nearest scrollport, and an
   * `overflow: hidden` shell becomes one, so a sticky nav there would be pushed
   * down by a second navbar height instead of staying put.
   */
  sticky: {
    type: Boolean,
    default: true,
  },
  /**
   * Match tabs on a query parameter instead of the path. Use it for tab strips
   * that filter one page rather than switching between child routes - every
   * tab then shares a path, so `startsWith` would light all of them up. Each
   * tab needs a `value`; the first tab is the default when the param is absent.
   */
  param: {
    type: String,
    default: null,
  },
});

const route = useRoute();
const tabRefs = ref([]);
const indicatorStyle = ref(null);

const isActive = (tab) => {
  if (props.param) {
    const current = route.query[props.param] ?? props.tabs[0]?.value;

    return tab.value === current;
  }

  if (tab.exact) {
    return route.path === tab.to || route.path === `${tab.to}/`;
  }
  if (tab.notFor?.some((path) => route.path.startsWith(path))) {
    return false;
  }
  if (tab.activeFor?.some((path) => route.path.startsWith(path))) {
    return true;
  }
  return route.path.startsWith(tab.to);
};

const updateIndicator = () => {
  const activeIndex = props.tabs.findIndex((tab) => isActive(tab));
  const activeEl = tabRefs.value[activeIndex];
  if (!activeEl) {
    indicatorStyle.value = null;
    return;
  }

  indicatorStyle.value = {
    left: `${activeEl.offsetLeft}px`,
    width: `${activeEl.offsetWidth}px`,
  };
};

onMounted(() => {
  nextTick(updateIndicator);
});

watch(
  () => route.fullPath,
  () => {
    nextTick(updateIndicator);
  }
);
</script>
