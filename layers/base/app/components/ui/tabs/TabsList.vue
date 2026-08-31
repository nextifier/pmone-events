<script setup lang="ts">
import { cn } from "@/lib/utils";
import { TabsList, type TabsListProps } from "reka-ui";
import { computed, inject, type HTMLAttributes } from "vue";
import {
  TABS_CONTEXT,
  TABS_DEFAULTS,
  tabsListClasses,
  tabsListScrollClasses,
} from "./context";

defineOptions({ inheritAttrs: false });

const props = defineProps<TabsListProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;
  return delegated;
});

const ctx = inject(TABS_CONTEXT, null);
const variant = computed(() => ctx?.variant.value ?? TABS_DEFAULTS.variant);
const shellClass = computed(() => tabsListClasses[variant.value]);
const scrollClass = computed(() => tabsListScrollClasses[variant.value]);

/**
 * Two elements on purpose - see the note above `tabsListClasses`. The outer div
 * paints (background, border, radius) and is never masked; the reka TabsList
 * inside is the scrollport that carries `scroll-fade-x`, so the fade only eats
 * the tabs and never the strip they sit on.
 *
 * `class` is a declared prop, so it lands on the shell while `inheritAttrs`
 * sends every other attribute (`aria-label`, `id`, `data-*`) to the element
 * that actually holds `role="tablist"`.
 */
</script>

<template>
  <div :class="cn(shellClass, props.class)" data-slot="tabs-list">
    <TabsList v-bind="{ ...delegatedProps, ...$attrs }" :class="scrollClass">
      <slot />
    </TabsList>
  </div>
</template>
