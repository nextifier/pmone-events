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

// Same ladder as `.cn-button`: one step taller on phones, settling to the desktop
// height at `sm`. The label does NOT follow — it stays at one size everywhere. These
// classes land in the utilities layer and would otherwise win over `.cn-tabs-trigger`
// and pin the trigger to a single size.
export const tabsTriggerSizeClasses: Record<TabsSize, string> = {
  sm: "h-8 px-2.5 text-xs tracking-tight sm:h-7",
  md: "h-9 px-3 py-1.5 text-sm tracking-tight sm:h-8",
  lg: "h-11 px-4 py-2 text-base tracking-tight sm:h-10",
};
