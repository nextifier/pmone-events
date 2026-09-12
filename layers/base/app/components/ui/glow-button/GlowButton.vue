<script setup lang="ts">
/**
 * Pill button with a spring-tracked light inside and mirrored edge glows that
 * crossfade as the pointer changes sides. Vue port of MicroKit UI's Cursor Edge
 * Glow Button: the spring, the paint step and every gradient stop of the
 * default palette are kept as shipped, the constants became props.
 */
import type { PrimitiveProps } from "reka-ui";
import type { ComponentPublicInstance, HTMLAttributes } from "vue";
import type { GlowButtonVariants } from ".";
import { unrefElement, usePreferredReducedMotion } from "@vueuse/core";
import { Primitive } from "reka-ui";
import { NuxtLink } from "#components";
import { cn } from "@/lib/utils";
import { glowButtonVariants } from ".";

interface Props extends PrimitiveProps {
  variant?: GlowButtonVariants["variant"];
  size?: GlowButtonVariants["size"];
  /** Surface palette. auto follows the nearest `.dark` ancestor. */
  theme?: "auto" | "light" | "dark";
  /** Hand-tuned palette. `color` and `highlight` override it. */
  colorVariant?: "ember" | "cyan";
  /** Glow color. Unset keeps the `colorVariant` palette. */
  color?: string;
  /** Inner light and rim tint. Derived from `color` when unset. */
  highlight?: string;
  /** Trailing arrow after the label. */
  arrow?: boolean;
  /** Spring frequency in Hz: how fast the light catches the pointer. */
  frequency?: number;
  /** Damping ratio: below 1 overshoots, 1 and above settles without bouncing. */
  damping?: number;
  /** Exponent on edge opacity: lower values light the edge sooner. */
  glowRise?: number;
  /** Extra saturation on the lit edge at full travel. */
  edgeSaturation?: number;
  /** Extra brightness on the lit edge at full travel. */
  edgeBrightness?: number;
  /** Hue rotation applied to both edges, in degrees. */
  hueShift?: number;
  to?: string;
  target?: string;
  disabled?: boolean;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
  theme: "auto",
  colorVariant: "ember",
  arrow: true,
  frequency: 3.4,
  damping: 0.78,
  glowRise: 0.5,
  edgeSaturation: 0.55,
  edgeBrightness: 0.12,
  hueShift: -5,
});

const GLOW_SIDES = ["right", "left"] as const;
type GlowSide = (typeof GLOW_SIDES)[number];

const isGlow = computed(() => (props.variant ?? "default") === "default");
const isExternal = computed(() => props.to?.startsWith("http"));
const resolvedTarget = computed(
  () => props.target || (isExternal.value ? "_blank" : undefined),
);
const colorStyle = computed(() => ({
  "--glow-button-color": props.color || undefined,
  "--glow-button-highlight": props.highlight || undefined,
}));

const rootRef = ref<ComponentPublicInstance | HTMLElement | null>(null);
const lightRef = ref<HTMLElement | null>(null);
const edges: Record<GlowSide, HTMLElement | null> = { right: null, left: null };

const setEdge = (side: GlowSide, el: unknown) => {
  edges[side] = el as HTMLElement | null;
};

const reducedMotion = usePreferredReducedMotion();

// Spring state lives outside Vue's reactivity: it changes every frame and is
// painted straight onto the layers. `targetX` must not be called `target`, or
// it shadows the `target` prop in the template.
let bound = 0;
let x = 0;
let velocity = 0;
let targetX = 0;
let inside = false;
let last = 0;
let frameId: number | null = null;
let resizeObserver: ResizeObserver | null = null;

const canAnimate = () => isGlow.value && reducedMotion.value !== "reduce";

const paint = () => {
  const light = lightRef.value;
  const { right, left } = edges;
  if (!light || !right || !left || !bound) return;

  light.style.setProperty("--light-x", x.toFixed(2) + "px");
  const normalized = Math.max(-1, Math.min(1, x / bound));
  const magnitude = Math.abs(normalized);
  const intensity = Math.pow(magnitude, props.glowRise);
  const colorTuning =
    "hue-rotate(" +
    props.hueShift +
    "deg)" +
    " saturate(" +
    (1 + props.edgeSaturation * magnitude).toFixed(3) +
    ")" +
    " brightness(" +
    (1 + props.edgeBrightness * magnitude).toFixed(3) +
    ")";

  right.style.opacity = (normalized > 0 ? intensity : 0).toFixed(3);
  left.style.opacity = (normalized < 0 ? intensity : 0).toFixed(3);
  right.style.filter = colorTuning;
  left.style.filter = colorTuning;
};

const measure = () => {
  const el = unrefElement(rootRef);
  if (!el) return;
  const parked = frameId === null && x === bound;
  bound = el.getBoundingClientRect().width / 2 + 12;
  // Untouched buttons rest on the right edge; keep them there when the width
  // changes instead of leaving the light where the old edge was.
  if (parked) {
    x = bound;
    targetX = bound;
    paint();
  }
};

const frame = (now = performance.now()) => {
  const delta = Math.min((now - last) / 1000, 0.032);
  last = now;
  const angularFrequency = 2 * Math.PI * props.frequency;
  velocity +=
    (angularFrequency * angularFrequency * (targetX - x) -
      2 * props.damping * angularFrequency * velocity) *
    delta;
  x += velocity * delta;
  paint();

  if (inside || Math.abs(targetX - x) > 0.15 || Math.abs(velocity) > 0.6) {
    frameId = requestAnimationFrame(frame);
  } else {
    frameId = null;
    x = targetX;
    velocity = 0;
    paint();
  }
};

const kick = () => {
  if (frameId === null) {
    last = performance.now();
    frameId = requestAnimationFrame(frame);
  }
};

const stop = () => {
  if (frameId !== null) cancelAnimationFrame(frameId);
  frameId = null;
};

const onPointerMove = (event: PointerEvent) => {
  if (!canAnimate()) return;
  const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
  inside = true;
  targetX = Math.max(
    -bound,
    Math.min(bound, event.clientX - (bounds.left + bounds.width / 2)),
  );
  kick();
};

const onPointerLeave = () => {
  if (!canAnimate()) return;
  inside = false;
  targetX = x;
  kick();
};

const onFocusIn = () => {
  if (!canAnimate()) return;
  inside = false;
  targetX = 0;
  kick();
};

const onFocusOut = () => {
  if (!canAnimate()) return;
  inside = false;
  targetX = x;
  kick();
};

const park = () => {
  stop();
  const el = unrefElement(rootRef);
  if (!el) return;
  bound = el.getBoundingClientRect().width / 2 + 12;
  x = bound;
  targetX = bound;
  velocity = 0;
  inside = false;
  paint();
};

onMounted(() => {
  const el = unrefElement(rootRef);
  if (!el) return;
  resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(el);
  if (isGlow.value) park();
});

watch(isGlow, (glow) => (glow ? nextTick(park) : stop()));

watch(
  () => [
    props.glowRise,
    props.edgeSaturation,
    props.edgeBrightness,
    props.hueShift,
  ],
  paint,
);

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  stop();
});
</script>

<template>
  <component
    :is="to ? NuxtLink : Primitive"
    ref="rootRef"
    data-slot="glow-button"
    :data-variant="variant ?? 'default'"
    :data-size="size ?? 'default'"
    :data-theme="theme === 'auto' ? undefined : theme"
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
    :class="cn(glowButtonVariants({ variant, size }), props.class)"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <template v-if="isGlow">
      <span
        v-for="side in GLOW_SIDES"
        :key="side"
        :ref="(el) => setEdge(side, el)"
        aria-hidden="true"
        data-slot="glow-button-edge"
        :data-side="side"
        class="pointer-events-none absolute top-1/2 left-1/2 h-[calc(100%+9px)] w-[calc(100%+9px)] rounded-full border-[3px] border-transparent will-change-transform"
        :class="
          side === 'right'
            ? 'opacity-100 [transform:translate(-50%,-50%)]'
            : 'opacity-0 [transform:translate(-50%,-50%)_scaleX(-1)]'
        "
      >
        <span
          class="glow-button-halo absolute top-[-3px] left-[-3px] z-20 box-content size-full rounded-full border-[3px] border-transparent blur-[15px]"
        />
        <span
          class="glow-button-flare absolute top-[-2px] left-[-2px] z-10 box-content size-full rounded-full border-2 border-transparent blur-[2px]"
        />
        <span
          class="glow-button-rim relative block size-full rounded-full border border-transparent"
        >
          <span
            class="glow-button-bloom absolute top-[-2px] left-[-2px] z-30 box-content size-full rounded-full border-2 border-transparent blur-[7px]"
          />
        </span>
      </span>

      <span
        aria-hidden="true"
        data-slot="glow-button-surface"
        class="@container pointer-events-none absolute inset-0 overflow-hidden rounded-full border border-(--glow-button-border) bg-(--glow-button-surface)"
      >
        <span
          ref="lightRef"
          class="absolute top-0 left-1/2 ml-[-102px] flex h-full w-[204px] items-center justify-center [--light-x:calc(50cqw+12px)] [transform:translateX(var(--light-x))_translateZ(0)]"
        >
          <span
            class="glow-button-light-core absolute top-1/2 size-[121px] -translate-y-1/2"
          />
          <span
            class="glow-button-light-haze absolute top-1/2 h-[103px] w-[204px] -translate-y-1/2 blur-[5px]"
          />
        </span>
      </span>
    </template>

    <span
      data-slot="glow-button-content"
      class="relative inline-flex items-center gap-[inherit]"
    >
      <slot />
      <svg
        v-if="arrow"
        class="h-[9px] w-[17px]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 17 9"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          fill-rule="evenodd"
          d="m12.495 0 4.495 4.495-4.495 4.495-.99-.99 2.805-2.805H0v-1.4h14.31L11.505.99z"
          clip-rule="evenodd"
        />
      </svg>
    </span>
  </component>
</template>

<style>
/*
 * Everything sits in the components layer and the palette in :where(), so a
 * utility class or stylesheet rule at the call site always overrides it.
 * With `color` unset the roles hold the `colorVariant` stops as tuned (ember is
 * the original, untouched); with it set, the same roles are derived from
 * `color` and `highlight`.
 *
 * The order statement repeats Tailwind's. A layer ranks where its name first
 * appears, and in dev this block can load before the Tailwind entry: without
 * it, components would rank below base and the reset would win.
 */
@layer theme, base, components, utilities;

@layer components {
  :where([data-slot="glow-button"]) {
    --glow-button-deep: #cd3100;
    --glow-button-glow: #ff7950;
    --glow-button-soft: #ff8964;
    --glow-button-pale: #ffb199;
    --glow-button-rim: #e98463;
    --glow-button-dust: #bc9b8f;
    --glow-button-spot: #ffaa81;
    --glow-button-warm: #ffda9f;
    --glow-button-hot: #fffff5;
    --glow-button-cream: #fffacd;
    --glow-button-blush: #f4d2bf;
    --glow-button-foreground: #5a250a;
    --glow-button-focus: var(--glow-button-soft);
    --glow-button-surface: #e5e5e5;
    --glow-button-border: rgb(0 0 0 / 0.1);
  }

  /* Cyan: the same roles tuned by hand around a cyan-400 glow, with an icy
     light and a deep teal label in place of ember's warm cream and brown. */
  :where([data-slot="glow-button"][data-color-variant="cyan"]) {
    --glow-button-deep: #0891b2;
    --glow-button-glow: #22d3ee;
    --glow-button-soft: #45d9ef;
    --glow-button-pale: #a5f3fc;
    --glow-button-rim: #5bb8c9;
    --glow-button-dust: #90adb4;
    --glow-button-spot: #8ae4f1;
    --glow-button-warm: #bdf6ee;
    --glow-button-hot: #f5fffe;
    --glow-button-cream: #e0fbfc;
    --glow-button-blush: #c4e1e8;
    --glow-button-foreground: #083344;
  }

  :where([data-slot="glow-button"][data-color="custom"]) {
    --glow-button-base: var(--glow-button-color, #ff7950);
    --glow-button-light: var(
      --glow-button-highlight,
      color-mix(in oklab, var(--glow-button-base) 55%, white)
    );
    --glow-button-deep: color-mix(in oklab, var(--glow-button-base) 72%, black);
    --glow-button-glow: var(--glow-button-base);
    --glow-button-soft: color-mix(in oklab, var(--glow-button-base) 88%, white);
    --glow-button-pale: color-mix(in oklab, var(--glow-button-base) 55%, white);
    --glow-button-rim: color-mix(in oklab, var(--glow-button-base) 85%, gray);
    --glow-button-dust: color-mix(in oklab, var(--glow-button-base) 30%, gray);
    --glow-button-spot: var(--glow-button-light);
    --glow-button-warm: color-mix(
      in oklab,
      var(--glow-button-light) 55%,
      white
    );
    --glow-button-hot: color-mix(in oklab, var(--glow-button-light) 4%, white);
    --glow-button-cream: color-mix(
      in oklab,
      var(--glow-button-light) 22%,
      white
    );
    --glow-button-blush: color-mix(
      in oklab,
      var(--glow-button-light) 35%,
      #ececec
    );
    --glow-button-foreground: color-mix(
      in oklab,
      var(--glow-button-base) 38%,
      black
    );
  }

  /* Dark surface: a `.dark` ancestor (unless pinned light, or inside a light
     docs preview), or pinned with theme="dark". */
  :where(
    .dark
      [data-slot="glow-button"]:not(
        [data-theme="light"],
        [data-preview-theme="light"] *
      ),
    [data-slot="glow-button"][data-theme="dark"]
  ) {
    --glow-button-surface: #d1d1d1;
    --glow-button-border: rgb(255 255 255 / 0.6);
  }

  /* Each edge layer paints only its border ring: a transparent padding-box
     over a gradient border-box. Transparent stops stand in for the original's
     zero-alpha colors, which interpolate identically (premultiplied). */
  .glow-button-halo {
    background:
      linear-gradient(transparent, transparent) padding-box,
      linear-gradient(
          91.88deg,
          color-mix(in srgb, var(--glow-button-soft) 20%, transparent) 46.45%,
          var(--glow-button-deep) 98.59%
        )
        border-box;
  }

  .glow-button-flare {
    background:
      linear-gradient(transparent, transparent) padding-box,
      linear-gradient(
          97.68deg,
          transparent 38.1%,
          color-mix(in srgb, var(--glow-button-pale) 20%, transparent) 82.47%,
          var(--glow-button-glow) 93.3%
        )
        border-box;
  }

  .glow-button-rim {
    background:
      linear-gradient(transparent, transparent) padding-box,
      linear-gradient(
          103.7deg,
          color-mix(in srgb, var(--glow-button-dust) 10%, transparent) 38.66%,
          color-mix(in srgb, var(--glow-button-rim) 10%, transparent) 68.55%,
          var(--glow-button-rim) 85.01%,
          #fff 92.12%
        )
        border-box;
  }

  .glow-button-bloom {
    background:
      linear-gradient(transparent, transparent) padding-box,
      linear-gradient(
          91.96deg,
          transparent 6.11%,
          color-mix(in srgb, var(--glow-button-pale) 20%, transparent) 53.57%,
          var(--glow-button-glow) 93.6%
        )
        border-box;
  }

  .glow-button-light-core {
    background: radial-gradient(
      50% 50% at 50% 50%,
      var(--glow-button-hot) 3.5%,
      var(--glow-button-spot) 26.5%,
      var(--glow-button-warm) 37.5%,
      color-mix(in srgb, var(--glow-button-spot) 50%, transparent) 49%,
      transparent 92.5%
    );
  }

  .glow-button-light-haze {
    background: radial-gradient(
      43.3% 44.23% at 50% 49.51%,
      var(--glow-button-hot) 29%,
      var(--glow-button-cream) 48.5%,
      var(--glow-button-blush) 60.71%,
      transparent 100%
    );
  }
}
</style>
