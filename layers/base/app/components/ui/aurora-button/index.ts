import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export { default as AuroraButton } from "./AuroraButton.vue";

// This component owns its sizes instead of reading a `cn-*` rule: the layered
// surface is the design, so it does not follow the style packs.
export const auroraButtonVariants = cva(
  "group/aurora-button relative isolate inline-flex w-fit shrink-0 cursor-pointer items-center justify-center overflow-hidden leading-none font-semibold tracking-tighter whitespace-nowrap text-(--aurora-button-foreground) select-none transition-transform duration-160 ease-out hover:scale-103 focus-visible:scale-103 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring active:scale-97 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      // Radii are fixed px, not the theme scale: rounded-xl is --radius + 4px
      // here, and lyra/sera zero --radius, neither of which is this design.
      size: {
        sm: "h-8 gap-1.5 rounded-[8px] px-3.5 text-sm [&_svg:not([class*='size-'])]:size-4",
        default:
          "h-10 gap-1.5 rounded-[10px] px-5 text-base md:rounded-[12px] [&_svg:not([class*='size-'])]:size-5",
        lg: "h-12 gap-2 rounded-[14px] px-6 text-base [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export type AuroraButtonVariants = VariantProps<typeof auroraButtonVariants>;
