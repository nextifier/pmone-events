import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export { default as GlowButton } from "./GlowButton.vue";

// This component owns its sizes instead of reading a `cn-*` rule: the pill
// geometry is part of the effect, so it does not follow the style packs.
export const glowButtonVariants = cva(
  "relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full leading-none font-semibold tracking-tight whitespace-nowrap select-none transition-[scale,background-color] active:scale-98 focus-visible:outline-2 focus-visible:outline-offset-8 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "text-(--glow-button-foreground) focus-visible:outline-(--glow-button-focus)",
        secondary:
          "border-foreground/10 bg-foreground/5 text-foreground hover:bg-foreground/10 focus-visible:outline-ring border backdrop-blur-lg",
      },
      size: {
        sm: "h-8 gap-1.5 px-8 text-sm",
        default: "h-10 gap-1.5 px-[3.25rem] text-sm",
        lg: "h-12 gap-2 px-16 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type GlowButtonVariants = VariantProps<typeof glowButtonVariants>;
