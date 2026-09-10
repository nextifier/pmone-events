import type { ComputedRef, InjectionKey } from "vue";

export type BottomNavVariant = "default" | "solid" | "floating";
export type BottomNavSize = "sm" | "md";
export type BottomNavIndicator = "pill" | "bar" | "dot" | "none";
export type BottomNavLabel = "always" | "active" | "none";
export type BottomNavLabelPlacement = "below" | "beside";
export type BottomNavPosition = "fixed" | "absolute" | "static";

export interface BottomNavContext {
  variant: ComputedRef<BottomNavVariant>;
  size: ComputedRef<BottomNavSize>;
  indicator: ComputedRef<BottomNavIndicator>;
  labelDisplay: ComputedRef<BottomNavLabel>;
  labelPlacement: ComputedRef<BottomNavLabelPlacement>;
  selectedValue: ComputedRef<string | number | undefined>;
  select: (value: string | number | undefined) => void;
}

export const BOTTOM_NAV_CONTEXT: InjectionKey<BottomNavContext> =
  Symbol("BottomNavContext");

export const BOTTOM_NAV_DEFAULTS = {
  variant: "default" as const,
  size: "md" as const,
  indicator: "none" as const,
  labelDisplay: "always" as const,
  labelPlacement: "below" as const,
};

/**
 * Frosted surface shared by default and floating: the background at 90% in
 * light and 70% in dark over a 24px backdrop blur. Browsers without
 * backdrop-filter get the opaque background instead of a see-through bar.
 */
const frostedSurface =
  "bg-background supports-[backdrop-filter]:bg-background/90 supports-[backdrop-filter]:backdrop-blur-xl dark:supports-[backdrop-filter]:bg-background/70";

/**
 * Hairlines are drawn inside the box (a pseudo-element on the top edge, an
 * inset ring for floating), so a bar is exactly as tall as its items: 56px at
 * md and never more.
 */
const topHairline =
  "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px";

/**
 * Surface + hairline per variant. Positioning (fixed/absolute/static, floating
 * offsets, safe area) is composed in BottomNav.vue so it stays in one place.
 */
export const bottomNavContainerClasses: Record<BottomNavVariant, string> = {
  default: `${topHairline} before:bg-foreground/20 ${frostedSurface}`,
  solid: `${topHairline} before:bg-border bg-background`,
  floating: `rounded-full inset-ring inset-ring-foreground/20 ${frostedSurface}`,
};

/**
 * Per-item trigger. Items sit above the sliding indicator (z-10). The color
 * change uses the tabs-sliding tokens (transitions-dev 16) so it lands with the
 * pill. An item with an activeIcon keeps one color in every state because the
 * filled icon already marks it; without one, inactive items are muted.
 */
export const bottomNavItemClasses =
  "relative z-10 flex min-w-0 flex-1 select-none items-center justify-center rounded-xl text-muted-foreground outline-none transition-[color] duration-(--tabs-dur) ease-(--tabs-ease) motion-reduce:transition-none pointer-fine:hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring data-[state=active]:text-foreground data-[has-active-icon=true]:text-foreground";

/** Icon + label wrapper. In beside, BottomNav slides it (FLIP) when widths change. */
export const bottomNavContentClasses: Record<BottomNavLabelPlacement, string> = {
  below: "flex min-w-0 max-w-full flex-col items-center",
  beside: "flex min-w-0 max-w-full flex-row items-center",
};

/** Sliding capsule behind the active icon, or behind the whole item when labels sit beside or are hidden. */
export const bottomNavPillClasses = "rounded-full bg-foreground/10";

/** Sliding line on the top edge of the active item. */
export const bottomNavBarClasses = "rounded-full bg-primary";

/** Item height is the bar height: 48px at sm, 56px at md. Nothing goes taller. */
export const bottomNavItemSizeClasses: Record<BottomNavSize, string> = {
  sm: "h-12",
  md: "h-14",
};

export const bottomNavIconSizeClasses: Record<BottomNavSize, string> = {
  sm: "size-5",
  md: "size-6",
};

export const bottomNavBarHeightClasses: Record<BottomNavSize, string> = {
  sm: "h-0.5",
  md: "h-0.5",
};

/**
 * Label under the icon: 11px, regular weight, normal tracking.
 * style-guide: BottomNav label (STYLE_GUIDE §22, covers these labels only).
 */
export const bottomNavLabelClasses =
  "block max-w-full truncate px-1 font-normal tracking-normal";

/** Leading sits after the size on purpose: tailwind-merge drops a leading that precedes a font size. */
export const bottomNavLabelSizeClasses: Record<BottomNavSize, string> = {
  sm: "text-[0.6875rem] leading-[normal]",
  md: "text-[0.6875rem] leading-[normal]",
};
