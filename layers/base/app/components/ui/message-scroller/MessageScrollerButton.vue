<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed } from "vue";
import type { ButtonVariants } from "../button";
import { Button } from "../button";
import { cn } from "@/lib/utils";
import {
  useMessageScroller,
  useMessageScrollerScrollable,
} from "./context";
import type { MessageScrollerButtonDirection } from "./engine";

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    direction?: MessageScrollerButtonDirection;
    behavior?: ScrollBehavior;
    variant?: ButtonVariants["variant"];
    size?: ButtonVariants["size"];
    tabindex?: number;
  }>(),
  {
    direction: "end",
    behavior: "smooth",
    variant: "secondary",
    size: "iconSm",
  }
);

const { scrollToEnd, scrollToStart } = useMessageScroller();
const scrollable = useMessageScrollerScrollable();
const active = computed(() =>
  props.direction === "start" ? scrollable.value.start : scrollable.value.end
);

function onClick(event: MouseEvent): void {
  if (!active.value) {
    return;
  }
  // A host listener that calls preventDefault() means it is driving the scroll
  // itself, so check that before touching focus: blurring first would move the
  // caret for a handler that then cancels us.
  if (event.defaultPrevented) {
    return;
  }
  (event.currentTarget as HTMLElement).blur();
  if (props.direction === "start") {
    scrollToStart({ behavior: props.behavior });
  } else {
    scrollToEnd({ behavior: props.behavior });
  }
}
</script>

<template>
  <Button
    data-slot="message-scroller-button"
    :data-direction="direction"
    :data-active="active ? 'true' : 'false'"
    :data-variant="variant"
    :data-size="size"
    :variant="variant"
    :size="size"
    :tabindex="active ? props.tabindex : -1"
    :inert="active ? undefined : true"
    :class="
      cn(
        'absolute start-1/2 -translate-x-1/2 border-border bg-background text-foreground transition-[translate,scale,opacity] duration-200 hover:bg-muted hover:text-foreground data-[active=false]:pointer-events-none data-[active=false]:scale-95 data-[active=false]:opacity-0 data-[active=false]:duration-400 data-[active=false]:ease-[cubic-bezier(0.7,0,0.84,0)] data-[active=true]:translate-y-0 data-[active=true]:scale-100 data-[active=true]:opacity-100 data-[active=true]:ease-[cubic-bezier(0.23,1,0.32,1)] data-[direction=end]:bottom-4 data-[direction=end]:data-[active=false]:translate-y-full data-[direction=start]:top-4 data-[direction=start]:data-[active=false]:-translate-y-full rtl:translate-x-1/2 data-[direction=start]:[&_svg]:rotate-180',
        props.class
      )
    "
    @click="onClick"
  >
    <slot>
      <Icon name="hugeicons:arrow-down-02" />
      <span class="sr-only">{{
        direction === "end" ? "Scroll to end" : "Scroll to start"
      }}</span>
    </slot>
  </Button>
</template>
