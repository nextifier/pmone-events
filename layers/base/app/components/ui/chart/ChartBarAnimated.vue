<template>
  <div ref="root" class="@container relative w-full">
    <!--
      Pointer events, not mouse events. `mouseenter`/`mouseleave` never fire on a
      touch screen, so on a phone this chart was a silhouette with no value, no
      label and no way to ask for either - on a page that is read on a phone more
      than anywhere else. `pointerenter`/`pointerleave` cover mouse, touch and pen
      with no change to desktop behaviour. `touch-action: manipulation` keeps the
      page scrollable over the chart.
    -->
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      class="w-full touch-manipulation"
      @pointerleave="setActive(null)"
    >
      <!-- A baseline. Without it the bars float, which is most of why the
           resting state read as scattered marks rather than as a chart. -->
      <line
        :x1="margin.left"
        :x2="W - margin.right"
        :y1="margin.top + innerH"
        :y2="margin.top + innerH"
        class="stroke-border"
        stroke-width="1"
      />
      <g
        v-for="bar in bars"
        :key="bar.label"
        @pointerenter="track($event, bar.index)"
        @pointerdown="track($event, bar.index)"
        @pointermove="track($event, bar.index)"
      >
        <rect
          :x="bar.active ? bar.fullX : bar.collapsedX"
          :y="bar.y"
          :width="bar.active ? barWidth : collapsedWidth"
          :height="bar.height"
          :fill="color"
          rx="3"
          :style="{ transition: 'x 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }"
        />
        <text
          v-if="bar.active"
          :x="bar.center"
          :y="bar.y - 6"
          text-anchor="middle"
          :fill="color"
          class="font-mono tabular-nums chart-animated-value tracking-tight"
          :style="{ fontSize: `${valueFontSize}px`, fontWeight: 500 }"
        >
          {{ valueFormatter ? valueFormatter(bar.value) : bar.value.toLocaleString() }}
        </text>
        <!-- Every category is named, not just the hovered one. This chart draws
             no axis at all, so without a permanent label row it says nothing at
             rest. The active one goes full strength; the others sit muted, the
             way an axis reads. margin.bottom already reserves the room. -->
        <text
          :x="bar.center"
          :y="H - 7"
          text-anchor="middle"
          class="tracking-tight"
          :class="bar.active ? 'fill-foreground' : 'fill-muted-foreground'"
          :style="{ fontSize: `${labelFontSize}px` }"
        >
          {{ bar.short }}
        </text>
        <!-- Invisible hit area so thin/collapsed bars stay hoverable -->
        <rect
          :x="bar.center - band / 2"
          :y="margin.top"
          :width="band"
          :height="innerH"
          fill="transparent"
        />
      </g>
    </svg>

    <!-- The value already appears above the active bar, but only as a bare
         number. The tooltip is what names the series, the way every other chart
         on the page does. -->
    <ChartHoverTooltip
      :open="activeIndex !== null"
      :x="pointer.x"
      :y="pointer.y"
      :box-width="boxSize.w"
      :box-height="boxSize.h"
    >
      <ChartTooltipContent
        v-if="activeIndex !== null"
        :label-key="xKey"
        :payload="{
          [xKey]: data[activeIndex]?.[xKey],
          [valueKey]: data[activeIndex]?.[valueKey],
        }"
        :config="config"
        :value-formatter="valueFormatter"
      />
    </ChartHoverTooltip>
  </div>
</template>

<script setup>
import ChartHoverTooltip from "./ChartHoverTooltip.vue";
import ChartTooltipContent from "./ChartTooltipContent.vue";
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
  colorOverride: {
    type: String,
    default: null,
  },
  /**
   * viewBox dimensions, and therefore the aspect ratio.
   *
   * The svg is `w-full` with a fixed viewBox, so height is width times the
   * ratio - drop this chart into a 1250px card at the old fixed 520x280 and it
   * came out 670px tall. Exposing the pair lets a wide card ask for a wide,
   * short plot instead of scaling one drawn for a narrow one.
   */
  width: {
    type: Number,
    default: 520,
  },
  height: {
    type: Number,
    default: 280,
  },
  // The value printed above the active bar. Without one a rupiah figure renders
  // as a bare "26250000".
  valueFormatter: {
    type: Function,
    default: null,
  },
  maxLabelChars: {
    type: Number,
    default: 14,
  },
});

const emit = defineEmits(["update:active"]);

const W = computed(() => props.width);
const H = computed(() => props.height);
const margin = { top: 24, right: 12, bottom: 24, left: 12 };
const innerW = computed(() => W.value - margin.left - margin.right);
const innerH = computed(() => H.value - margin.top - margin.bottom);
/**
 * The resting bar is a SHARE of the band, not a fixed 6px.
 *
 * At 6 user units against a 1000-unit viewBox, five bars rendered as five hair
 * lines floating in an empty box - no axis, no labels, nothing to read until
 * something was hovered. That is a chart that only exists on mouseover, on a
 * page that is read on a phone. 45% of the band reads as a bar chart at rest and
 * still leaves the hover expansion to 70% visible as a change.
 */
const COLLAPSED_SHARE = 0.45;

/**
 * The value text is painted with this too, so the fallback matters.
 *
 * It used to fall back to `var(--chart-1)`, which is gray-300 in BOTH themes -
 * about 1.4:1 against the light card. The numbers were invisible in light mode
 * unless the caller happened to pass a colorOverride. `--foreground` is the only
 * fallback that inverts with the theme.
 */
const color = computed(
  () => props.colorOverride || props.config[props.valueKey]?.color || "var(--foreground)"
);

const activeIndex = ref(null);

/**
 * Text inside a scaled viewBox is measured in USER UNITS, not screen pixels.
 *
 * The svg is `w-full` against a fixed viewBox, so everything drawn in it is
 * multiplied by `renderedWidth / viewBoxWidth`. A 1000-unit viewBox rendered at
 * 848px shrinks a "13px" label to 11px on screen, and nothing in the source
 * says so. Measuring the container and dividing back out keeps the label at the
 * size it claims, whatever width the card ends up.
 */
const root = ref(null);
const unitsPerPixel = ref(1);
let sizeObserver = null;

onMounted(() => {
  if (!root.value || typeof ResizeObserver === "undefined") return;
  sizeObserver = new ResizeObserver(([entry]) => {
    const rendered = entry.contentRect.width;
    unitsPerPixel.value = rendered > 0 ? props.width / rendered : 1;
  });
  sizeObserver.observe(root.value);
});

onBeforeUnmount(() => sizeObserver?.disconnect());

// The viewBox is fixed, so a long category name runs into its neighbour with no
// reflow to save it. Truncating degrades instead of colliding.
const truncate = (label) => {
  const text = String(label ?? "");
  return text.length > props.maxLabelChars ? `${text.slice(0, props.maxLabelChars - 1)}…` : text;
};

const valueFontSize = computed(() => 13 * unitsPerPixel.value);
const labelFontSize = computed(() => 12 * unitsPerPixel.value);

// Floored at 1: an empty array divides to Infinity and every bar comes out NaN,
// which renders as nothing at all rather than as an error.
const band = computed(() => innerW.value / Math.max(props.data.length, 1));
const barWidth = computed(() => band.value * 0.7);
const collapsedWidth = computed(() => band.value * COLLAPSED_SHARE);
const maxY = computed(() => Math.max(...props.data.map((d) => Number(d[props.valueKey]) || 0), 1));

const bars = computed(() =>
  props.data.map((d, i) => {
    const value = Number(d[props.valueKey]) || 0;
    const height = (value / maxY.value) * innerH.value;
    const center = margin.left + i * band.value + band.value / 2;
    const y = margin.top + (innerH.value - height);
    return {
      index: i,
      label: d[props.xKey],
      short: truncate(d[props.xKey]),
      value,
      center,
      y,
      height,
      fullX: center - barWidth.value / 2,
      collapsedX: center - collapsedWidth.value / 2,
      active: activeIndex.value === i,
    };
  })
);

const pointer = ref({ x: 0, y: 0 });
const boxSize = ref({ w: 0, h: 0 });

function track(event, i) {
  setActive(i);
  const rect = root.value?.getBoundingClientRect();
  if (!rect) return;
  boxSize.value = { w: rect.width, h: rect.height };
  pointer.value = { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function setActive(i) {
  activeIndex.value = i;
  emit("update:active", i === null ? null : props.data[i][props.valueKey]);
}
</script>

<style scoped>
.chart-animated-value {
  animation: chart-animated-value-in 0.2s ease-out;
}

@keyframes chart-animated-value-in {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
