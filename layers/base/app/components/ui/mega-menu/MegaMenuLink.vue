<script setup lang="ts">
/**
 * A link. At the top level it is styled like a trigger; inside a content
 * panel it is unstyled apart from focus, and joins the staggered reveal.
 */
import { cn } from "@/lib/utils";
import { NavigationMenuLink } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { computed, inject } from "vue";
import { megaMenuContentKey, megaMenuKey } from "./context";
import { useRevealStyle } from "./useReveal";

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    active?: boolean;
    as?: string;
    /** "nav" looks like a trigger, "plain" carries no styling. Inferred from where it sits. */
    variant?: "nav" | "plain";
  }>(),
  { active: false, as: "a", variant: undefined },
);

const emit = defineEmits<{ select: [event: Event] }>();

const menu = inject(megaMenuKey)!;
const content = inject(megaMenuContentKey, null);
const resolved = computed(() => props.variant ?? (content ? "plain" : "nav"));
const style = useRevealStyle();

const nav =
  "inline-flex h-9 cursor-pointer items-center rounded-full px-3 text-sm font-medium tracking-tight whitespace-nowrap outline-none transition-colors hover:bg-black/[0.035] dark:hover:bg-white/8 focus-visible:ring-2 focus-visible:ring-ring data-[active]:bg-black/[0.035] dark:data-[active]:bg-white/8";
const plain =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function onSelect(event: Event) {
  emit("select", event);
  menu.closeMobile();
}
</script>

<template>
  <NavigationMenuLink
    :as="props.as"
    :active="active"
    data-slot="mega-menu-link"
    :data-reveal="content ? '' : undefined"
    :style="style"
    :class="cn(resolved === 'nav' ? nav : plain, menu.mode.value === 'mobile' && resolved === 'nav' && 'h-11 w-full rounded-lg px-3 text-base', props.class)"
    @select="onSelect"
  >
    <slot />
  </NavigationMenuLink>
</template>
