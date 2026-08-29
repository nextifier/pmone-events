<template>
  <div class="bg-card text-card-foreground w-full overflow-hidden rounded-xl border">
    <div class="flex items-center gap-2 border-b px-6 py-4">
      <div class="grid flex-1 gap-1">
        <div v-if="title" class="text-base font-semibold tracking-tight">{{ title }}</div>
        <div v-if="description" class="text-muted-foreground text-sm tracking-tight">
          {{ description }}
        </div>
      </div>
      <Select v-model="timeRange">
        <SelectTrigger class="w-[150px] rounded-lg sm:w-[160px]" aria-label="Select a range">
          <SelectValue :placeholder="rangeOptions[0].label" />
        </SelectTrigger>
        <SelectContent class="rounded-xl">
          <SelectItem
            v-for="opt in rangeOptions"
            :key="opt.value"
            :value="opt.value"
            class="rounded-lg"
          >
            {{ opt.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div ref="plot" class="px-2 pt-4 pb-2 sm:px-6">
      <ChartContainer :config="config" class="aspect-auto h-[250px] w-full">
        <VisXYContainer
          :data="filtered"
          :svg-defs="svgDefs"
          :margin="{ left: 4, right: 4 }"
          :y-domain="[0, undefined]"
        >
          <VisArea
            :x="(d) => d[xKey]"
            :y="areaY"
            :color="areaColor"
            :opacity="0.5"
            :curve-type="CurveType.Natural"
          />
          <VisLine
            :x="(d) => d[xKey]"
            :y="areaY"
            :color="lineColor"
            :line-width="1.5"
            :curve-type="CurveType.Natural"
          />
          <VisAxis
            type="x"
            :x="(d) => d[xKey]"
            :tick-line="false"
            :domain-line="false"
            :grid-line="false"
            :tick-values="xTickValues"
            :tick-format="xFormat"
          />
          <VisAxis
            type="y"
            :num-ticks="3"
            :tick-line="false"
            :domain-line="false"
            :tick-format="yFormat"
          />
          <ChartTooltip />
          <ChartCrosshair :template="tooltipTemplate" :color="crosshairColor" />
        </VisXYContainer>
        <ChartLegendContent />
      </ChartContainer>
    </div>
  </div>
</template>

<script setup>
import { VisArea, VisAxis, VisLine, VisXYContainer } from "@unovis/vue";
import { CurveType } from "@unovis/ts";
import {
  ChartContainer,
  ChartCrosshair,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
} from ".";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  config: {
    type: Object,
    required: true,
  },
  dataKeys: {
    type: Array,
    default: null,
  },
  xKey: {
    type: String,
    default: "date",
  },
  title: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
});

/**
 * "All" leads, and it is the default.
 *
 * The list used to start at "Last 3 months" with 90d selected, so a series
 * longer than ninety days silently lost its head while the card's own heading
 * still described the full period. A control that narrows the window is useful;
 * one that narrows it before anybody asks is a card that misreports its own
 * subject. `days: null` means no filtering at all.
 */
const rangeOptions = [
  { value: "all", label: "All", days: null },
  { value: "90d", label: "Last 3 months", days: 90 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "7d", label: "Last 7 days", days: 7 },
];

const timeRange = ref("all");

const keys = computed(() =>
  props.dataKeys && props.dataKeys.length
    ? props.dataKeys
    : Object.keys(props.config).filter((key) => props.config[key]?.color)
);

const latestDate = computed(() => {
  const times = props.data
    .map((d) => new Date(d[props.xKey]).getTime())
    .filter((t) => !Number.isNaN(t));
  return times.length ? new Date(Math.max(...times)) : new Date();
});

const filtered = computed(() => {
  const days = rangeOptions.find((o) => o.value === timeRange.value)?.days ?? null;

  if (days === null) {
    return props.data;
  }

  const start = new Date(latestDate.value);
  start.setDate(start.getDate() - days);
  return props.data.filter((d) => new Date(d[props.xKey]) >= start);
});

/**
 * Where the labels go.
 *
 * `numTicks` is a HINT: Unovis hands it to d3, which answers with round
 * intervals in TIME rather than with positions in the data. Over three days it
 * drew four ticks twelve hours apart - "Aug 26 · Aug 26 · Aug 27 · Aug 28" -
 * two of them naming the same day, which reads as a rendering fault rather than
 * as a short range. Naming the values outright takes the guess away: every
 * label sits on a real day, and a day either gets its own label or none.
 *
 * The count follows the WIDTH at ~78px a label, the density the reference works
 * out to, rather than the old fixed six that gave a 1470px chart and a 340px one
 * the same handful. Read off `filtered`, so the range control relabels the axis.
 */
const plot = ref(null);
const plotWidth = ref(0);
let plotObserver = null;

onMounted(() => {
  if (!plot.value || typeof ResizeObserver === "undefined") return;
  plotObserver = new ResizeObserver(([entry]) => {
    plotWidth.value = entry.contentRect.width;
  });
  plotObserver.observe(plot.value);
});

onBeforeUnmount(() => plotObserver?.disconnect());

// Unovis scales everything through `+value`, so the axis wants the same
// milliseconds the series is plotted at rather than the Date objects.
const xValues = computed(() =>
  (filtered.value ?? [])
    .map((d) => {
      const value = d?.[props.xKey];
      return value instanceof Date ? value.getTime() : new Date(value).getTime();
    })
    .filter((value) => !Number.isNaN(value))
);

/**
 * Walked BACKWARDS from the last point: the most recent one is what the reader
 * looks for, and anchoring on the first left it unlabelled whenever the step
 * did not divide the range evenly.
 */
const xTickValues = computed(() => {
  const values = xValues.value;

  if (values.length < 2) return values;

  const fits = Math.max(2, Math.floor((plotWidth.value || 480) / 78));
  const step = Math.ceil(values.length / fits);

  if (step <= 1) return values;

  const out = [];
  for (let i = values.length - 1; i >= 0; i -= step) {
    out.unshift(values[i]);
  }

  return out;
});

const colorList = computed(() => keys.value.map((key) => props.config[key]?.color || "var(--chart-1)"));

const areaY = computed(() => {
  const accessors = keys.value.map((key) => (d) => d[key]);
  return accessors.length === 1 ? accessors[0] : accessors;
});

const areaColor = computed(() => {
  const colors = keys.value.map((key) => `url(#fill-${key})`);
  return colors.length === 1 ? colors[0] : colors;
});

const lineColor = computed(() => (colorList.value.length === 1 ? colorList.value[0] : colorList.value));

const crosshairColor = (d, i) => colorList.value[i % colorList.value.length];

const svgDefs = computed(() =>
  keys.value
    .map((key) => {
      const color = props.config[key]?.color || "var(--chart-1)";
      return `<linearGradient id="fill-${key}" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stop-color="${color}" stop-opacity="0.8" /><stop offset="95%" stop-color="${color}" stop-opacity="0.1" /></linearGradient>`;
    })
    .join("")
);

const xFormat = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const yFormat = (d) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(d);

const currentConfig = computed(() => props.config);

const tooltipTemplate = componentToString(currentConfig, ChartTooltipContent, {
  labelFormatter: (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
});
</script>
