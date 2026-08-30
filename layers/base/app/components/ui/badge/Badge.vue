<script setup lang="ts">
import { cn } from "@/lib/utils";
import { reactiveOmit } from "@vueuse/core";
import type { PrimitiveProps } from "reka-ui";
import { Primitive } from "reka-ui";
import { computed } from "vue";
import type { HTMLAttributes } from "vue";
import type { BadgeVariants } from ".";
import {
  badgeDefaultIcons,
  badgeDotVariants,
  badgeIconVariants,
  badgeVariants,
  resolveBadgeVariant,
} from ".";

const props = defineProps<
  PrimitiveProps & {
    variant?: BadgeVariants["variant"];
    icon?: string;
    withIcon?: boolean;
    plain?: boolean;
    class?: HTMLAttributes["class"];
  }
>();

const delegatedProps = reactiveOmit(props, "class", "variant", "icon", "withIcon", "plain");

const resolvedVariant = computed(() => resolveBadgeVariant(props.variant));

const resolvedIcon = computed(
  () => props.icon ?? (props.withIcon ? badgeDefaultIcons[resolvedVariant.value] : undefined)
);
</script>

<template>
  <Primitive
    data-slot="badge"
    :class="cn(badgeVariants({ plain }), !plain && resolvedIcon && 'pr-2.5', props.class)"
    v-bind="delegatedProps"
  >
    <Icon
      v-if="resolvedIcon"
      :name="resolvedIcon"
      :class="badgeIconVariants({ variant: resolvedVariant })"
    />
    <span
      v-else-if="resolvedVariant !== 'outline'"
      :class="badgeDotVariants({ variant: resolvedVariant })"
      aria-hidden="true"
    />
    <!-- `min-w-0` so the content can ellipsize when a caller caps the badge's
         width (`max-w-full` inside a table cell, say). A flex item defaults to
         `min-width:auto`, which holds it at its content width - the badge then
         runs past its cell and what the reader sees is a rounded border sliced
         mid-word. Inert while the badge is unconstrained, which is the norm. -->
    <span class="min-w-0">
      <slot />
    </span>
  </Primitive>
</template>
