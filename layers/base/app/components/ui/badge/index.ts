import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export { default as Badge } from "./Badge.vue";

export const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-x-1.5 text-foreground whitespace-nowrap font-normal tracking-tight text-sm",
  {
    variants: {
      plain: {
        true: "",
        false: "rounded-full border border-foreground/17 px-2 py-1",
      },
    },
    defaultVariants: { plain: false },
  }
);

export const badgeDotVariants = cva("size-2 shrink-0 rounded-full", {
  variants: {
    variant: {
      default: "bg-primary",
      info: "bg-info",
      success: "bg-success",
      warning: "bg-warning",
      destructive: "bg-destructive",
      muted: "bg-foreground/30",
      outline: "",
    },
  },
  defaultVariants: { variant: "default" },
});

export const badgeIconVariants = cva("size-4 shrink-0", {
  variants: {
    variant: {
      default: "text-foreground",
      info: "text-info-foreground",
      success: "text-success-foreground",
      warning: "text-warning-foreground",
      destructive: "text-destructive-foreground",
      muted: "text-muted-foreground",
      outline: "text-foreground",
    },
  },
  defaultVariants: { variant: "default" },
});

export type BadgeVariants = VariantProps<typeof badgeDotVariants>;

export type BadgeVariant = NonNullable<BadgeVariants["variant"]>;

export const badgeVariantNames = [
  "default",
  "info",
  "success",
  "warning",
  "destructive",
  "muted",
  "outline",
] as const satisfies readonly BadgeVariant[];

/**
 * cva returns only the base classes for a value it does not recognise, and the
 * dot's base is `size-2 rounded-full` with no background - so a variant name
 * this badge does not have renders an indicator that occupies space and paints
 * nothing. That is worse than a wrong colour: the badge looks like it simply
 * has extra padding, and the status it was meant to signal is invisible.
 *
 * Callers pass variants from plain `.vue` files where TypeScript never checks
 * them, so the guard has to be here. An unknown name behaves as if none was
 * given, which stays visible and is easy to spot in review.
 */
export function resolveBadgeVariant(variant?: BadgeVariant | string | null): BadgeVariant {
  return badgeVariantNames.includes(variant as BadgeVariant) ? (variant as BadgeVariant) : "default";
}

export const badgeDefaultIcons: Record<BadgeVariant, string> = {
  default: "lucide:circle-dot-dashed",
  info: "lucide:info",
  success: "lucide:circle-check-big",
  warning: "lucide:triangle-alert",
  destructive: "lucide:circle-x",
  muted: "lucide:circle-minus",
  outline: "lucide:circle-dashed",
};
