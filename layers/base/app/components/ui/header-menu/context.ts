import type { InjectionKey, Ref } from "vue";

export type HeaderMenuSide = "right" | "left" | "top" | "bottom";
export type HeaderMenuVariant = "straight" | "floating" | "glass" | "full" | "underlay";

export interface HeaderMenuContext {
  side: HeaderMenuSide;
  variant: HeaderMenuVariant;
  /** Height of the header the sheet hangs under, any CSS length. */
  offset: string;
  /** Mount the sheet inside this element instead of on the page. */
  portalTo?: string | HTMLElement;
  open: Ref<boolean>;
  /** True when the underlay effect is on: variant "underlay" at desktop width. */
  underlay: Ref<boolean>;
  /** Width of the underlay panel, any CSS length. A percentage is of the page. */
  underlayWidth: string;
  close: () => void;
}

export const headerMenuKey: InjectionKey<() => HeaderMenuContext> = Symbol("header-menu");

/** Width at which the underlay effect starts, as a media query or a container width. */
export const HEADER_MENU_UNDERLAY_MIN_WIDTH = 768;
export const HEADER_MENU_UNDERLAY_WIDTH = "clamp(22rem, 33.333%, 30rem)";

/** Handed to the lines of an underlay panel so each knows its place in the sequence. */
export const headerMenuPanelKey: InjectionKey<{ nextIndex: () => number }> = Symbol("header-menu-panel");
