<!--
  One entry in TableRowActions. It renders as a DropdownMenuItem or a
  ContextMenuItem depending on which of the two menus is drawing it, so a row's
  actions are written once and read the same from the ellipsis and from a
  right-click.

  `to` makes it an internal link, `href` an external one; otherwise it is a
  button and `select` fires when it is chosen. Either way the menu closes.
-->
<template>
  <component
    :is="surface === 'context' ? ContextMenuItem : DropdownMenuItem"
    :variant="variant"
    :disabled="disabled || loading"
    :as-child="isLink"
    @select="emit('select', $event)"
  >
    <component :is="to ? NuxtLink : 'a'" v-if="isLink" v-bind="linkAttrs">
      <slot name="icon">
        <Spinner v-if="loading" class="size-4 shrink-0" />
        <Icon v-else-if="icon" :name="icon" class="size-4 shrink-0" />
      </slot>
      <slot />
    </component>

    <template v-else>
      <slot name="icon">
        <Spinner v-if="loading" class="size-4 shrink-0" />
        <Icon v-else-if="icon" :name="icon" class="size-4 shrink-0" />
      </slot>
      <slot />
    </template>
  </component>
</template>

<script setup>
import { ContextMenuItem } from "@/components/ui/context-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { TABLE_ROW_ACTIONS_SURFACE } from "./context";

const props = defineProps({
  to: {
    type: [String, Object],
    default: null,
  },
  href: {
    type: String,
    default: null,
  },
  target: {
    type: String,
    default: null,
  },
  icon: {
    type: String,
    default: null,
  },
  variant: {
    type: String,
    default: "default",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["select"]);

const surface = inject(TABLE_ROW_ACTIONS_SURFACE, "dropdown");
const NuxtLink = resolveComponent("NuxtLink");

const isLink = computed(() => Boolean(props.to || props.href));

const linkAttrs = computed(() => {
  if (props.to) {
    return { to: props.to, target: props.target ?? undefined };
  }

  return {
    href: props.href,
    target: props.target ?? undefined,
    rel: props.target === "_blank" ? "noopener noreferrer" : undefined,
  };
});
</script>
