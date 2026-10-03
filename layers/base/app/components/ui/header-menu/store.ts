import { useState } from "#imports";
import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from "vue";
import { HEADER_MENU_UNDERLAY_WIDTH } from "./context";

export interface HeaderMenuSnapshot {
  open: boolean;
  underlay: boolean;
  width: string;
}

/**
 * State of a named menu, shared by key. It is what lets the page layer live in
 * a layout while the menu button and the menu are in the header: neither is an
 * ancestor of the other, so context cannot carry it.
 */
export function useHeaderMenuStore(name: string) {
  return useState<HeaderMenuSnapshot>(`header-menu:${name}`, () => ({
    open: false,
    underlay: false,
    width: HEADER_MENU_UNDERLAY_WIDTH,
  }));
}

/** Functions cannot travel in the payload, so the controls live here, on the client. */
const controls = new Map<string, (open: boolean) => void>();

export function registerHeaderMenuControl(name: string, setOpen: (open: boolean) => void) {
  onMounted(() => controls.set(name, setOpen));
  onBeforeUnmount(() => {
    if (controls.get(name) === setOpen) controls.delete(name);
  });
}

/** Open or close a named menu from anywhere, a keyboard shortcut for one. */
export function setHeaderMenuOpen(name: string, open: boolean) {
  controls.get(name)?.(open);
}

export function closeHeaderMenu(name: string) {
  setHeaderMenuOpen(name, false);
}

export interface HeaderMenuView {
  active: Ref<boolean>;
  open: Ref<boolean>;
  width: Ref<string>;
  close: () => void;
}

/** What the page layer needs, from the surrounding menu or from the named store. */
export function useHeaderMenuView(
  injected: (() => { underlay: Ref<boolean>; open: Ref<boolean>; underlayWidth: string; close: () => void }) | null,
  name: () => string | undefined,
): HeaderMenuView {
  const key = name();
  const store = key ? useHeaderMenuStore(key) : null;
  const active = computed(() => (injected ? Boolean(injected().underlay.value) : Boolean(store?.value.underlay)));
  const open = computed(() => active.value && (injected ? Boolean(injected().open.value) : Boolean(store?.value.open)));
  const width = computed(() => (injected ? injected().underlayWidth : (store?.value.width ?? HEADER_MENU_UNDERLAY_WIDTH)));
  return {
    active,
    open,
    width,
    close: () => (injected ? injected().close() : key ? closeHeaderMenu(key) : undefined),
  };
}

/**
 * The underlay effect only touches the page while the menu is open or closing.
 * A clip-path or a transform on an ancestor changes how fixed descendants behave,
 * so outside that window the page carries neither. `engaged` is that window;
 * `visual` is the open look, switched on a frame after `engaged` so the change
 * has a starting point to transition from.
 */
export function useUnderlayPhase(open: Ref<boolean>, active: Ref<boolean>, duration = 760) {
  const engaged = ref(false);
  const visual = ref(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  watch(
    () => [open.value, active.value] as const,
    ([isOpen, isActive]) => {
      clearTimeout(timer);
      if (isOpen && isActive) {
        engaged.value = true;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            if (open.value && active.value) visual.value = true;
          }),
        );
      } else {
        visual.value = false;
        timer = setTimeout(() => {
          engaged.value = false;
        }, duration);
      }
    },
  );
  onBeforeUnmount(() => clearTimeout(timer));
  return { engaged, visual };
}
