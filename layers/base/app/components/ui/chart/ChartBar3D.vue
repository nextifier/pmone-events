<template>
  <div ref="root" @pointerleave="active = null" class="relative @container w-full">
    <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" :style="{ height: 'auto' }">
      <defs v-if="mode === 'gradient'">
        <linearGradient :id="`${uid}-front`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.9" />
          <stop offset="100%" :stop-color="color" stop-opacity="0.7" />
        </linearGradient>
        <linearGradient :id="`${uid}-back`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.5" />
          <stop offset="100%" :stop-color="color" stop-opacity="0.3" />
        </linearGradient>
        <linearGradient :id="`${uid}-side`" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" :stop-color="color" stop-opacity="0.6" />
          <stop offset="100%" :stop-color="color" stop-opacity="0.4" />
        </linearGradient>
        <linearGradient :id="`${uid}-top`" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.7" />
          <stop offset="100%" :stop-color="color" stop-opacity="0.5" />
        </linearGradient>
      </defs>

      <g
        v-for="bar in bars"
        :key="bar.label"
        class="cursor-pointer"
        @pointerenter="track($event, bar.index)"
        @pointerdown="track($event, bar.index)"
        @pointermove="track($event, bar.index)"
      >
        <!-- Hit area over the whole band. The isometric faces leave gaps a
             pointer falls through, and a bar at zero has no face at all. -->
        <rect
          :x="bar.x - (band - barWidth) / 2"
          :y="margin.top"
          :width="band"
          :height="innerH"
          fill="transparent"
        />
        <!-- Back face -->
        <rect
          :x="bar.x + bar.depth"
          :y="bar.y - bar.depth"
          :width="barWidth"
          :height="bar.height"
          :fill="faceFill('back')"
          :opacity="faceOpacity('back')"
          rx="3"
        />
        <!-- Right side face -->
        <polygon :points="bar.sidePoints" :fill="faceFill('side')" :opacity="faceOpacity('side')" />
        <!-- Top face -->
        <polygon :points="bar.topPoints" :fill="faceFill('top')" :opacity="faceOpacity('top')" />
        <!-- Front face -->
        <rect
          :x="bar.x"
          :y="bar.y"
          :width="barWidth"
          :height="bar.height"
          :fill="faceFill('front')"
          rx="3"
        />
        <!-- Value above the top face. This chart draws no axis, no grid and no
             tooltip, so without it there is no number anywhere on the plot.
             margin.top already reserves 40px, so nothing reflows. -->
        <text
          v-if="showValues"
          :x="bar.x + barWidth / 2"
          :y="bar.y - 12"
          text-anchor="middle"
          class="fill-foreground tracking-tight tabular-nums"
          :style="{ fontSize: `${labelPx}px`, fontWeight: 500 }"
        >
          {{ valueFormatter ? valueFormatter(bar.value) : bar.value.toLocaleString() }}
        </text>
        <!-- Category label -->
        <text
          :x="bar.x + barWidth / 2"
          :y="H - 8"
          text-anchor="middle"
          class="fill-muted-foreground tracking-tight"
          :style="{ fontSize: `${labelPx}px` }"
        >
          {{ bar.label }}
        </text>
      </g>
    </svg>

    <div ref="box" class="pointer-events-none absolute inset-0">
      <ChartHoverTooltip
        :open="active !== null"
        :x="pointer.x"
        :y="pointer.y"
        :box-width="boxSize.w"
        :box-height="boxSize.h"
      >
        <ChartTooltipContent
          v-if="active !== null"
          :label-key="xKey"
          :payload="{ [xKey]: bars[active]?.rawLabel, [valueKey]: bars[active]?.value }"
          :config="config"
          :value-formatter="valueFormatter"
        />
      </ChartHoverTooltip>
    </div>
  </div>
</template>

<script setup>
import ChartHoverTooltip from "./ChartHoverTooltip.vue";
import ChartTooltipContent from "./ChartTooltipContent.vue";
let bar3dUid = 0;

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  config: {
    type: Object,
    required: true,
  },
  xKey: {
    type: String,
    default: "month",
  },
  valueKey: {
    type: String,
    default: "value",
  },
  // gradient = four-face gradients (chart 6); solid = single color with opacity faces (chart 8).
  mode: {
    type: String,
    default: "gradient",
  },
  colorOverride: {
    type: String,
    default: null,
  },
  // Prints each bar's value above its top face. Off by default so existing
  // call sites are unchanged.
  showValues: {
    type: Boolean,
    default: false,
  },
  valueFormatter: {
    type: Function,
    default: null,
  },
  maxLabelChars: {
    type: Number,
    default: 14,
  },
  barCategoryGap: {
    type: Number,
    default: 0.2,
  },
});

const W = 520;
const H = 300;
const margin = { top: 40, right: 24, bottom: 28, left: 24 };
const innerW = W - margin.left - margin.right;
const innerH = H - margin.top - margin.bottom;

const uid = `bar3d-${(bar3dUid += 1)}`;

const color = computed(
  () => props.colorOverride || props.config[props.valueKey]?.color || "var(--chart-1)"
);

/**
 * Text inside a scaled viewBox is measured in USER UNITS, not screen pixels.
 *
 * The svg is `w-full` against a fixed 520-unit viewBox, so a "12px" label
 * renders at 12 x (containerWidth / 520). In a 400px card that is 9px. Measuring
 * the container and dividing back out keeps the label at the size it claims.
 */
const box = ref(null);
const active = ref(null);
const pointer = ref({ x: 0, y: 0 });
const boxSize = ref({ w: 0, h: 0 });

function track(event, i) {
  active.value = i;
  const rect = box.value?.getBoundingClientRect();
  if (!rect) return;
  boxSize.value = { w: rect.width, h: rect.height };
  pointer.value = { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

const root = ref(null);
const unitsPerPixel = ref(1);
let sizeObserver = null;

onMounted(() => {
  if (!root.value || typeof ResizeObserver === "undefined") return;
  sizeObserver = new ResizeObserver(([entry]) => {
    const rendered = entry.contentRect.width;
    unitsPerPixel.value = rendered > 0 ? W / rendered : 1;
  });
  sizeObserver.observe(root.value);
});

onBeforeUnmount(() => sizeObserver?.disconnect());

const labelPx = computed(() => 12 * unitsPerPixel.value);

// Floored at 1: an empty array divides to Infinity and every face comes out NaN.
const band = computed(() => innerW / Math.max(props.data.length, 1));

// The viewBox is fixed at 520 wide, so a long category name runs into its
// neighbour with no reflow to save it. Truncating degrades instead of colliding.
const truncate = (label) => {
  const text = String(label ?? "");
  return text.length > props.maxLabelChars ? `${text.slice(0, props.maxLabelChars - 1)}…` : text;
};
const barWidth = computed(() => band.value * (1 - props.barCategoryGap));

const maxY = computed(() => Math.max(...props.data.map((d) => Number(d[props.valueKey]) || 0), 1));

const bars = computed(() =>
  props.data.map((d, i) => {
    const value = Number(d[props.valueKey]) || 0;
    const height = (value / maxY.value) * innerH;
    const x = margin.left + i * band.value + (band.value - barWidth.value) / 2;
    const y = margin.top + (innerH - height);
    const bw = barWidth.value;
    const depth = Math.min(bw * 0.3, 15);
    const sidePoints = [
      `${x + bw + 3},${y - 3}`,
      `${x + bw + depth - 3},${y - depth + 3}`,
      `${x + bw + depth - 3},${y + height - depth - 3}`,
      `${x + bw + 3},${y + height - 3}`,
    ].join(" ");
    const topPoints = [
      `${x + 3},${y - 3}`,
      `${x + bw - 3},${y - 3}`,
      `${x + bw + depth - 3},${y - depth + 3}`,
      `${x + depth + 3},${y - depth + 3}`,
    ].join(" ");
    return { index: i, label: truncate(d[props.xKey]), rawLabel: d[props.xKey], value, x, y, height, depth, sidePoints, topPoints };
  })
);

function faceFill(face) {
  return props.mode === "gradient" ? `url(#${uid}-${face})` : color.value;
}

const SOLID_OPACITY = { back: 0.6, side: 0.7, top: 0.8, front: 1 };

function faceOpacity(face) {
  return props.mode === "gradient" ? 1 : SOLID_OPACITY[face];
}
</script>
