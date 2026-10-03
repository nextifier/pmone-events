import type { InjectionKey, Ref } from "vue";

export type MegaMenuMode = "desktop" | "mobile";
export type MegaMenuBreakpoint = "none" | "md" | "lg";

/** Container widths (px) below which the menu switches to its mobile layout. */
export const MEGA_MENU_BREAKPOINTS: Record<MegaMenuBreakpoint, number> = {
  none: 0,
  md: 768,
  lg: 1024,
};

/**
 * Container-query classes for the two things that must be right on the very
 * first paint, before the width observer has run: which of the list and the
 * toggle is visible. Written out in full so Tailwind can see them.
 */
export const MEGA_MENU_BREAKPOINT_CLASSES: Record<
  MegaMenuBreakpoint,
  { desktopOnly: string; mobileOnly: string }
> = {
  none: { desktopOnly: "", mobileOnly: "hidden" },
  md: { desktopOnly: "@max-3xl:hidden", mobileOnly: "@3xl:hidden" },
  lg: { desktopOnly: "@max-5xl:hidden", mobileOnly: "@5xl:hidden" },
};

export interface MegaMenuContext {
  mode: Ref<MegaMenuMode>;
  breakpoint: Ref<MegaMenuBreakpoint>;
  openOn: Ref<"hover" | "click">;
  /** Value of the item that is open, empty when closed. */
  openValue: Ref<string>;
  mobileOpen: Ref<boolean>;
  /** Which accordion section is open in the mobile layout. */
  mobileValue: Ref<string>;
  panelId: string;
  closeMobile: () => void;
  toggleMobileValue: (value: string) => void;
  /** True while a MegaMenuSheet is mounted: the menu button then shows at every width. */
  hasSheet: Ref<boolean>;
  /** True with the underlay variant: the menu button shows at every width too. */
  toggleAlways: Ref<boolean>;
  registerSheet: () => void;
}

export interface MegaMenuItemContext {
  value: string;
}

export interface MegaMenuContentContext {
  /** Position of the next revealed element, in render order. */
  nextIndex: () => number;
}

export interface MegaMenuColumnContext {
  /** Position of the next revealed element inside this column. */
  nextIndex: () => number;
}

export const megaMenuColumnKey: InjectionKey<MegaMenuColumnContext> = Symbol("mega-menu-column");
export const megaMenuKey: InjectionKey<MegaMenuContext> = Symbol("mega-menu");
export const megaMenuItemKey: InjectionKey<MegaMenuItemContext> = Symbol("mega-menu-item");
export const megaMenuContentKey: InjectionKey<MegaMenuContentContext> = Symbol("mega-menu-content");
