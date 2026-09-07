<script setup lang="ts">
import { cn } from "@/lib/utils";
import type { PrimitiveProps } from "reka-ui";
import { Primitive } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
  defineProps<
    PrimitiveProps & {
      showOnHover?: boolean;
      class?: HTMLAttributes["class"];
    }
  >(),
  {
    as: "button",
  }
);
</script>

<template>
  <Primitive
    data-slot="sidebar-menu-action"
    data-sidebar="menu-action"
    :class="
      cn(
        /*
          The `after` box is the hit area, and it is the only thing here allowed
          to be bigger than the button looks. Upstream switches it off at `lg`,
          which leaves the bare box as the mouse target on the widest screens -
          the ones this product is used on all day.

          So that retreat is now scoped to the sizes it was written for. A `lg`
          menu button is a 48px row (the sidebar header), where the action is a
          32px square and 8px of overhang still lands inside the row, so it keeps
          its hit area at every width. `default` and `sm` rows are 32px and 28px,
          where a hit area that outgrows the row starts answering for its
          neighbours; those keep the old behaviour exactly.
        */
        'cn-sidebar-menu-action flex items-center justify-center outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 lg:peer-data-[size=default]/menu-button:after:hidden lg:peer-data-[size=sm]/menu-button:after:hidden [&>svg]:shrink-0',
        showOnHover &&
          'peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 lg:opacity-0',
        props.class
      )
    "
    :as="as"
    :as-child="asChild"
  >
    <slot />
  </Primitive>
</template>
