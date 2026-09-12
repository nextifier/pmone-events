import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export { default as GameButton } from "./GameButton.vue";

// Every measurement of the button is a fraction of --game-button-h, so each
// size is just a height and the bevel, rim, shine and outline scale with it.
export const gameButtonVariants = cva(
  "group/game-button relative isolate inline-flex w-fit shrink-0 cursor-pointer items-center justify-center leading-none tracking-tight whitespace-nowrap select-none transition-[filter,translate] duration-150 ease-out hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      size: {
        sm: "[--game-button-h:2.5rem]",
        default: "[--game-button-h:3rem]",
        lg: "[--game-button-h:3.5rem]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export type GameButtonVariants = VariantProps<typeof gameButtonVariants>;
