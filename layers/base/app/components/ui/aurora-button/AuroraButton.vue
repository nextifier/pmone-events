<script setup lang="ts">
/**
 * Layered gradient button with a luminous rim, a directional shadow and a
 * blended hover bloom. Vue port of MicroKit UI's Aurora Download Button: every
 * layer, blend and timing is kept as shipped, the two gradient colors became
 * a palette that `colorVariant`, `color` and `highlight` can change.
 */
import type { PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import type { AuroraButtonVariants } from ".";
import { Primitive } from "reka-ui";
import { NuxtLink } from "#components";
import { cn } from "@/lib/utils";
import { auroraButtonVariants } from ".";

interface Props extends PrimitiveProps {
  size?: AuroraButtonVariants["size"];
  /**
   * Hand-tuned palette. Deep hues carry white text, orange through sky their
   * own 950 shade, and muted follows the theme's neutral tokens for a quiet
   * second action. `color` and `highlight` override it.
   */
  colorVariant?:
    | "red"
    | "orange"
    | "amber"
    | "yellow"
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
  /** Gradient end, the deep color at the bottom right. Any CSS color. */
  color?: string;
  /** Gradient start at the top left. Derived from `color` when unset. */
  highlight?: string;
  /** Text and icon color. Custom colors default to white; pass a dark one for a light color. */
  foreground?: string;
  to?: string;
  target?: string;
  disabled?: boolean;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
  colorVariant: "blue",
});

const isExternal = computed(() => props.to?.startsWith("http"));
const resolvedTarget = computed(
  () => props.target || (isExternal.value ? "_blank" : undefined),
);
const colorStyle = computed(() => ({
  "--aurora-button-color": props.color || undefined,
  "--aurora-button-highlight": props.highlight || undefined,
  "--aurora-button-foreground": props.foreground || undefined,
}));
</script>

<template>
  <component
    :is="to ? NuxtLink : Primitive"
    data-slot="aurora-button"
    :data-size="size ?? 'default'"
    :data-color-variant="colorVariant"
    :data-color="color || highlight ? 'custom' : undefined"
    :to="to || undefined"
    :as="to ? undefined : as"
    :as-child="to ? undefined : asChild"
    :target="resolvedTarget"
    :rel="resolvedTarget === '_blank' ? 'noopener noreferrer' : undefined"
    :disabled="to ? undefined : disabled || undefined"
    :aria-disabled="disabled || undefined"
    :style="colorStyle"
    :class="cn(auroraButtonVariants({ size }), props.class)"
  >
    <span
      aria-hidden="true"
      data-slot="aurora-button-rim"
      class="pointer-events-none absolute inset-0 z-20 rounded-[inherit] blur-[1px]"
    >
      <span
        class="aurora-button-rim-highlight absolute top-[-1px] left-[-1px] size-full rounded-[inherit]"
      />
    </span>
    <span
      aria-hidden="true"
      data-slot="aurora-button-bloom"
      class="aurora-button-bloom pointer-events-none absolute inset-px z-0 rounded-[inherit] opacity-0 transition-opacity duration-300 ease-in-out group-hover/aurora-button:opacity-40 group-focus-visible/aurora-button:opacity-40 motion-reduce:transition-none"
    />
    <span
      data-slot="aurora-button-content"
      class="relative z-[1] inline-flex items-center gap-[inherit]"
    >
      <slot />
    </span>
  </component>
</template>

<style>
/*
 * Everything sits in the components layer and the palette in :where(), so a
 * utility class or stylesheet rule at the call site always overrides it.
 * Presets set the two gradient colors (and the text color where it is dark)
 * and derive the two inset tints from them; `color` and `highlight` do the
 * same for any color.
 *
 * Contrast: the white overlay sheen brightens the lower right of the label,
 * so every pair was checked at the lightest point under the label, sheen
 * included, not at its average. Deep hues keep white text and were darkened
 * only as far as 4.5:1 at rest and 4:1 on hover (the MicroKit blue itself sits
 * at 3.4:1). Bright hues from orange to sky cannot reach that with white under
 * the sheen at any shade, so they carry their own 950 shade and land at 7:1
 * or better.
 */
@layer components {
  /* blue: the MicroKit pair deepened 19%, with the original insets. The drop
     shadow, sheen and ring are variables only so muted can soften them. */
  :where([data-slot="aurora-button"]) {
    --aurora-button-from: rgb(24 105 181);
    --aurora-button-to: rgb(23 45 190);
    --aurora-button-rim: rgb(191 229 251 / 0.4);
    --aurora-button-shade: rgb(19 26 228 / 0.1);
    --aurora-button-foreground: #fff;
    --aurora-button-sheen: rgb(255 255 255 / 0.6);
    --aurora-button-drop: rgb(0 0 0 / 0.28) 0 10px 18px;
    --aurora-button-ring: 0 0 #0000;
  }

  :where(
    [data-slot="aurora-button"]:not([data-color-variant="blue"]),
    [data-slot="aurora-button"][data-color="custom"]
  ) {
    --aurora-button-rim: color-mix(
      in srgb,
      color-mix(in oklab, var(--aurora-button-from) 28%, white) 40%,
      transparent
    );
    --aurora-button-shade: color-mix(
      in srgb,
      color-mix(in oklab, var(--aurora-button-to) 85%, black) 10%,
      transparent
    );
  }

  :where([data-slot="aurora-button"][data-color-variant="red"]) {
    --aurora-button-from: rgb(189 54 54);
    --aurora-button-to: rgb(174 30 30);
  }

  :where([data-slot="aurora-button"][data-color-variant="orange"]) {
    --aurora-button-from: rgb(251 146 60);
    --aurora-button-to: rgb(249 115 22);
    --aurora-button-foreground: rgb(67 20 7);
  }

  :where([data-slot="aurora-button"][data-color-variant="amber"]) {
    --aurora-button-from: rgb(251 191 36);
    --aurora-button-to: rgb(245 158 11);
    --aurora-button-foreground: rgb(69 26 3);
  }

  :where([data-slot="aurora-button"][data-color-variant="yellow"]) {
    --aurora-button-from: rgb(250 204 21);
    --aurora-button-to: rgb(234 179 8);
    --aurora-button-foreground: rgb(66 32 6);
  }

  :where([data-slot="aurora-button"][data-color-variant="lime"]) {
    --aurora-button-from: rgb(163 230 53);
    --aurora-button-to: rgb(132 204 22);
    --aurora-button-foreground: rgb(26 46 5);
  }

  :where([data-slot="aurora-button"][data-color-variant="green"]) {
    --aurora-button-from: rgb(74 222 128);
    --aurora-button-to: rgb(34 197 94);
    --aurora-button-foreground: rgb(5 46 22);
  }

  :where([data-slot="aurora-button"][data-color-variant="emerald"]) {
    --aurora-button-from: rgb(52 211 153);
    --aurora-button-to: rgb(16 185 129);
    --aurora-button-foreground: rgb(2 44 34);
  }

  :where([data-slot="aurora-button"][data-color-variant="teal"]) {
    --aurora-button-from: rgb(45 212 191);
    --aurora-button-to: rgb(20 184 166);
    --aurora-button-foreground: rgb(4 47 46);
  }

  :where([data-slot="aurora-button"][data-color-variant="cyan"]) {
    --aurora-button-from: rgb(34 211 238);
    --aurora-button-to: rgb(6 182 212);
    --aurora-button-foreground: rgb(8 51 68);
  }

  :where([data-slot="aurora-button"][data-color-variant="sky"]) {
    --aurora-button-from: rgb(56 189 248);
    --aurora-button-to: rgb(14 165 233);
    --aurora-button-foreground: rgb(8 47 73);
  }

  :where([data-slot="aurora-button"][data-color-variant="indigo"]) {
    --aurora-button-from: rgb(75 78 183);
    --aurora-button-to: rgb(60 53 174);
  }

  :where([data-slot="aurora-button"][data-color-variant="violet"]) {
    --aurora-button-from: rgb(101 67 180);
    --aurora-button-to: rgb(91 42 173);
  }

  :where([data-slot="aurora-button"][data-color-variant="purple"]) {
    --aurora-button-from: rgb(118 59 173);
    --aurora-button-to: rgb(103 36 164);
  }

  :where([data-slot="aurora-button"][data-color-variant="fuchsia"]) {
    --aurora-button-from: rgb(143 46 158);
    --aurora-button-to: rgb(127 25 139);
  }

  :where([data-slot="aurora-button"][data-color-variant="pink"]) {
    --aurora-button-from: rgb(165 50 107);
    --aurora-button-to: rgb(153 27 83);
  }

  :where([data-slot="aurora-button"][data-color-variant="rose"]) {
    --aurora-button-from: rgb(193 50 74);
    --aurora-button-to: rgb(178 23 57);
  }

  :where([data-slot="aurora-button"][data-color-variant="slate"]) {
    --aurora-button-from: rgb(71 85 105);
    --aurora-button-to: rgb(15 23 42);
  }

  :where([data-slot="aurora-button"][data-color-variant="zinc"]) {
    --aurora-button-from: rgb(82 82 91);
    --aurora-button-to: rgb(24 24 27);
  }

  /* muted: built from the theme tokens, so it follows each site's neutrals.
     Light: a pale pill barely darker than the page, dark text, a hairline
     ring and a short soft shadow instead of the colored presets' deep drop. */
  :where([data-slot="aurora-button"][data-color-variant="muted"]) {
    --aurora-button-from: color-mix(
      in oklab,
      var(--muted) 45%,
      var(--background)
    );
    --aurora-button-to: color-mix(in oklab, var(--muted) 92%, var(--foreground));
    --aurora-button-foreground: var(--foreground);
    --aurora-button-rim: rgb(255 255 255 / 0.9);
    --aurora-button-shade: color-mix(
      in srgb,
      var(--foreground) 5%,
      transparent
    );
    --aurora-button-drop: rgb(0 0 0 / 0.08) 0 4px 10px;
    --aurora-button-ring: inset 0 0 0 1px
      color-mix(in srgb, var(--foreground) 8%, transparent);
  }

  /* Dark: a lifted grey running into a deeper one, the light kept to a
     whisper: faint rim, a fifth of the sheen, the same hairline ring. */
  :where(
    .dark
      [data-slot="aurora-button"][data-color-variant="muted"]:not(
        [data-preview-theme="light"] *
      )
  ) {
    --aurora-button-from: color-mix(
      in oklab,
      var(--muted) 88%,
      var(--foreground)
    );
    --aurora-button-to: color-mix(in oklab, var(--muted) 70%, var(--background));
    --aurora-button-rim: rgb(255 255 255 / 0.1);
    --aurora-button-shade: rgb(0 0 0 / 0.2);
    --aurora-button-sheen: rgb(255 255 255 / 0.12);
    --aurora-button-drop: rgb(0 0 0 / 0.35) 0 6px 14px;
    --aurora-button-ring: inset 0 0 0 1px
      color-mix(in srgb, var(--foreground) 10%, transparent);
  }

  /* Custom colors default to white text; a light color passes `foreground`,
     which lands as an inline style and wins over this. */
  :where([data-slot="aurora-button"][data-color="custom"]) {
    --aurora-button-to: var(--aurora-button-color, rgb(28 56 234));
    --aurora-button-from: var(
      --aurora-button-highlight,
      color-mix(in oklab, var(--aurora-button-to) 82%, white)
    );
    --aurora-button-foreground: #fff;
  }

  [data-slot="aurora-button"] {
    background:
      radial-gradient(
        101.79% 101.79% at 65.61% 81.79%,
        var(--aurora-button-sheen) 0,
        rgb(255 255 255 / 0) 100%
      ),
      radial-gradient(
        114.65% 114.65% at 9.73% 17.27%,
        var(--aurora-button-from) 0,
        var(--aurora-button-to) 100%
      );
    background-blend-mode: overlay, normal;
    box-shadow:
      var(--aurora-button-drop),
      var(--aurora-button-rim) -3px -3px 4px inset,
      var(--aurora-button-shade) 4px 4px 4px inset,
      var(--aurora-button-ring);
  }

  .aurora-button-bloom {
    background: radial-gradient(
      101.79% 101.79% at 65.61% 81.79%,
      var(--aurora-button-sheen) 0,
      rgb(255 255 255 / 0) 100%
    );
    mix-blend-mode: overlay;
  }

  /* A 3px ring cut out of a white fade, nudged 1px up and left so it catches
     the top-left edge, then softened by the rim's 1px blur. */
  .aurora-button-rim-highlight {
    padding: 3px;
    background: linear-gradient(
      176.87deg,
      rgb(255 255 255 / 0.5) 8.56%,
      rgb(255 255 255 / 0) 85.04%
    );
    opacity: 0.45;
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
  }
}
</style>
