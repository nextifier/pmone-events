<template>
  <ChartContainer
    :config="mergedConfig"
  >
    <VisXYContainer
      :data="drawData"
      :svg-defs="svgDefs"
      :margin="{ left: 8, right: 0 }"
      :padding="{ top: 12, bottom: 12 }"
      :y-domain="[0, undefined]"
    >
      <!-- Comparison Area (rendered first to be behind main area) -->
      <VisArea
        v-if="gradient && hasComparisonData"
        :x="(d) => d.date"
        :y="(d) => d[comparisonKey]"
        :color="`url(#${gradientIds.comparison})`"
        :opacity="0.3"
        :curve-type="CurveType.CatmullRom"
      />
      <!-- Main Area.
           Follows the FULL series, not the solid half. VisLine skips an
           undefined y; VisArea has to close its shape, so it reads undefined as
           zero - and on a chart with an unfinished tail the wash slid down to
           the axis, which reads as a collapse in sales that never happened.
           Feeding the area its own truncated rows does not help either: the
           Unovis component takes the container's data over its own `data` prop.
           The dashed line already says the last day is still counting; the wash
           underneath it is decoration and does not need to repeat it. -->
      <VisArea
        v-if="gradient"
        :x="(d) => d.date"
        :y="(d) => d[dataKey]"
        :color="`url(#${gradientIds.main})`"
        :opacity="0.4"
        :curve-type="CurveType.CatmullRom"
      />
      <!-- Comparison Line (rendered first to be behind main line) -->
      <VisLine
        v-if="hasComparisonData"
        :x="(d) => d.date"
        :y="(d) => d[comparisonKey]"
        :color="comparisonColor"
        :line-width="2"
        :curve-type="CurveType.CatmullRom"
        :line-dash-array="[4, 4]"
      />
      <!-- Main Line -->
      <VisLine
        :x="(d) => d.date"
        :y="(d) => d[solidKey]"
        :color="activeColor"
        :line-width="2"
        :curve-type="CurveType.CatmullRom"
      />
      <!-- Unfinished tail: same colour, dashed, so it reads as the same line
           still being drawn rather than as a drop. -->
      <VisLine
        v-if="hasSplitSeries"
        :x="(d) => d.date"
        :y="(d) => d[DASHED_KEY]"
        :color="activeColor"
        :line-width="2"
        :curve-type="CurveType.CatmullRom"
        :line-dash-array="[4, 4]"
      />
      <VisAxis
        type="x"
        :num-ticks="xTickCount"
        :tickTextHideOverlapping="true"
        :x="(d) => d.date"
        :tick-line="false"
        :domain-line="false"
        :grid-line="false"
        tickTextAlign="right"
        :fullSize="false"
        :tick-format="
          (d) => {
            const date = new Date(d);
            return date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
          }
        "
      />
      <VisAxis
        type="y"
        :num-ticks="5"
        :tickTextHideOverlapping="true"
        :tick-line="false"
        :domain-line="false"
        :grid-line="grid"
        :tick-format="
          (d) =>
            yTickFormatter
              ? yTickFormatter(d)
              : new Intl.NumberFormat('en-US', {
                  notation: 'compact',
                  maximumFractionDigits: 1,
                }).format(d)
        "
      />
      <ChartTooltip />
      <ChartCrosshair
        :template="tooltipTemplate"
        :color="activeColor"
      />
    </VisXYContainer>
  </ChartContainer>
</template>

<script setup>
import { VisArea, VisAxis, VisLine, VisXYContainer } from "@unovis/vue";
import { CurveType } from "@unovis/ts";
import { useId } from "reka-ui";
import {
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
  liftSeriesColor,
} from ".";

const props = defineProps({
  /**
   * Horizontal grid lines, on by default.
   *
   * shadcn draws `<CartesianGrid vertical={false} />` in every bar, area and
   * line demo, so this matched the reference only by accident before: ChartLine
   * inherited Unovis' `gridLine: true`, while ChartBar and ChartArea defaulted
   * to false. Two charts side by side on one dashboard came out different.
   */
  grid: {
    type: Boolean,
    default: true,
  },
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
  gradient: {
    type: Boolean,
    default: false,
  },
  comparisonData: {
    type: Array,
    default: () => [],
  },
  comparisonLabel: {
    type: String,
    default: "Previous Period",
  },
  // Optional custom Y-axis tick formatter. Defaults to en-US compact when null,
  // so existing charts are unaffected.
  yTickFormatter: {
    type: Function,
    default: null,
  },
  // First date whose data is still being collected, as YYYY-MM-DD. The segment
  // from the last complete point onward is drawn dashed and the area fill stops
  // before it, so a day that is only a few hours old reads as unfinished instead
  // of as a crash. Null keeps the old behaviour exactly.
  partialFrom: {
    type: String,
    default: null,
  },
});

const SOLID_KEY = "__chartSolid";
const DASHED_KEY = "__chartPartial";

const toDateKey = (value) =>
  value instanceof Date ? value.toISOString().split("T")[0] : String(value).split("T")[0];

// Generate the comparison key name
const comparisonKey = computed(() => `${props.dataKey}_previous`);

// Check if we have comparison data
const hasComparisonData = computed(() => props.comparisonData && props.comparisonData.length > 0);

// The palette ramp runs light -> dark and is defined identically for light and
// dark mode, so no slot in it reads as prominent on both backgrounds: on white
// the active line was pale enough to lose, while the comparison line sat at the
// dark end and pulled the eye first. Mixing the series colour toward the
// foreground lifts the active line and mixing it toward the background pushes
// the comparison back, which holds in both themes and for any palette.
const seriesColor = computed(() => props.config[props.dataKey]?.color || "var(--chart-1)");

/**
 * Never more ticks than there are days to name.
 *
 * A fixed ten ticks over a three-day series makes Unovis pick ten evenly spaced
 * x values and format each one as a date, so the axis reads
 * "Aug 26 · Aug 26 · Aug 26 · Aug 27 …" - the same day printed three times,
 * which looks like a rendering fault rather than a short range.
 */
const xTickCount = computed(() => {
  const days = new Set(
    props.data.map((d) => {
      const date = d?.date instanceof Date ? d.date : new Date(d?.date);
      return Number.isNaN(date.getTime()) ? String(d?.date) : date.toDateString();
    })
  );

  return Math.max(2, Math.min(10, days.size));
});

const activeColor = computed(() => liftSeriesColor(seriesColor.value));

// The gradient sits UNDER the line, so it takes a lighter lift than the stroke -
// enough to be visible on a white card, not so much that it swallows its own line.
const fillColor = computed(() => liftSeriesColor(seriesColor.value, 70));

// Half-strength version of whatever the active line ended up as, so the gap
// between the two stays the same on either background.
const comparisonColor = computed(
  () => `color-mix(in oklab, ${activeColor.value} 50%, var(--background))`
);

// Merge current data with comparison data
const mergedData = computed(() => {
  if (!hasComparisonData.value) {
    return props.data;
  }

  // Create a map of comparison data by date
  const comparisonMap = new Map();
  props.comparisonData.forEach((item) => {
    const dateStr =
      item.date instanceof Date ? item.date.toISOString().split("T")[0] : String(item.date);
    comparisonMap.set(dateStr, item);
  });

  // Merge comparison values into current data
  return props.data.map((item) => {
    const dateStr =
      item.date instanceof Date ? item.date.toISOString().split("T")[0] : String(item.date);
    const compItem = comparisonMap.get(dateStr);

    return {
      ...item,
      [comparisonKey.value]: compItem ? compItem[props.dataKey] || 0 : null,
    };
  });
});

const hasPartialTail = computed(() => Boolean(props.partialFrom));

// Two draw-only fields. They are deliberately absent from the config, so the
// tooltip never grows a second row for what is really one line.
// Index of the last point that belongs to a finished day, or -1 when there is
// no complete half to draw.
const lastCompleteIndex = computed(() => {
  if (!hasPartialTail.value) {
    return -1;
  }

  let index = -1;
  mergedData.value.forEach((row, i) => {
    if (toDateKey(row.date) < props.partialFrom) {
      index = i;
    }
  });

  return index;
});

const drawData = computed(() => {
  if (!hasPartialTail.value) {
    return mergedData.value;
  }

  const rows = mergedData.value;
  // The dashed run starts at the last complete point so the two halves join up
  // instead of leaving a gap.
  const lastComplete = lastCompleteIndex.value;

  // A range that holds nothing but the unfinished day has no solid half to join
  // onto, and a dashed run of one point draws nothing at all. Fall back to the
  // plain line so a one-day view still shows something.
  if (lastComplete < 0) {
    return rows;
  }

  // `undefined`, not `null`: Unovis plots null as zero, which drew the dashed
  // series as a flat line along the axis for the whole chart. Undefined is what
  // makes it skip the point.
  return rows.map((row, index) => ({
    ...row,
    [SOLID_KEY]: index <= lastComplete ? row[props.dataKey] : undefined,
    [DASHED_KEY]: index >= lastComplete ? row[props.dataKey] : undefined,
  }));
});

const hasSplitSeries = computed(
  () => hasPartialTail.value && drawData.value.some((row) => SOLID_KEY in row)
);

const solidKey = computed(() => (hasSplitSeries.value ? SOLID_KEY : props.dataKey));

// Merged config including comparison series. The active series carries the same
// colour the line is drawn in, otherwise the tooltip swatches end up reading the
// opposite way round from the chart they belong to.
const mergedConfig = computed(() => {
  const config = {
    ...props.config,
    [props.dataKey]: {
      ...props.config[props.dataKey],
      color: activeColor.value,
    },
  };

  if (!hasComparisonData.value) {
    return config;
  }

  return {
    ...config,
    [comparisonKey.value]: {
      label: props.comparisonLabel,
      color: comparisonColor.value,
    },
  };
});

const currentConfig = computed(() => mergedConfig.value);

const tooltipTemplate = componentToString(currentConfig, ChartTooltipContent, {
  hideLabel: false,
  labelFormatter: (d) => {
    const date = new Date(d);
    const label = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    // Says out loud what the dashed segment only implies.
    return props.partialFrom && toDateKey(date) >= props.partialFrom
      ? `${label} · still counting`
      : label;
  },
});

// Instance-scoped ids. Global ones collided as soon as two ChartLines shared a
// page: the second instance's defs won and both charts drew the same fill.
const gradientUid = useId();
const gradientIds = computed(() => ({
  main: `fillChart1-${gradientUid}`,
  secondary: `fillChart2-${gradientUid}`,
  comparison: `fillChartComparison-${gradientUid}`,
}));

const svgDefs = computed(
  () => `
  <linearGradient id="${gradientIds.value.main}" x1="0" y1="0" x2="0" y2="1">
    <stop
      offset="5%"
      stop-color="${fillColor.value}"
      stop-opacity="0.8"
    />
    <stop
      offset="95%"
      stop-color="${fillColor.value}"
      stop-opacity="0.1"
    />
  </linearGradient>
  <linearGradient id="${gradientIds.value.secondary}" x1="0" y1="0" x2="0" y2="1">
    <stop
      offset="5%"
      stop-color="${liftSeriesColor('var(--chart-2)', 70)}"
      stop-opacity="0.8"
    />
    <stop
      offset="95%"
      stop-color="${liftSeriesColor('var(--chart-2)', 70)}"
      stop-opacity="0.1"
    />
  </linearGradient>
  <linearGradient id="${gradientIds.value.comparison}" x1="0" y1="0" x2="0" y2="1">
    <stop
      offset="5%"
      stop-color="${comparisonColor.value}"
      stop-opacity="0.4"
    />
    <stop
      offset="95%"
      stop-color="${comparisonColor.value}"
      stop-opacity="0.1"
    />
  </linearGradient>
`
);
</script>
