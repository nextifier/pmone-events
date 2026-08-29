<template>
  <div class="@container flex w-full flex-col items-center">
    <div
      ref="box"
      class="relative mx-auto aspect-square w-full max-w-[300px]"
      @pointerleave="active = null"
    >
      <svg :viewBox="`0 0 ${VB} ${VB}`" class="w-full">
        <defs>
          <linearGradient
            v-for="(ring, i) in rings"
            :id="ring.gradientId"
            :key="ring.gradientId"
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop offset="0%" :stop-color="ring.color" stop-opacity="0.5" />
            <stop offset="100%" :stop-color="ring.color" stop-opacity="1" />
          </linearGradient>
          <filter :id="glowId" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g :transform="`rotate(-90 ${cx} ${cy})`">
          <!-- Background tracks -->
          <template v-if="background">
            <circle
              v-for="ring in rings"
              :key="`track-${ring.name}`"
              :cx="cx"
              :cy="cy"
              :r="ring.radius"
              fill="none"
              class="stroke-muted"
              :stroke-width="barSize"
            />
          </template>
          <!-- Value arcs -->
          <circle
            v-for="ring in rings"
            :key="`bar-${ring.name}`"
            :cx="cx"
            :cy="cy"
            :r="ring.radius"
            fill="none"
            :stroke="gradient ? `url(#${ring.gradientId})` : ring.color"
            :stroke-width="barSize"
            stroke-linecap="round"
            :stroke-dasharray="`${ring.dash} ${ring.circumference}`"
            :filter="glow ? `url(#${glowId})` : undefined"
          />

          <!-- Hit rings. A full circle at each radius rather than just the drawn
               arc, so a ring at 5% is as reachable as one at 95% - a target that
               shrinks with the value is a target you cannot use on the rows that
               most need explaining. Transparent stroke still takes pointer
               events; `fill="none"` means the middle stays clickable-through. -->
          <circle
            v-for="(ring, i) in rings"
            :key="`hit-${ring.name}`"
            :cx="cx"
            :cy="cy"
            :r="ring.radius"
            fill="none"
            stroke="transparent"
            :stroke-width="Math.max(barSize, 14)"
            class="cursor-pointer"
            @pointerenter="track($event, i)"
            @pointerdown="track($event, i)"
            @pointermove="track($event, i)"
          />
        </g>

        <!--
             Haloed, not inverse-filled.

             This used to be `fill: var(--background)` on the claim that a bar is
             always dark in light mode and light in dark mode. That holds only at
             the two ends of the ramp: `chartSurface()` gives the middle rings a
             MID grey, and white text on mid grey is unreadable in either theme.
             A zero-value ring made it worse - there is no arc at twelve o'clock
             to sit on, so the label landed on the empty track and vanished.

             Foreground text with a card-coloured outline reads on any fill, in
             both themes, at any value. 12px matches the axis ticks the rest of
             the library draws; this is an in-chart annotation, not body copy.

             Skipped at zero: a "0" pinned to the top of an empty track points at
             nothing.
        -->
        <template v-if="labelsFit">
          <text
            v-for="ring in rings.filter((r) => r.value > 0)"
            :key="`label-${ring.name}`"
            :x="cx"
            :y="cy - ring.radius"
            text-anchor="middle"
            dominant-baseline="central"
            :style="{
              fill: 'var(--foreground)',
              stroke: 'var(--card)',
              strokeWidth: '3px',
              paintOrder: 'stroke',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              fontVariantNumeric: 'tabular-nums',
            }"
          >
            {{ ring.value }}
          </text>
        </template>
      </svg>

      <!-- shadcn's radial demo passes `<ChartTooltipContent hideLabel
           nameKey="browser" />`: no header row, the row named by the datum's own
           key. Mirrored exactly. -->
      <ChartHoverTooltip
        :open="active !== null"
        :x="pointer.x"
        :y="pointer.y"
        :box-width="boxSize.w"
        :box-height="boxSize.h"
      >
        <ChartTooltipContent
          v-if="active !== null"
          hide-label
          :name-key="nameKey"
          :value-key="valueKey"
          :payload="{ ...data[active], fill: rings[active]?.color }"
          :config="config"
          :value-formatter="valueFormatter"
        />
      </ChartHoverTooltip>
    </div>

    <div v-if="legend" class="flex flex-wrap items-center justify-center gap-4 pt-1">
      <div v-for="ring in rings" :key="`legend-${ring.name}`" class="flex items-center gap-1.5">
        <span class="size-2 shrink-0 rounded-[2px]" :style="{ backgroundColor: ring.color }" />
        <span class="text-muted-foreground text-xs tracking-tight sm:text-sm">{{ ring.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import ChartHoverTooltip from "./ChartHoverTooltip.vue";
import ChartTooltipContent from "./ChartTooltipContent.vue";
let radialUid = 0;

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  config: {
    type: Object,
    required: true,
  },
  valueKey: {
    type: String,
    default: "value",
  },
  nameKey: {
    type: String,
    default: "name",
  },
  innerRadius: {
    type: Number,
    default: 35,
  },
  outerRadius: {
    type: Number,
    default: 110,
  },
  barSize: {
    type: Number,
    default: 22,
  },
  max: {
    type: Number,
    default: 100,
  },
  gradient: {
    type: Boolean,
    default: true,
  },
  glow: {
    type: Boolean,
    default: true,
  },
  background: {
    type: Boolean,
    default: true,
  },
  // Forwarded to the tooltip. Without one a percentage series renders as a bare
  // "77.5", which reads as a count.
  valueFormatter: {
    type: Function,
    default: null,
  },
  showLabels: {
    type: Boolean,
    default: true,
  },
  legend: {
    type: Boolean,
    default: true,
  },
});

const VB = 250;
const cx = VB / 2;
const cy = VB / 2;

const uid = `radial-${(radialUid += 1)}`;
const glowId = `${uid}-glow`;

/**
 * Labels are dropped when the rings sit too close to carry them.
 *
 * Every label shares `x = cx` and differs only by radius, so the vertical
 * distance between two of them is exactly one ring pitch. At 12px text a pitch
 * under 16 units means the glyphs touch, and under about 12 they overlap
 * outright - which is what "100 / 77.5 / 35.8" stacked on top of each other at
 * twelve o'clock looked like. Better to show none than to show a smear.
 */
const ringPitch = computed(() => {
  const count = props.data.length;
  if (count < 2) return Infinity;
  const band = props.outerRadius - props.innerRadius;
  const gap = Math.max((band - count * props.barSize) / (count - 1), 2);
  return props.barSize + gap;
});

const labelsFit = computed(() => props.showLabels && ringPitch.value >= 16);

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

const rings = computed(() => {
  const count = props.data.length;
  const band = props.outerRadius - props.innerRadius;
  const gap = count > 1 ? Math.max((band - count * props.barSize) / (count - 1), 2) : 0;

  return props.data.map((d, i) => {
    const name = d[props.nameKey];
    const value = Number(d[props.valueKey]) || 0;
    // First data row sits on the outermost ring.
    const radius = props.outerRadius - props.barSize / 2 - i * (props.barSize + gap);
    const circumference = 2 * Math.PI * radius;
    const frac = Math.min(value / props.max, 1);
    return {
      name,
      value,
      label: props.config[name]?.label || name,
      color: d.colorValue || props.config[name]?.color || "var(--chart-1)",
      radius,
      circumference,
      dash: frac * circumference,
      gradientId: `${uid}-grad-${i}`,
    };
  });
});
</script>
