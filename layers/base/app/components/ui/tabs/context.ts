import type { ComputedRef, InjectionKey } from "vue";

export type TabsVariant = "pill" | "segmented" | "underline";
export type TabsSize = "sm" | "md" | "lg";

export interface TabsContext {
  variant: ComputedRef<TabsVariant>;
  size: ComputedRef<TabsSize>;
  swipeable: ComputedRef<boolean>;
}

export const TABS_CONTEXT: InjectionKey<TabsContext> = Symbol("TabsContext");

export const TABS_DEFAULTS = {
  variant: "pill" as const,
  size: "md" as const,
  swipeable: false as const,
};

/**
 * A tab list is two elements, not one. `scroll-fade-x` masks the element it
 * sits on, and a mask eats everything that element paints - its background and
 * its border included. Painting and masking on the same box made the pill fade
 * out at its own edges, and on an opaque strip it let whatever sits underneath
 * (a hero banner scrolling past) bleed through.
 *
 * So the shell below paints and is never masked; the scrollport in
 * `tabsListScrollClasses` scrolls, masks, and holds the triggers. The shell is
 * also where a caller's `class` lands, which is why it keeps the display,
 * alignment and sizing - the scrollport inherits those back so `grid`,
 * `gap-1` or `items-start` passed by a caller still reach the triggers.
 */
export const tabsListClasses: Record<TabsVariant, string> = {
  pill: "relative inline-flex w-fit max-w-full items-center justify-center-safe rounded-full border border-border bg-muted text-muted-foreground",
  segmented:
    "relative inline-flex w-fit max-w-full items-center justify-center-safe rounded-xl bg-muted dark:bg-background dark:border text-muted-foreground/80",
  underline:
    "relative inline-flex w-fit max-w-full items-center-safe justify-center-safe border-b border-border/30 text-muted-foreground/80",
};

const tabsListScrollBase =
  "relative col-span-full h-full w-full min-w-0 self-stretch overflow-x-auto no-scrollbar scroll-fade-x rounded-[inherit] [display:inherit] [gap:inherit] [align-items:inherit] [justify-content:inherit] [grid-template-columns:inherit]";

export const tabsListScrollClasses: Record<TabsVariant, string> = {
  pill: `${tabsListScrollBase} p-0.5`,
  segmented: `${tabsListScrollBase} isolate p-0.5`,
  underline: `${tabsListScrollBase} isolate`,
};

export const tabsIndicatorClasses: Record<TabsVariant, string> = {
  pill: "absolute left-0 inset-y-0.5 rounded-full bg-background shadow-sm transition-[transform,width] duration-(--tabs-dur) ease-(--tabs-ease) dark:border dark:bg-border/70 dark:border-white/10",
  segmented:
    "absolute inset-y-0.5 left-0 z-0 rounded-lg bg-background shadow-sm ring-1 ring-border/40 transition-[transform,width] duration-(--tabs-dur) ease-(--tabs-ease) dark:border dark:bg-muted dark:border-white/15",
  underline:
    "absolute bottom-0 left-0 z-0 h-px bg-primary transition-[transform,width] duration-(--tabs-dur) ease-(--tabs-ease)",
};

export const tabsTriggerClasses: Record<TabsVariant, string> = {
  pill: "relative z-10 rounded-full data-[state=active]:text-foreground hover:text-foreground",
  segmented: "relative z-10 rounded-lg data-[state=active]:text-foreground hover:text-foreground",
  underline:
    "relative z-10 data-[state=active]:text-foreground hover:text-muted-foreground",
};

/**
 * The row a page-level tab strip sits in: full-bleed, painted, with the pill
 * held off the app header.
 *
 * It lives here rather than in each page because six places build this row -
 * five pages by hand around a `TabsList`, and `TabNav` for its segmented
 * variant - and they had already drifted once.
 *
 * Two things it must keep. It paints, because a bar that does not lets page
 * content scroll through the gaps beside a `w-fit` pill. And the gap above the
 * pill is padding, not a larger sticky `top`: an offset `top` leaves those
 * pixels unpainted, so content slides through the slot it opens.
 */
export const tabsBarClasses =
  "bg-background -mx-4 flex items-center px-4 pt-1 sm:mx-0 sm:px-0";

/**
 * Pinned under the app header. `z-20` clears a page's own sticky chrome, such
 * as a table's pinned header row. `TabNav` sets its own instead, because on a
 * page with a pinned preview pane the bar has to sit UNDER that pane.
 */
export const tabsBarStickyClasses =
  "sticky top-(--navbar-height-mobile) z-20 lg:top-(--navbar-height-desktop)";

export const tabsStickyBarClasses = `${tabsBarClasses} ${tabsBarStickyClasses}`;

// Same scale as `.cn-button`: one height at every width. These classes land in
// the utilities layer and would otherwise win over `.cn-tabs-trigger`, so they
// have to carry the size themselves.
export const tabsTriggerSizeClasses: Record<TabsSize, string> = {
  sm: "h-8 px-2.5 text-xs tracking-tight",
  md: "h-9 px-3 py-1.5 text-sm tracking-tight",
  lg: "h-11 px-4 py-2 text-base tracking-tight",
};
