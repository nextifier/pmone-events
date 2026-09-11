<template>
  <!-- React Bits' TextLoop (reactbits.dev/text-animations/text-loop), ported to
       Vue: a phrase looping along an SVG curve over a ribbon, moved by one gsap
       tween. Two changes so it can sit in a page:
       - The open shapes (wave, line) crop the viewBox to the band they draw, so
         nothing is clipped top or bottom and no empty space is left around it,
         and they run 1280 units further out each side than the original.
       - `maxHeight` stops the height growing on wide screens. `meet` then
         scales the drawing to that height and centres it, and the longer open
         shapes fill the extra width, so the band still meets both edges.
       The loop only runs while it is on screen. -->
  <div
    ref="rootRef"
    class="relative w-full overflow-hidden"
    @pointerenter="hovering = true"
    @pointerleave="hovering = false"
  >
    <svg
      class="block h-auto w-full"
      :style="maxHeight ? { maxHeight: `${maxHeight}px` } : undefined"
      :viewBox="viewBox"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      :aria-label="text"
    >
      <path
        :id="pathId"
        ref="pathRef"
        :d="d"
        fill="none"
        :style="{ stroke: ribbon ? ribbonColor : 'none' }"
        :stroke-width="ribbon ? ribbonWidth : 0"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <text
        ref="measureRef"
        class="pointer-events-none invisible"
        :style="textStyle"
        aria-hidden="true"
      >{{ unit }}</text>

      <text class="select-none" :style="fillStyle" dominant-baseline="central" aria-hidden="true">
        <textPath
          ref="headRef"
          :href="`#${pathId}`"
          startOffset="0"
          :textLength="fitLength"
          lengthAdjust="spacing"
        >{{ loopText }}</textPath>
      </text>

      <text class="select-none" :style="fillStyle" dominant-baseline="central" aria-hidden="true">
        <textPath
          ref="tailRef"
          :href="`#${pathId}`"
          startOffset="0"
          :textLength="fitLength"
          lengthAdjust="spacing"
        >{{ loopText }}</textPath>
      </text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { useId } from "vue";
import { useIntersectionObserver, useMediaQuery } from "@vueuse/core";
import { gsap } from "gsap";

type Shape = "wave" | "circle" | "infinity" | "arch" | "line";

const props = withDefaults(
  defineProps<{
    /** The phrase repeated along the curve. */
    text?: string;
    /** Built-in curve the text flows along. */
    shape?: Shape;
    /** Custom SVG path data in a 1200x520 viewBox. Overrides `shape`. */
    path?: string;
    /** Travel speed along the path, in viewBox units per second. */
    speed?: number;
    direction?: "forward" | "reverse";
    /** Glyph placed between each repetition. */
    separator?: string;
    /** Amplitude of the wave, or the radius of the closed shapes. */
    curviness?: number;
    fontSize?: number;
    fontWeight?: number;
    letterSpacing?: number;
    uppercase?: boolean;
    /** Fill of the text; any CSS colour, `var(--token)` included. */
    color?: string;
    /** Draws a solid band behind the text along the path. */
    ribbon?: boolean;
    ribbonColor?: string;
    ribbonWidth?: number;
    pauseOnHover?: boolean;
    /** Caps the rendered height in px; see the note in the template. */
    maxHeight?: number;
  }>(),
  {
    text: "React ✦ Bits",
    shape: "wave",
    path: undefined,
    speed: 90,
    direction: "forward",
    separator: "✦",
    curviness: 90,
    fontSize: 46,
    fontWeight: 800,
    letterSpacing: 2,
    uppercase: true,
    color: "#ffffff",
    ribbon: true,
    ribbonColor: "#5227FF",
    ribbonWidth: 86,
    pauseOnHover: true,
    maxHeight: undefined,
  },
);

const VIEW_W = 1200;
const VIEW_H = 520;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;
const EDGE_PAD = 6;
// How much further than the original (320 out) the open shapes run past each
// side, for boxes wider than the viewBox once `maxHeight` holds the scale.
const OVERHANG = 1280;

const room = computed(() => Math.max(20, CY - Math.max(0, props.ribbonWidth) / 2 - EDGE_PAD));
const amplitude = computed(() => Math.min(Math.max(0, props.curviness) * 2.2, room.value * 2));

function buildPath(shape: Shape): string {
  const c = Math.max(0, props.curviness);

  switch (shape) {
    case "circle": {
      const r = Math.min(90 + c * 0.95, room.value);
      return `M ${CX - r} ${CY} A ${r} ${r} 0 1 1 ${CX + r} ${CY} A ${r} ${r} 0 1 1 ${CX - r} ${CY} Z`;
    }
    case "infinity": {
      const r = 150 + c * 1.4;
      const h = Math.min(60 + c * 0.95, room.value);
      return [
        `M ${CX} ${CY}`,
        `C ${CX + r * 0.55} ${CY - h} ${CX + r} ${CY - h} ${CX + r} ${CY}`,
        `C ${CX + r} ${CY + h} ${CX + r * 0.55} ${CY + h} ${CX} ${CY}`,
        `C ${CX - r * 0.55} ${CY - h} ${CX - r} ${CY - h} ${CX - r} ${CY}`,
        `C ${CX - r} ${CY + h} ${CX - r * 0.55} ${CY + h} ${CX} ${CY}`,
        "Z",
      ].join(" ");
    }
    case "arch": {
      const rise = Math.min(120 + c * 1.1, room.value * 2);
      return `M 120 ${CY + rise / 2} Q ${CX} ${CY - rise * 1.5} ${VIEW_W - 120} ${CY + rise / 2}`;
    }
    case "line":
      return `M ${-320 - OVERHANG} ${CY} L ${VIEW_W + 320 + OVERHANG} ${CY}`;
    case "wave":
    default: {
      // The original's half-waves, 320 wide, continued out to the overhang in
      // the same phase, so the stretch inside the viewBox is unchanged.
      const a = amplitude.value;
      const start = -320 - OVERHANG;
      let d = `M ${start} ${CY} Q ${start + 160} ${CY - a} ${start + 320} ${CY}`;
      for (let x = start + 640; x <= VIEW_W + 320 + OVERHANG; x += 320) d += ` T ${x} ${CY}`;
      return d;
    }
  }
}

const d = computed(() => props.path || buildPath(props.shape));

// Open shapes get a box cropped to what they draw: a wave's crests sit a/2 off
// the centre line, and the band (or the glyphs, if taller) half its width past
// that. Worked out from the props alone, so the server and the browser render
// the same height and nothing shifts on hydration.
const viewBox = computed(() => {
  const open = !props.path && (props.shape === "wave" || props.shape === "line");
  if (!open) return `0 0 ${VIEW_W} ${VIEW_H}`;

  const band = Math.max(props.ribbon ? props.ribbonWidth : 0, props.fontSize) / 2;
  const half = (props.shape === "wave" ? amplitude.value / 2 : 0) + band + EDGE_PAD;
  return `0 ${CY - half} ${VIEW_W} ${half * 2}`;
});

const rootRef = ref<HTMLDivElement | null>(null);
const pathRef = ref<SVGPathElement | null>(null);
const measureRef = ref<SVGTextElement | null>(null);
const headRef = ref<SVGTextPathElement | null>(null);
const tailRef = ref<SVGTextPathElement | null>(null);

const pathId = `text-loop-${useId().replace(/:/g, "")}`;

const unit = computed(() => {
  const base = props.uppercase ? String(props.text).toUpperCase() : String(props.text);
  const gap = props.separator ? `\u00A0${props.separator}\u00A0` : "\u00A0\u00A0\u00A0";
  return `${base}${gap}`;
});

const textStyle = computed(() => ({
  fontSize: `${props.fontSize}px`,
  fontWeight: props.fontWeight,
  letterSpacing: `${props.letterSpacing}px`,
}));
const fillStyle = computed(() => ({ ...textStyle.value, fill: props.color }));

// Until the browser can measure, repeat generously (half an em a glyph, over
// more path than any shape draws), so the server-rendered band is already
// lettered; textPath drops whatever runs past the end.
const metrics = ref({
  length: 0,
  reps: Math.max(1, Math.ceil(5000 / (unit.value.length * props.fontSize * 0.5))),
});

function measure() {
  const pathEl = pathRef.value;
  const measureEl = measureRef.value;
  if (!pathEl || !measureEl) return;

  let length = 0;
  let unitWidth = 0;
  try {
    length = pathEl.getTotalLength();
    unitWidth = measureEl.getComputedTextLength();
  } catch {
    return;
  }
  if (!length) return;

  const reps = unitWidth > 0 ? Math.max(1, Math.round(length / unitWidth)) : 1;
  if (metrics.value.length !== length || metrics.value.reps !== reps) {
    metrics.value = { length, reps };
  }
}

onMounted(() => {
  measure();
  document.fonts?.ready.then(measure).catch(() => {});
});

watch(
  [d, unit, () => props.fontSize, () => props.fontWeight, () => props.letterSpacing],
  () => measure(),
  { flush: "post" },
);

const loopText = computed(() => unit.value.repeat(metrics.value.reps));
const fitLength = computed(() => metrics.value.length || undefined);

const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
const visible = ref(false);
const hovering = ref(false);

useIntersectionObserver(rootRef, ([entry]) => {
  visible.value = entry?.isIntersecting ?? false;
});

let tween: gsap.core.Tween | null = null;

// Runs while on screen and not hovered: a loop nobody can see is work for
// nothing.
function sync() {
  if (!tween) return;
  if (visible.value && !(props.pauseOnHover && hovering.value)) tween.resume();
  else tween.pause();
}

watch([visible, hovering, () => props.pauseOnHover], sync);

watch(
  [() => metrics.value.length, () => props.speed, () => props.direction, reducedMotion],
  ([length], _previous, onCleanup) => {
    const head = headRef.value;
    const tail = tailRef.value;
    if (!head || !tail || !length) return;

    // The tail trails the head by one path length, so the phrase never shows
    // a gap where it wraps.
    const apply = (offset: number) => {
      const partner = offset >= 0 ? offset - length : offset + length;
      head.setAttribute("startOffset", String(offset));
      tail.setAttribute("startOffset", String(partner));
    };
    apply(0);

    if (reducedMotion.value || props.speed <= 0) return;

    const state = { offset: 0 };
    tween = gsap.to(state, {
      offset: props.direction === "reverse" ? -length : length,
      duration: length / props.speed,
      ease: "none",
      repeat: -1,
      onUpdate: () => apply(state.offset),
    });
    sync();

    onCleanup(() => {
      tween?.kill();
      tween = null;
    });
  },
  { flush: "post" },
);
</script>
