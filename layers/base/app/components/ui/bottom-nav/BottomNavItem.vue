<script setup lang="ts">
import { cn } from "@/lib/utils";
import { NuxtLink } from "#components";
import { Primitive } from "reka-ui";
import { computed, inject, ref, watch, type HTMLAttributes } from "vue";
import {
  BOTTOM_NAV_CONTEXT,
  BOTTOM_NAV_DEFAULTS,
  bottomNavContentClasses,
  bottomNavIconSizeClasses,
  bottomNavItemClasses,
  bottomNavItemSizeClasses,
  bottomNavLabelClasses,
  bottomNavLabelSizeClasses,
} from "./context";

const props = withDefaults(
  defineProps<{
    to?: string;
    icon?: string;
    activeIcon?: string;
    label?: string;
    badge?: number | boolean;
    exact?: boolean;
    active?: boolean;
    value?: string | number;
    as?: string;
    class?: HTMLAttributes["class"];
  }>(),
  {
    as: "button",
    // Without an explicit default Vue casts a missing number | boolean prop to false,
    // and every item would render a closed badge.
    badge: undefined,
  },
);

const emit = defineEmits<{ select: [] }>();

const route = useRoute();
const ctx = inject(BOTTOM_NAV_CONTEXT, null);

const size = computed(() => ctx?.size.value ?? BOTTOM_NAV_DEFAULTS.size);
const indicator = computed(
  () => ctx?.indicator.value ?? BOTTOM_NAV_DEFAULTS.indicator,
);
const labelDisplay = computed(
  () => ctx?.labelDisplay.value ?? BOTTOM_NAV_DEFAULTS.labelDisplay,
);
const labelPlacement = computed(
  () => ctx?.labelPlacement.value ?? BOTTOM_NAV_DEFAULTS.labelPlacement,
);

const isExternal = computed(() => props.to?.startsWith("http"));

const isActive = computed(() => {
  if (props.active === true) {
    return true;
  }
  if (props.value !== undefined && ctx?.selectedValue.value !== undefined) {
    return ctx.selectedValue.value === props.value;
  }
  if (!props.to) {
    return false;
  }
  if (props.exact || props.to === "/") {
    return route.path === props.to || route.path === `${props.to}/`;
  }
  return route.path.startsWith(props.to);
});

/**
 * An activeIcon (a filled glyph) marks the active state by itself, so the item
 * keeps one color in every state (see bottomNavItemClasses). Items without one,
 * custom icon slots included, are muted when inactive.
 */
const hasActiveIcon = computed(() => Boolean(props.activeIcon));

const showDot = computed(() => indicator.value === "dot" && isActive.value);

const showLabel = computed(() => Boolean(props.label) && labelDisplay.value !== "none");

const isBeside = computed(() => labelPlacement.value === "beside");
const hidesInactiveLabel = computed(() => isBeside.value && labelDisplay.value === "active");


/**
 * Label motion, transitions-dev 04 (text states swap). below keeps the label's
 * space and swaps its opacity, blur and offset. beside takes inactive labels
 * out of layout so items can resize; the label that appears enters from its
 * @starting-style while BottomNav slides the icons (FLIP) and the pill.
 */
const labelStateClass = computed(() => {
  const swap =
    "transition-[opacity,filter,translate] duration-(--text-swap-dur) ease-(--text-swap-ease) motion-reduce:transition-none";
  if (isBeside.value) {
    if (labelDisplay.value !== "active") {
      return "ms-2 px-0";
    }
    return isActive.value
      ? cn(
          "ms-2 px-0",
          swap,
          "starting:translate-y-(--text-swap-translate-y) starting:opacity-0 starting:blur-(--text-swap-blur)",
        )
      : "hidden";
  }
  if (labelDisplay.value !== "active") {
    return null;
  }
  return cn(
    swap,
    isActive.value
      ? "translate-y-0 opacity-100 blur-none"
      : "translate-y-(--text-swap-translate-y) opacity-0 blur-(--text-swap-blur)",
  );
});

const hasBadge = computed(() => props.badge !== undefined && props.badge !== null);
const badgeIsCount = computed(() => typeof props.badge === "number");
const showBadge = computed(() =>
  badgeIsCount.value ? (props.badge as number) > 0 : props.badge === true,
);

/**
 * A dot badge punches a round hole in the icon instead of wearing a ring in the
 * page color, so the gap shows whatever sits behind the icon: glass, the active
 * pill, a photo. The hole opens and closes with the dot (.t-badge-hole).
 */
const hasDotBadge = computed(() => hasBadge.value && !badgeIsCount.value);

/** Keeps the last count so the number does not flip to 0 while the badge pops out. */
const badgeText = ref("");
watch(
  () => props.badge,
  (value) => {
    if (typeof value === "number" && value > 0) {
      badgeText.value = value > 99 ? "99+" : String(value);
    }
  },
  { immediate: true },
);

/**
 * A count badge joins the name as "Inbox, 3" even when the label is visible;
 * the badge itself stays hidden from assistive tech so it is not read twice.
 */
const computedAriaLabel = computed(() => {
  if (!props.label) {
    return undefined;
  }
  if (badgeIsCount.value && showBadge.value) {
    return `${props.label}, ${badgeText.value}`;
  }
  if (!showLabel.value || hidesInactiveLabel.value) {
    return props.label;
  }
  return undefined;
});

const iconSwapClass =
  "[grid-area:1/1] size-full transition-[opacity,filter,scale] duration-(--icon-swap-dur) ease-(--icon-swap-ease) motion-reduce:transition-none";
const iconShownClass = "scale-100 opacity-100 blur-none";
const iconHiddenClass = "scale-(--icon-swap-start-scale) opacity-0 blur-(--icon-swap-blur)";

function handleSelect(): void {
  if (props.value !== undefined) {
    ctx?.select(props.value);
  }
  emit("select");
}
</script>

<template>
  <component
    :is="to ? NuxtLink : Primitive"
    :to="to || undefined"
    :as="to ? undefined : as"
    :type="!to && as === 'button' ? 'button' : undefined"
    :target="isExternal ? '_blank' : undefined"
    :rel="isExternal ? 'noopener noreferrer' : undefined"
    data-bottom-nav-item
    data-slot="bottom-nav-item"
    :data-state="isActive ? 'active' : 'inactive'"
    :data-has-active-icon="hasActiveIcon ? 'true' : undefined"
    :aria-current="isActive ? 'page' : undefined"
    :aria-label="computedAriaLabel"
    :class="
      cn(
        bottomNavItemClasses,
        bottomNavItemSizeClasses[size],
        isBeside ? 'flex-auto' : null,
        props.class,
      )
    "
    @click="handleSelect"
  >
    <span data-slot="bottom-nav-content" :class="bottomNavContentClasses[labelPlacement]">
      <span data-bottom-nav-icon class="relative inline-flex shrink-0">
        <span
          aria-hidden="true"
          data-slot="bottom-nav-icon"
          :data-open="hasDotBadge ? (showBadge ? 'true' : 'false') : undefined"
          :class="
            cn('inline-grid place-items-center', bottomNavIconSizeClasses[size], hasDotBadge && 't-badge-hole')
          "
        >
          <slot name="icon" :active="isActive">
            <Icon
              v-if="icon"
              :name="icon"
              :class="cn(iconSwapClass, activeIcon && isActive ? iconHiddenClass : iconShownClass)"
            />
            <Icon
              v-if="activeIcon"
              :name="activeIcon"
              :class="cn(iconSwapClass, isActive ? iconShownClass : iconHiddenClass)"
            />
          </slot>
        </span>

        <!-- transitions-dev 03 (notification badge): .t-badge slides in, .t-badge-dot pops,
             and for a dot the hole in the icon above opens with it. -->
        <span
          v-if="hasBadge"
          aria-hidden="true"
          :data-open="showBadge ? 'true' : 'false'"
          :class="cn('t-badge absolute', badgeIsCount ? '-top-1.5 -right-2' : '-top-0.5 -right-0.5')"
        >
          <span
            :class="
              cn(
                't-badge-dot bg-destructive',
                badgeIsCount
                  ? 'min-w-4 rounded-full px-1 py-0.5 text-center text-[0.625rem] leading-none font-medium tracking-tight text-white'
                  : 'size-2 rounded-full',
              )
            "
          >
            <template v-if="badgeIsCount">{{ badgeText }}</template>
          </span>
        </span>
      </span>

      <span
        v-if="showLabel"
        data-slot="bottom-nav-label"
        :class="cn(bottomNavLabelClasses, bottomNavLabelSizeClasses[size], labelStateClass)"
      >
        {{ label }}
      </span>
    </span>

    <span
      v-if="showDot"
      aria-hidden="true"
      class="bg-primary pointer-events-none absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full transition-[scale] duration-(--badge-pop-dur) ease-(--badge-pop-ease) starting:scale-0 motion-reduce:transition-none"
    />
  </component>
</template>
