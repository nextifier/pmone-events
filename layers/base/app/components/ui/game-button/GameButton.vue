<script setup lang="ts">
/**
 * Chunky game-style button: a bevelled face on a darker ledge, an inset rim
 * line lit from the top left, two specks of shine and an outlined label.
 * Colors and proportions were measured off the reference render, all of them
 * as fractions of the button's height. `muted` is frosted glass on the same
 * geometry, for a quiet second action next to it.
 */
import type { PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import type { GameButtonVariants } from ".";
import { Primitive } from "reka-ui";
import { NuxtLink } from "#components";
import { cn } from "@/lib/utils";
import { gameButtonVariants } from ".";

interface Props extends PrimitiveProps {
  size?: GameButtonVariants["size"];
  /**
   * yellow is the reference render; every other hue carries its structure
   * over to its own Tailwind scale. muted is a quiet glass key for a second
   * action. `color` overrides it.
   */
  colorVariant?:
    | "yellow"
    | "red"
    | "orange"
    | "amber"
    | "lime"
    | "green"
    | "emerald"
    | "teal"
    | "cyan"
    | "sky"
    | "blue"
    | "indigo"
    | "violet"
    | "purple"
    | "fuchsia"
    | "pink"
    | "rose"
    | "slate"
    | "zinc"
    | "muted";
  /** Face color, any CSS color. Every other stop is derived from it. */
  color?: string;
  to?: string;
  target?: string;
  disabled?: boolean;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
  colorVariant: "yellow",
});

const isExternal = computed(() => props.to?.startsWith("http"));
const resolvedTarget = computed(
  () => props.target || (isExternal.value ? "_blank" : undefined),
);
const colorStyle = computed(() => ({
  "--game-button-color": props.color || undefined,
}));
</script>

<template>
  <component
    :is="to ? NuxtLink : Primitive"
    data-slot="game-button"
    :data-size="size ?? 'default'"
    :data-color-variant="colorVariant"
    :data-color="color ? 'custom' : undefined"
    :to="to || undefined"
    :as="to ? undefined : as"
    :as-child="to ? undefined : asChild"
    :target="resolvedTarget"
    :rel="resolvedTarget === '_blank' ? 'noopener noreferrer' : undefined"
    :disabled="to ? undefined : disabled || undefined"
    :aria-disabled="disabled || undefined"
    :style="colorStyle"
    :class="cn(gameButtonVariants({ size }), props.class)"
  >
    <span
      aria-hidden="true"
      data-slot="game-button-rim"
      class="game-button-rim pointer-events-none absolute"
    />
    <span
      aria-hidden="true"
      data-slot="game-button-shine"
      class="game-button-shine pointer-events-none absolute"
    />
    <span
      data-slot="game-button-content"
      class="game-button-label relative z-[1] inline-flex items-center gap-[inherit]"
    >
      <slot />
    </span>
  </component>
</template>

<style>
/*
 * Everything sits in the components layer and the palette in :where(), so a
 * utility class or stylesheet rule at the call site always overrides it.
 * Values below are fractions of --game-button-h taken from the reference, a
 * 484px-tall button: corners of 150px, a 16px top band, a 17px ledge under a
 * 2px light line, a rim line 38px in (48px at the bottom) and 8px thick, a
 * 35x23px speck of shine tilted 52 degrees with a 12x8px one beside it, and a
 * 5px label outline that drops a further 7px below the letters.
 *
 * The order statement repeats Tailwind's. A layer ranks where its name first
 * appears, and in dev this block can load before the Tailwind entry: without
 * it, components would rank below base and the reset would zero the padding
 * and color.
 */
@layer theme, base, components, utilities;

@layer components {
  :where([data-slot="game-button"]) {
    --game-button-face-from: #ffc326;
    --game-button-face-mid: #fdc018;
    --game-button-face-to: #ffbb05;
    --game-button-top: #ffd684;
    --game-button-edge-light: #ffd589;
    --game-button-edge-dark: #b97300;
    --game-button-ledge: #bc7001;
    --game-button-ledge-line: #ffbd30;
    --game-button-rim-light: #ffcc4b;
    --game-button-rim-dark: #e4900f;
    --game-button-glow: rgb(255 190 20 / 0.35);
    --game-button-shine: #fdfcd4;
    --game-button-ink: #2b1f0b;
    --game-button-text: #fff;
  }

  /* The other hues carry the yellow's structure over to their own Tailwind
     scale. Each stop keeps its place on the shade scale relative to the
     face (moved so the face lands on 500, or 400 for slate and zinc), its
     share of that scale's chroma and the scale's own hue, clipped to sRGB.
     Shine and ink keep their place. */
  :where([data-slot="game-button"][data-color-variant="red"]) {
    --game-button-face-from: #f44648;
    --game-button-face-mid: #f33e40;
    --game-button-face-to: #f03a3c;
    --game-button-top: #ea7e7c;
    --game-button-edge-light: #e67f7d;
    --game-button-edge-dark: #9b2b27;
    --game-button-ledge: #9b2a25;
    --game-button-ledge-line: #ed4443;
    --game-button-rim-light: #f35c5c;
    --game-button-rim-dark: #c02825;
    --game-button-glow: rgb(243 62 64 / 0.35);
    --game-button-shine: #ffeeee;
    --game-button-ink: #2e1311;
  }

  :where([data-slot="game-button"][data-color-variant="orange"]) {
    --game-button-face-from: #fd7500;
    --game-button-face-mid: #fc7100;
    --game-button-face-to: #f96d00;
    --game-button-top: #ee9a59;
    --game-button-edge-light: #ea9a5e;
    --game-button-edge-dark: #9f4023;
    --game-button-ledge: #9f3f21;
    --game-button-ledge-line: #f87219;
    --game-button-rim-light: #f98328;
    --game-button-rim-dark: #cb4c19;
    --game-button-glow: rgb(252 113 0 / 0.35);
    --game-button-shine: #fff5e8;
    --game-button-ink: #2e1711;
  }

  :where([data-slot="game-button"][data-color-variant="amber"]) {
    --game-button-face-from: #f7a300;
    --game-button-face-mid: #f69e00;
    --game-button-face-to: #f29800;
    --game-button-top: #f0c155;
    --game-button-edge-light: #eec15d;
    --game-button-edge-dark: #964b21;
    --game-button-ledge: #964a1f;
    --game-button-ledge-line: #f39c11;
    --game-button-rim-light: #f8ae0c;
    --game-button-rim-dark: #bd6018;
    --game-button-glow: rgb(246 158 0 / 0.35);
    --game-button-shine: #fff9e3;
    --game-button-ink: #301b12;
  }

  :where([data-slot="game-button"][data-color-variant="lime"]) {
    --game-button-face-from: #87d000;
    --game-button-face-mid: #83cc00;
    --game-button-face-to: #7ec600;
    --game-button-top: #aae15f;
    --game-button-edge-light: #ace066;
    --game-button-edge-dark: #476923;
    --game-button-ledge: #466820;
    --game-button-ledge-line: #83ca1a;
    --game-button-rim-light: #93d924;
    --game-button-rim-dark: #56871b;
    --game-button-glow: rgb(131 204 0 / 0.35);
    --game-button-shine: #f4ffda;
    --game-button-ink: #1a2412;
  }

  :where([data-slot="game-button"][data-color-variant="green"]) {
    --game-button-face-from: #10ca5f;
    --game-button-face-mid: #04c65a;
    --game-button-face-to: #04c157;
    --game-button-top: #6ad88d;
    --game-button-edge-light: #70d68f;
    --game-button-edge-dark: #276b3c;
    --game-button-ledge: #256b3b;
    --game-button-ledge-line: #25c35e;
    --game-button-rim-light: #36d16f;
    --game-button-rim-dark: #208a44;
    --game-button-glow: rgb(4 198 90 / 0.35);
    --game-button-shine: #e6ffef;
    --game-button-ink: #122317;
  }

  :where([data-slot="game-button"][data-color-variant="emerald"]) {
    --game-button-face-from: #00bd84;
    --game-button-face-mid: #00b981;
    --game-button-face-to: #00b47d;
    --game-button-top: #5cce9e;
    --game-button-edge-light: #62cc9f;
    --game-button-edge-dark: #1e654d;
    --game-button-ledge: #1c654c;
    --game-button-ledge-line: #15b780;
    --game-button-rim-light: #21c68c;
    --game-button-rim-dark: #15805d;
    --game-button-glow: rgb(0 185 129 / 0.35);
    --game-button-shine: #dffff0;
    --game-button-ink: #11211c;
  }

  :where([data-slot="game-button"][data-color-variant="teal"]) {
    --game-button-face-from: #00bdaa;
    --game-button-face-mid: #00b9a6;
    --game-button-face-to: #00b3a2;
    --game-button-top: #5acfbd;
    --game-button-edge-light: #61cebd;
    --game-button-edge-dark: #23645f;
    --game-button-ledge: #21645e;
    --game-button-ledge-line: #1ab6a4;
    --game-button-rim-light: #1fc6b2;
    --game-button-rim-dark: #1c7e76;
    --game-button-glow: rgb(0 185 166 / 0.35);
    --game-button-shine: #e2fff9;
    --game-button-ink: #142424;
  }

  :where([data-slot="game-button"][data-color-variant="cyan"]) {
    --game-button-face-from: #00bad8;
    --game-button-face-mid: #00b6d4;
    --game-button-face-to: #00b0cf;
    --game-button-top: #58cfe4;
    --game-button-edge-light: #5fcee2;
    --game-button-edge-dark: #256479;
    --game-button-ledge: #236479;
    --game-button-ledge-line: #11b4d2;
    --game-button-rim-light: #10c4e1;
    --game-button-rim-dark: #1b7d99;
    --game-button-glow: rgb(0 182 212 / 0.35);
    --game-button-shine: #e6fdff;
    --game-button-ink: #192932;
  }

  :where([data-slot="game-button"][data-color-variant="sky"]) {
    --game-button-face-from: #00a9ed;
    --game-button-face-mid: #00a5ea;
    --game-button-face-to: #00a0e5;
    --game-button-top: #5bbbea;
    --game-button-edge-light: #60bae7;
    --game-button-edge-dark: #1d5e87;
    --game-button-ledge: #1b5d87;
    --game-button-ledge-line: #12a3e7;
    --game-button-rim-light: #24b1f0;
    --game-button-rim-dark: #1371aa;
    --game-button-glow: rgb(0 165 234 / 0.35);
    --game-button-shine: #ecf8ff;
    --game-button-ink: #172633;
  }

  :where([data-slot="game-button"][data-color-variant="blue"]) {
    --game-button-face-from: #3b87fb;
    --game-button-face-mid: #3781fb;
    --game-button-face-to: #337df9;
    --game-button-top: #6fa6ea;
    --game-button-edge-light: #71a5e6;
    --game-button-edge-dark: #2549ae;
    --game-button-ledge: #2448b0;
    --game-button-ledge-line: #3b81f4;
    --game-button-rim-light: #4c94f7;
    --game-button-rim-dark: #2357d8;
    --game-button-glow: rgb(55 129 251 / 0.35);
    --game-button-shine: #ebf3ff;
    --game-button-ink: #192137;
  }

  :where([data-slot="game-button"][data-color-variant="indigo"]) {
    --game-button-face-from: #666af7;
    --game-button-face-mid: #6264f6;
    --game-button-face-to: #5f5ff4;
    --game-button-top: #8591e7;
    --game-button-edge-light: #8590e2;
    --game-button-edge-dark: #3b39a2;
    --game-button-ledge: #3b38a4;
    --game-button-ledge-line: #6265ef;
    --game-button-rim-light: #717af4;
    --game-button-rim-dark: #4740cd;
    --game-button-glow: rgb(98 100 246 / 0.35);
    --game-button-shine: #ebf0ff;
    --game-button-ink: #191930;
  }

  :where([data-slot="game-button"][data-color-variant="violet"]) {
    --game-button-face-from: #9061fc;
    --game-button-face-mid: #8c59fb;
    --game-button-face-to: #8a54fa;
    --game-button-top: #a691ea;
    --game-button-edge-light: #a591e6;
    --game-button-edge-dark: #5e31b3;
    --game-button-ledge: #5e30b5;
    --game-button-ledge-line: #8a5bf5;
    --game-button-rim-light: #9975f8;
    --game-button-rim-dark: #7134da;
    --game-button-glow: rgb(140 89 251 / 0.35);
    --game-button-shine: #f3f1ff;
    --game-button-ink: #231b40;
  }

  :where([data-slot="game-button"][data-color-variant="purple"]) {
    --game-button-face-from: #ad59fc;
    --game-button-face-mid: #aa51fc;
    --game-button-face-to: #a64cfa;
    --game-button-top: #bb8dec;
    --game-button-edge-light: #b98de8;
    --game-button-edge-dark: #6d30a8;
    --game-button-ledge: #6d2ea9;
    --game-button-ledge-line: #a754f5;
    --game-button-rim-light: #b46ef9;
    --game-button-rim-dark: #832fd2;
    --game-button-glow: rgb(170 81 252 / 0.35);
    --game-button-shine: #f8f2ff;
    --game-button-ink: #2b1a40;
  }

  :where([data-slot="game-button"][data-color-variant="fuchsia"]) {
    --game-button-face-from: #de48f4;
    --game-button-face-mid: #dc3ff3;
    --game-button-face-to: #d83bee;
    --game-button-top: #de86eb;
    --game-button-edge-light: #db88e7;
    --game-button-edge-dark: #892b91;
    --game-button-ledge: #892992;
    --game-button-ledge-line: #d746ed;
    --game-button-rim-light: #e062f3;
    --game-button-rim-dark: #a928b7;
    --game-button-glow: rgb(220 63 243 / 0.35);
    --game-button-shine: #fcf1ff;
    --game-button-ink: #341836;
  }

  :where([data-slot="game-button"][data-color-variant="pink"]) {
    --game-button-face-from: #f1499e;
    --game-button-face-mid: #ef4299;
    --game-button-face-to: #ed3e94;
    --game-button-top: #e77fb4;
    --game-button-edge-light: #e481b2;
    --game-button-edge-dark: #9f2a53;
    --game-button-ledge: #a02853;
    --game-button-ledge-line: #ea4897;
    --game-button-rim-light: #ef5ea8;
    --game-button-rim-dark: #c42665;
    --game-button-glow: rgb(239 66 153 / 0.35);
    --game-button-shine: #ffeef8;
    --game-button-ink: #371720;
  }

  :where([data-slot="game-button"][data-color-variant="rose"]) {
    --game-button-face-from: #f94162;
    --game-button-face-mid: #f8375c;
    --game-button-face-to: #f53358;
    --game-button-top: #ed7e8c;
    --game-button-edge-light: #e9808c;
    --game-button-edge-dark: #a0273f;
    --game-button-ledge: #a1253e;
    --game-button-ledge-line: #f23f5d;
    --game-button-rim-light: #f75b72;
    --game-button-rim-dark: #c52142;
    --game-button-glow: rgb(248 55 92 / 0.35);
    --game-button-shine: #ffeeef;
    --game-button-ink: #331419;
  }

  :where([data-slot="game-button"][data-color-variant="slate"]) {
    --game-button-face-from: #9aa9be;
    --game-button-face-mid: #91a1b7;
    --game-button-face-to: #8a9ab0;
    --game-button-top: #cfd6e0;
    --game-button-edge-light: #ced6df;
    --game-button-edge-dark: #3b4759;
    --game-button-ledge: #3a4759;
    --game-button-ledge-line: #909fb3;
    --game-button-rim-light: #b0bdcd;
    --game-button-rim-dark: #505e73;
    --game-button-glow: rgb(145 161 183 / 0.35);
    --game-button-shine: #f5f9fd;
    --game-button-ink: #020309;
  }

  :where([data-slot="game-button"][data-color-variant="zinc"]) {
    --game-button-face-from: #a7a7b0;
    --game-button-face-mid: #9f9fa8;
    --game-button-face-to: #9898a1;
    --game-button-top: #d5d5d9;
    --game-button-edge-light: #d5d5d8;
    --game-button-edge-dark: #45454c;
    --game-button-ledge: #45454b;
    --game-button-ledge-line: #9c9ca5;
    --game-button-rim-light: #bbbbc2;
    --game-button-rim-dark: #5c5c64;
    --game-button-glow: rgb(159 159 168 / 0.35);
    --game-button-shine: #f9f9f9;
    --game-button-ink: #040405;
  }

  /* Any other color: `color` is the face and each stop is derived from it
     with the presets' average lightness and chroma offsets. */
  :where([data-slot="game-button"][data-color="custom"]) {
    --game-button-face-mid: var(--game-button-color);
    --game-button-face-from: oklch(from var(--game-button-color) calc(l + 0.011) calc(c * 0.99) h);
    --game-button-face-to: oklch(from var(--game-button-color) calc(l - 0.012) calc(c * 1) h);
    --game-button-top: oklch(from var(--game-button-color) calc(l + 0.079) calc(c * 0.7) h);
    --game-button-edge-light: oklch(from var(--game-button-color) calc(l + 0.077) calc(c * 0.66) h);
    --game-button-edge-dark: oklch(from var(--game-button-color) calc(l - 0.21) calc(c * 0.66) h);
    --game-button-ledge: oklch(from var(--game-button-color) calc(l - 0.211) calc(c * 0.67) h);
    --game-button-ledge-line: oklch(from var(--game-button-color) calc(l - 0.004) calc(c * 0.96) h);
    --game-button-rim-light: oklch(from var(--game-button-color) calc(l + 0.039) calc(c * 0.91) h);
    --game-button-rim-dark: oklch(from var(--game-button-color) calc(l - 0.138) calc(c * 0.85) h);
    --game-button-glow: oklch(from var(--game-button-color) l c h / 0.35);
    --game-button-shine: oklch(from var(--game-button-color) min(0.99, l + 0.295) calc(c * 0.14) h);
    --game-button-ink: oklch(from var(--game-button-color) max(0.12, l - 0.429) calc(c * 0.22) h);
  }

  /* muted: a quiet key for the second action, frosted glass with no fill of
     its own. A trace of black on light pages and of white on dark ones, a
     hairline edge, a 1px highlight under the top edge and the yellow face's
     ledge in shade instead of colour. */
  :where([data-slot="game-button"][data-color-variant="muted"]) {
    --game-button-text: var(--foreground);
    --game-button-glass-from: rgb(0 0 0 / 0.035);
    --game-button-glass-to: rgb(0 0 0 / 0.06);
    --game-button-glass-edge: rgb(0 0 0 / 0.08);
    --game-button-glass-top: rgb(255 255 255 / 0.8);
    --game-button-glass-ledge: rgb(0 0 0 / 0.07);
  }

  :where(
    .dark
      [data-slot="game-button"][data-color-variant="muted"]:not(
        [data-preview-theme="light"] *
      )
  ) {
    --game-button-glass-from: rgb(255 255 255 / 0.075);
    --game-button-glass-to: rgb(255 255 255 / 0.05);
    --game-button-glass-edge: rgb(255 255 255 / 0.08);
    --game-button-glass-top: rgb(255 255 255 / 0.07);
    --game-button-glass-ledge: rgb(0 0 0 / 0.35);
  }

  [data-slot="game-button"] {
    --h: var(--game-button-h, 3rem);
    height: var(--h);
    padding-inline: calc(var(--h) * 0.5);
    gap: calc(var(--h) * 0.15);
    border-radius: calc(var(--h) * 0.31);
    /* Rubik 800 is the closest free match to the reference lettering: the
       same slanted t, softened corners and stem weight. @nuxt/fonts serves it
       with a metric-matched fallback. */
    font-family: "Rubik", ui-sans-serif, system-ui, sans-serif;
    font-size: calc(var(--h) * 0.4);
    font-weight: 800;
    color: var(--game-button-text);
    background: linear-gradient(
      90deg,
      var(--game-button-face-from) 0%,
      var(--game-button-face-mid) 50%,
      var(--game-button-face-to) 100%
    );
    /* First shadow paints on top. The ledge covers the bottom band and the
       light line peeks out right above it; both sit over the side bands so
       the ledge wraps the bottom corners. */
    box-shadow:
      inset 0 calc(var(--h) * 0.033) 0 var(--game-button-top),
      inset 0 calc(var(--h) * -0.035) 0 var(--game-button-ledge),
      inset 0 calc(var(--h) * -0.035 - max(0.5px, var(--h) * 0.005)) 0
        var(--game-button-ledge-line),
      inset calc(var(--h) * 0.017) 0 0 var(--game-button-edge-light),
      inset calc(var(--h) * -0.008) 0 0 var(--game-button-edge-dark),
      0 0 calc(var(--h) * 0.16) calc(var(--h) * 0.02) var(--game-button-glow);
  }

  /* The inset line: light along the top and left, dark along the bottom and
     right, like a groove lit from the top left. Soft at large sizes only. */
  .game-button-rim {
    --w: max(1px, calc(var(--h) * 0.017));
    inset: calc(var(--h) * 0.07) calc(var(--h) * 0.069) calc(var(--h) * 0.091)
      calc(var(--h) * 0.071);
    border-radius: calc(var(--h) * 0.24);
    box-shadow:
      inset 0 var(--w) 0 var(--game-button-rim-light),
      inset var(--w) 0 0 var(--game-button-rim-light),
      inset calc(var(--w) * -1) 0 0 var(--game-button-rim-dark),
      inset 0 calc(var(--w) * -1) 0 var(--game-button-rim-dark);
    filter: blur(max(0px, calc(var(--h) * 0.004 - 0.5px)));
  }

  /* Two specks of shine inside the top-left corner, tilted along the curve. */
  .game-button-shine {
    inset: 0;
  }

  .game-button-shine::before,
  .game-button-shine::after {
    position: absolute;
    border-radius: 50%;
    background: var(--game-button-shine);
    translate: -50% -50%;
    content: "";
  }

  .game-button-shine::before {
    top: calc(var(--h) * 0.223);
    left: calc(var(--h) * 0.185);
    width: max(3px, calc(var(--h) * 0.072));
    height: max(2px, calc(var(--h) * 0.048));
    rotate: -52deg;
  }

  .game-button-shine::after {
    top: calc(var(--h) * 0.22);
    left: calc(var(--h) * 0.233);
    width: max(1.25px, calc(var(--h) * 0.026));
    height: max(1px, calc(var(--h) * 0.016));
    rotate: -57deg;
  }

  /* White label in a dark outline traced at sixteen angles, then the lower
     half of that outline again, dropped straight down. */
  .game-button-label {
    --o: max(1px, calc(var(--h) * 0.0105));
    --d: max(1px, calc(var(--h) * 0.0155));
    --a: calc(var(--o) * 0.924);
    --b: calc(var(--o) * 0.707);
    --c: calc(var(--o) * 0.383);
    --k: var(--game-button-ink);
    text-shadow:
      var(--o) 0 var(--k),
      var(--a) var(--c) var(--k),
      var(--b) var(--b) var(--k),
      var(--c) var(--a) var(--k),
      0 var(--o) var(--k),
      calc(var(--c) * -1) var(--a) var(--k),
      calc(var(--b) * -1) var(--b) var(--k),
      calc(var(--a) * -1) var(--c) var(--k),
      calc(var(--o) * -1) 0 var(--k),
      calc(var(--a) * -1) calc(var(--c) * -1) var(--k),
      calc(var(--b) * -1) calc(var(--b) * -1) var(--k),
      calc(var(--c) * -1) calc(var(--a) * -1) var(--k),
      0 calc(var(--o) * -1) var(--k),
      var(--c) calc(var(--a) * -1) var(--k),
      var(--b) calc(var(--b) * -1) var(--k),
      var(--a) calc(var(--c) * -1) var(--k),
      var(--a) calc(var(--c) + var(--d)) var(--k),
      var(--b) calc(var(--b) + var(--d)) var(--k),
      var(--c) calc(var(--a) + var(--d)) var(--k),
      0 calc(var(--o) + var(--d)) var(--k),
      calc(var(--c) * -1) calc(var(--a) + var(--d)) var(--k),
      calc(var(--b) * -1) calc(var(--b) + var(--d)) var(--k),
      calc(var(--a) * -1) calc(var(--c) + var(--d)) var(--k);
  }

  /* Every line sits inside the box, so both variants share the same outer
     edge. The hairline paints first and the highlight's second pixel shows
     under it; the ledge clears the hairline the same way. */
  [data-slot="game-button"][data-color-variant="muted"] {
    background: linear-gradient(
      var(--game-button-glass-from),
      var(--game-button-glass-to)
    );
    -webkit-backdrop-filter: blur(12px) saturate(1.5);
    backdrop-filter: blur(12px) saturate(1.5);
    box-shadow:
      inset 0 0 0 1px var(--game-button-glass-edge),
      inset 0 2px 0 var(--game-button-glass-top),
      inset 0 calc(-1px - var(--h) * 0.035) 0 var(--game-button-glass-ledge);
  }

  [data-color-variant="muted"] > .game-button-rim,
  [data-color-variant="muted"] > .game-button-shine {
    display: none;
  }

  [data-color-variant="muted"] > .game-button-label {
    text-shadow: none;
  }
}
</style>
