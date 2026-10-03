<script setup lang="ts">
/**
 * The menu behind a site header's menu button: a Drawer that opens under the
 * header instead of over it, follows the finger and closes on a swipe. Wrap the
 * header's button and the panel in it:
 *
 *   <HeaderMenu v-model:open="open">
 *     <HeaderMenuTrigger />
 *     <HeaderMenuPanel>...</HeaderMenuPanel>
 *   </HeaderMenu>
 *
 * It renders no element of its own.
 *
 * The "underlay" variant is the other way to open a menu: at desktop width the
 * panel stays put underneath and the page itself slides away from it. Below
 * that width it is an ordinary full width sheet.
 */
import { Drawer } from "@/components/ui/drawer";
import { useMediaQuery, useResizeObserver, useVModel } from "@vueuse/core";
import { computed, onMounted, provide, ref, unref, watch } from "vue";
import { registerHeaderMenuControl, useHeaderMenuStore } from "./store";
import {
  HEADER_MENU_UNDERLAY_MIN_WIDTH,
  HEADER_MENU_UNDERLAY_WIDTH,
  headerMenuKey,
  type HeaderMenuSide,
  type HeaderMenuVariant,
} from "./context";

const props = withDefaults(
  defineProps<{
    open?: boolean;
    defaultOpen?: boolean;
    /** Edge the sheet slides in from. */
    side?: HeaderMenuSide;
    /**
     * straight: flush with the edge, no chrome, like a page of its own.
     * floating: an inset rounded card with a soft shadow.
     * glass: translucent and blurred, the page shows through.
     * full: the whole width, for a menu that takes over the screen.
     * underlay: the panel stays underneath and the page slides away from it.
     */
    variant?: HeaderMenuVariant;
    /** Height of the header the sheet hangs under. */
    offset?: string;
    /** Keep the sheet inside this element instead of the page. A selector or an element. */
    portalTo?: string | HTMLElement;
    /** Width of the underlay panel. A percentage is of the page. */
    underlayWidth?: string;
    /**
     * Share this menu's state under a name, so a HeaderMenuPage elsewhere in the
     * layout can follow it: `<HeaderMenuPage name="site">`.
     */
    name?: string;
  }>(),
  {
    open: undefined,
    defaultOpen: false,
    side: "right",
    variant: "straight",
    offset: "3.5rem",
    portalTo: undefined,
    underlayWidth: HEADER_MENU_UNDERLAY_WIDTH,
    name: undefined,
  },
);

const emit = defineEmits<{ "update:open": [value: boolean] }>();
const isOpen = useVModel(props, "open", emit, { passive: true, defaultValue: props.defaultOpen });

/**
 * Desktop is measured on the element the sheet is kept in when there is one, so
 * a menu shown in a frame follows the frame and not the window.
 */
const windowIsDesktop = useMediaQuery(`(min-width: ${HEADER_MENU_UNDERLAY_MIN_WIDTH}px)`);
const frame = ref<HTMLElement | null>(null);
const frameWidth = ref(0);
function resolveFrame() {
  const target = props.portalTo;
  frame.value = typeof target === "string" ? document.querySelector<HTMLElement>(target) : (target ?? null);
  frameWidth.value = frame.value?.clientWidth ?? 0;
}
const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
  resolveFrame();
});
watch(() => props.portalTo, resolveFrame, { flush: "post" });
useResizeObserver(frame, (entries) => {
  frameWidth.value = entries[0]?.contentRect.width ?? 0;
});
const isDesktop = computed(() => {
  return frame.value ? frameWidth.value >= HEADER_MENU_UNDERLAY_MIN_WIDTH : windowIsDesktop.value;
});
/** Only after mount, so the server render and the first client render agree. */
const underlay = computed(() => mounted.value && props.variant === "underlay" && isDesktop.value);

const openState = computed(() => Boolean(unref(isOpen)));

if (props.name) {
  const store = useHeaderMenuStore(props.name);
  watch(
    [openState, underlay, () => props.underlayWidth],
    ([open, active, width]) => {
      store.value = { open, underlay: active, width };
    },
    { immediate: true },
  );
  registerHeaderMenuControl(props.name, (value) => {
    isOpen.value = value;
  });
}

provide(headerMenuKey, () => ({
  side: props.side,
  variant: props.variant,
  offset: props.offset,
  portalTo: props.portalTo,
  open: openState,
  underlay,
  underlayWidth: props.underlayWidth,
  close: () => {
    isOpen.value = false;
  },
}));
</script>

<template>
  <Drawer v-model:open="isOpen" :side="side">
    <slot :open="isOpen" />
  </Drawer>
</template>
