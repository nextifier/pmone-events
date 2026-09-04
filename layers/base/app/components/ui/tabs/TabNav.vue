<template>
  <!--
    `segmented` takes `tabsBarClasses`, the same row the five hand-built strips
    sit in, so a pill in a route nav and a pill switching content inside a page
    cannot end up two different heights again. `underline` is not that row - it
    is a band that runs edge to edge - so it keeps `--tabnav-height` instead.

    The sticky `z-10` here is deliberately not the row's own `z-20`: on a page
    with a pinned preview pane, this bar has to sit under the pane.
  -->
  <nav
    :class="[
      'relative z-10 shrink-0',
      isSegmented ? tabsBarClasses : 'bg-background -mx-4 flex h-(--tabnav-height) sm:mx-0',
      // Nothing in the falsy branch on purpose. `relative` above keeps `z-10`
      // working when the nav is not sticky, and a `static` here would land in
      // the same Tailwind position group and win the cascade.
      props.sticky && 'sticky top-(--navbar-height-mobile) lg:top-(--navbar-height-desktop)',
    ]"
  >
    <!-- `contents` for underline: the pill box disappears from layout entirely,
         so that variant keeps the exact structure it had. -->
    <div :class="isSegmented ? tabsListClasses.segmented : 'contents'">
    <!--
      The scrollport is a child, not the nav itself, because `scroll-fade-x`
      masks the element it sits on - background included. Masking the nav made
      its own `bg-background` fade out at the edges and whatever sits underneath
      (a hero banner, page content scrolling past a sticky nav) bled through.
      Keeping the background one level up leaves the mask to the tabs alone.
      This div is also what the indicator measures its `offsetLeft` against.
    -->
    <div
      :class="
        isSegmented
          ? tabsListScrollClasses.segmented
          : 'no-scrollbar scroll-fade-x relative flex h-full w-full min-w-0 gap-x-5 overflow-x-auto px-4 sm:px-0'
      "
    >
      <NuxtLink
        v-for="(tab, index) in tabs"
        :key="tab.value ?? tab.to"
        :ref="(el) => (tabRefs[index] = el?.$el || el)"
        :to="tab.to"
        :class="[
          'relative flex shrink-0 items-center justify-center gap-x-1.5 font-medium tracking-tight transition-colors select-none',
          isSegmented ? [tabsTriggerClasses.segmented, tabsTriggerSizeClasses.md] : 'py-3 text-sm',
          isActive(tab) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        ]"
      >
        <Icon v-if="tab.icon" :name="tab.icon" class="size-4 shrink-0" />
        {{ tab.label }}
      </NuxtLink>

      <span
        v-if="indicatorStyle"
        :class="
          isSegmented
            ? tabsIndicatorClasses.segmented
            : 'bg-foreground absolute bottom-0 h-0.5 rounded-full transition-[left,width] duration-(--tabs-dur) ease-(--tabs-ease)'
        "
        :style="indicatorStyle"
      />
      </div>
    </div>
  </nav>
</template>

<script setup>
import {
  tabsBarClasses,
  tabsIndicatorClasses,
  tabsListClasses,
  tabsListScrollClasses,
  tabsTriggerClasses,
  tabsTriggerSizeClasses,
} from "./context";

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
  },
  /**
   * `underline` is the page-level default: a full-bleed strip with a rule under
   * the active tab, which is what a route switcher looks like across the app.
   *
   * `segmented` borrows the pill group `Tabs` uses for switching content inside
   * one page. It suits a short, fixed set of sibling routes that read as views
   * of one record rather than separate pages, and it takes the classes from the
   * same table `Tabs` reads, so the two never drift apart.
   */
  variant: {
    type: String,
    default: "underline",
    validator: (value) => ["underline", "segmented"].includes(value),
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

const isSegmented = computed(() => props.variant === "segmented");

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

  // The two variants animate different properties, because their class tables
  // do: the underline rule slides on `left`, the segmented pill on `transform`.
  // Driving the wrong one leaves the indicator jumping instead of moving.
  indicatorStyle.value = isSegmented.value
    ? {
        transform: `translateX(${activeEl.offsetLeft}px)`,
        width: `${activeEl.offsetWidth}px`,
      }
    : {
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
