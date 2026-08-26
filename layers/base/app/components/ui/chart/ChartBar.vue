<template>
  <ChartContainer
    :config="config"
    :style="barStyle"
    class="[&_.domain]:stroke-gray-200 dark:[&_.domain]:stroke-gray-800!"
  >
    <VisXYContainer
      :data="data"
      :margin="resolvedMargin"
      :svg-defs="svgDefs || undefined"
      :y-domain="horizontal ? undefined : [0, undefined]"
      :x-domain="horizontal ? [0, undefined] : undefined"
    >
      <VisStackedBar
        v-if="stacked"
        :x="xAccessor"
        :y="barY"
        :color="barColor"
        :rounded-corners="roundedCorners"
        :orientation="horizontal ? Orientation.Horizontal : Orientation.Vertical"
        :bar-padding="barPadding"
        :bar-max-width="barMaxWidth || undefined"
      />
      <VisGroupedBar
        v-else
        :x="xAccessor"
        :y="barY"
        :color="barColor"
        :rounded-corners="roundedCorners"
        :orientation="horizontal ? Orientation.Horizontal : Orientation.Vertical"
        :bar-padding="barPadding"
        :bar-max-width="barMaxWidth || undefined"
      />
      <!--
        Value labels. Unovis' bar components have no label API, so the numbers
        ride on a zero-size Scatter pinned to each bar's tip - the equivalent of
        shadcn's <LabelList>. Without it a bar chart only says "bigger", and the
        real counts live in a tooltip that does not exist on touch.
      -->
      <VisScatter
        v-if="showLabels"
        :x="labelX"
        :y="labelY"
        :size="0"
        color="transparent"
        :label="labelAccessor"
        :label-position="labelPositionValue"
        label-color="var(--foreground)"
        :label-hide-overlapping="true"
      />
      <VisAxis
        v-if="horizontal"
        type="y"
        :tick-line="false"
        :domain-line="false"
        :grid-line="false"
        :tickTextHideOverlapping="true"
        :num-ticks="tickValues.length"
        :tick-values="tickValues"
        :tick-format="categoryTickFormat"
      />
      <template v-else>
        <VisAxis
          type="x"
          :x="xAccessor"
          :tick-line="false"
          :domain-line="false"
          :grid-line="false"
          :tickTextHideOverlapping="true"
          :num-ticks="tickValues.length"
          :tick-values="tickValues"
          :tick-format="categoryTickFormat"
        />
        <VisAxis
          type="y"
          :num-ticks="4"
          :tick-line="false"
          :domain-line="false"
          :grid-line="grid"
          :tick-format="yTickFormatter || defaultYFormat"
        />
      </template>
      <ChartTooltip />
      <ChartCrosshair :template="tooltipTemplate" color="#0000" />
    </VisXYContainer>
    <ChartLegendContent v-if="legend" />
  </ChartContainer>
</template>

<script setup>
import { VisAxis, VisGroupedBar, VisScatter, VisStackedBar, VisXYContainer } from "@unovis/vue";
import { Orientation, Position } from "@unovis/ts";
import {
  ChartContainer,
  ChartCrosshair,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
} from ".";

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  config: {
    type: Object,
    required: true,
  },
  dataKey: {
    type: String,
    default: "value",
  },
  dataKeys: {
    type: Array,
    default: null,
  },
  xKey: {
    type: String,
    default: "date",
  },
  horizontal: {
    type: Boolean,
    default: false,
  },
  stacked: {
    type: Boolean,
    default: false,
  },
  legend: {
    type: Boolean,
    default: false,
  },
  roundedCorners: {
    type: Number,
    default: 6,
  },
  // Print each bar's value on the chart. Single-series only: on a grouped or
  // stacked chart the labels would collide, so `labelKey` picks the one series
  // worth naming.
  labels: {
    type: Boolean,
    default: false,
  },
  labelKey: {
    type: String,
    default: null,
  },
  // Falls back to valueFormatter, then toLocaleString.
  labelFormatter: {
    type: Function,
    default: null,
  },
  // Dim every bar except this one, the way shadcn's "Bar Chart - Active" reads.
  // Single-series only.
  activeIndex: {
    type: Number,
    default: null,
  },
  // Caps bar thickness so sparse data (few categories) doesn't blow up into
  // giant bars. null leaves Unovis' default (bars fill their band).
  barMaxWidth: {
    type: Number,
    default: null,
  },
  // Fraction of each band left empty between bars (0-1). Higher = thinner bars.
  barPadding: {
    type: Number,
    default: 0.2,
  },
  // Draw horizontal grid lines behind the bars.
  grid: {
    type: Boolean,
    default: false,
  },
  // Raw SVG <defs> string (patterns/gradients/filters) injected into the chart
  // SVG. Reference them from barFill via url(#id).
  svgDefs: {
    type: String,
    default: null,
  },
  // Override the bar fill. A string applies to every series; an object maps each
  // series key to its own fill (e.g. url(#pattern) for one, a color for another);
  // a function receives (datum, index) so a single-series chart can colour each
  // category from the ramp, the way shadcn's "Bar Chart - Mixed" does.
  barFill: {
    type: [String, Object, Function],
    default: null,
  },
  // Outline drawn around every bar (e.g. to frame a pattern fill).
  barStroke: {
    type: String,
    default: null,
  },
  barStrokeWidth: {
    type: Number,
    default: 1,
  },
  margin: {
    type: Object,
    default: null,
  },
  xTickFormatter: {
    type: Function,
    default: null,
  },
  yTickFormatter: {
    type: Function,
    default: null,
  },
  // Formats the value shown in the tooltip (e.g. currency). Falls back to
  // toLocaleString when not provided.
  valueFormatter: {
    type: Function,
    default: null,
  },
  // Full-control tooltip row formatter, forwarded to ChartTooltipContent's
  // `formatter(value, name, item, index, payload)`. Returns a string that
  // replaces the default label/value split for each series row.
  tooltipFormatter: {
    type: Function,
    default: null,
  },
});

const keys = computed(() =>
  props.dataKeys && props.dataKeys.length ? props.dataKeys : [props.dataKey]
);

const isMulti = computed(() => keys.value.length > 1);

const barY = computed(() => {
  const accessors = keys.value.map((key) => (d) => d[key]);
  return accessors.length === 1 ? accessors[0] : accessors;
});

const barColor = computed(() => {
  // A per-datum fill or an active bar both need an accessor rather than a
  // constant, and both only make sense on a single series.
  if (!isMulti.value && (typeof props.barFill === "function" || props.activeIndex !== null)) {
    const base = keys.value[0];
    const fallback =
      typeof props.barFill === "string"
        ? props.barFill
        : props.config[base]?.color || "var(--chart-1)";

    return (d, i) => {
      const fill = typeof props.barFill === "function" ? props.barFill(d, i) : fallback;
      if (props.activeIndex === null || props.activeIndex === i) {
        return fill;
      }
      return `color-mix(in oklab, ${fill} 35%, var(--background))`;
    };
  }

  const colors = keys.value.map((key) => {
    if (props.barFill) {
      if (typeof props.barFill === "string") {
        return props.barFill;
      }
      if (props.barFill[key]) {
        return props.barFill[key];
      }
    }
    return props.config[key]?.color || "var(--chart-1)";
  });
  return colors.length === 1 ? colors[0] : colors;
});

// Bar outline is set through Unovis' CSS variables (works for both grouped and
// stacked) so a pattern fill can be framed without touching the fill accessor.
const barStyle = computed(() => {
  if (!props.barStroke) {
    return undefined;
  }
  return {
    "--vis-grouped-bar-stroke-color": props.barStroke,
    "--vis-grouped-bar-stroke-width": `${props.barStrokeWidth}px`,
    "--vis-stacked-bar-stroke-color": props.barStroke,
    "--vis-stacked-bar-stroke-width": `${props.barStrokeWidth}px`,
  };
});

const categoryValues = computed(() => props.data.map((d) => d[props.xKey]));

// Unovis' XY scales are numeric, so string categories (e.g. "Jan") are mapped
// to their row index and the original label is restored on the axis/tooltip.
const isCategorical = computed(() =>
  categoryValues.value.some((v) => typeof v === "string")
);

const xAccessor = computed(() =>
  isCategorical.value ? (_d, i) => i : (d) => d[props.xKey]
);

const tickValues = computed(() =>
  isCategorical.value ? props.data.map((_d, i) => i) : categoryValues.value
);

const categoryTickFormat = computed(() => {
  if (isCategorical.value) {
    return (i) => {
      const label = categoryValues.value[i];
      return props.xTickFormatter ? props.xTickFormatter(label) : label;
    };
  }
  return props.xTickFormatter || defaultXFormat;
});

const resolvedMargin = computed(
  () =>
    props.margin ||
    (props.horizontal
      ? { top: 4, right: 8, bottom: 4, left: 60 }
      : { top: 6, right: 8, bottom: 18, left: 26 })
);

const defaultXFormat = (d) => {
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? String(d) : date.toLocaleDateString("en-US", { month: "short" });
};

const defaultYFormat = (d) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(d);

// Value labels ───────────────────────────────────────────────────────────────
const labelSeries = computed(() => props.labelKey || keys.value[0]);

const showLabels = computed(() => props.labels && props.data.length > 0);

const labelValue = (d) => d?.[labelSeries.value];

// The Scatter shares the container's real screen axes, so it does not follow the
// bars' `orientation` flip: a horizontal chart puts the value on x.
const labelX = computed(() => (props.horizontal ? labelValue : xAccessor.value));
const labelY = computed(() => (props.horizontal ? xAccessor.value : labelValue));

const labelPositionValue = computed(() =>
  props.horizontal ? Position.Right : Position.Top
);

const labelAccessor = computed(() => (d) => {
  const value = labelValue(d);
  if (value === null || value === undefined) {
    return "";
  }
  const format = props.labelFormatter || props.valueFormatter;
  return format ? String(format(value)) : Number(value).toLocaleString();
});

const currentConfig = computed(() => props.config);

const tooltipTemplate = componentToString(currentConfig, ChartTooltipContent, {
  indicator: isMulti.value ? "dashed" : "dot",
  hideLabel: false,
  valueFormatter: props.valueFormatter || undefined,
  formatter: props.tooltipFormatter || undefined,
  // Reuse the axis formatter for the tooltip's x label so index-based charts
  // (numeric x) read the real category instead of a bogus epoch date.
  labelFormatter: (d) => {
    if (isCategorical.value) {
      const label = categoryValues.value[d];
      return props.xTickFormatter ? props.xTickFormatter(label) : label;
    }
    if (props.xTickFormatter) {
      return props.xTickFormatter(d);
    }
    const date = new Date(d);
    return Number.isNaN(date.getTime())
      ? String(d)
      : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  },
});
</script>
