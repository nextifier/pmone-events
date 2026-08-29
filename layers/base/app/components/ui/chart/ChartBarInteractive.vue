<template>
  <div class="bg-card text-card-foreground w-full overflow-hidden rounded-xl border">
    <div class="flex flex-col items-stretch border-b sm:flex-row">
      <div class="flex flex-1 flex-col justify-center gap-1 px-6 py-4">
        <div v-if="title" class="text-base font-semibold tracking-tight">{{ title }}</div>
        <div v-if="description" class="text-muted-foreground text-sm tracking-tight">
          {{ description }}
        </div>
      </div>
      <div class="flex">
        <button
          v-for="key in keys"
          :key="key"
          type="button"
          :data-active="activeChart === key"
          class="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-3 text-left transition-colors even:border-l sm:border-t-0 sm:border-l sm:px-8"
          @click="activeChart = key"
        >
          <span class="text-muted-foreground text-xs tracking-tight">
            {{ config[key]?.label || key }}
          </span>
          <span class="text-lg leading-none font-semibold tracking-tighter sm:text-2xl">
            {{ totals[key].toLocaleString() }}
          </span>
        </button>
      </div>
    </div>
    <div ref="plot" class="px-2 pt-4 pb-2 sm:px-6">
      <ChartContainer :config="config" class="aspect-auto h-[250px] w-full" cursor>
        <VisXYContainer
          :data="data"
          :margin="{ left: 4, right: 4 }"
          :x-domain="xDomain"
          :y-domain="yDomain"
        >
          <!-- 0.11, measured against the reference rather than guessed.
               Recharts leaves `barCategoryGap` at its "10%" default there, and
               the rendered result is a 15.36px band carrying a 12px bar - a
               bar/band ratio of 0.781. Unovis applies `barPadding` to BOTH sides
               of the band, so the same ratio needs half the number: (1-0.781)/2.
               Setting 0.22 by reading the Recharts value straight across gave
               0.603 and visibly thinner bars. -->
          <!-- Capped, because a band is not a bar. Three days of data hand the
               group a third of the plot, and 0.8 of that came out a 280px slab
               per day - a block chart, not a bar chart. 64px is the widest band
               shadcn's own bar cards ever draw (six months in a 350px card),
               and it only ever binds under about three weeks of data: past
               that the band is already narrower and the cap does nothing. -->
          <VisGroupedBar
            :x="(d) => d[xKey]"
            :y="(d) => d[activeChart]"
            :color="activeColor"
            :bar-padding="0.11"
            :group-max-width="96"
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
          <!-- No y axis by default, matching the reference: the totals in the
               header already give the scale, and on a phone the gutter it needs
               is a fifth of the plot. Opt back in with `y-axis`. -->
          <VisAxis
            v-if="yAxis"
            type="y"
            :num-ticks="3"
            :tick-line="false"
            :domain-line="false"
            :tick-format="yFormat"
          />
          <ChartTooltip />
          <ChartCrosshair :template="tooltipTemplate" color="#0000" />
        </VisXYContainer>
      </ChartContainer>
    </div>
  </div>
</template>

<script setup>
import { VisAxis, VisGroupedBar, VisXYContainer } from "@unovis/vue";
import {
  ChartContainer,
  ChartCrosshair,
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
  // Off by default. The reference draws no y axis on this chart.
  yAxis: {
    type: Boolean,
    default: false,
  },
});

/**
 * Where the labels go, and how much room each bar gets.
 *
 * `numTicks` was only ever a HINT: Unovis hands it to d3, which answers with
 * round intervals in TIME rather than with positions in the data. Over three
 * days it drew four ticks twelve hours apart - "Aug 26 · Aug 26 · Aug 27 ·
 * Aug 28" - two of them naming the same day, none of them under a bar. Naming
 * the values outright takes the guess away: every label sits on a real day, and
 * a day either gets its own label or none.
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
// milliseconds the bars are placed at rather than the Date objects.
const xValues = computed(() =>
  (props.data ?? [])
    .map((d) => {
      const value = d?.[props.xKey];
      return value instanceof Date ? value.getTime() : new Date(value).getTime();
    })
    .filter((value) => !Number.isNaN(value))
);

/**
 * Half a step of air at each end, which is what turns a continuous time axis
 * into the reference's row of bands.
 *
 * Unovis pads the domain by itself, but only enough to keep a bar from being
 * CLIPPED - the first one still sits centred on the very first pixel of the
 * plot, and over a handful of days that reads as two half-bars pinned to the
 * card's edges. Stating the domain puts every bar in the middle of its own
 * share of the width, exactly where its label now goes.
 */
const xDomain = computed(() => {
  const values = xValues.value;

  if (values.length < 2) return undefined;

  const first = values[0];
  const last = values[values.length - 1];
  const half = (last - first) / (values.length - 1) / 2;

  return [first - half, last + half];
});

/**
 * One label per ~78px of plot, thinned by whole data points.
 *
 * Walked BACKWARDS from the last day: the most recent one is what the reader
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

const keys = computed(() =>
  props.dataKeys && props.dataKeys.length
    ? props.dataKeys
    : Object.keys(props.config).filter((key) => props.config[key]?.color)
);

const activeChart = ref(keys.value[0]);

/**
 * The y domain, stated rather than inferred.
 *
 * `[0, undefined]` asks Unovis to work the maximum out for itself, and with a
 * grouped bar it derives it from every numeric field on the row rather than from
 * the one series being drawn. On a row carrying `tickets`, `orders` AND
 * `revenue`, that puts the ceiling in the millions and squashes a 12-ticket day
 * to a sixth of the plot while the axis, which reads the drawn series, still
 * prints 0-10. Bars and their own axis disagreeing is worse than either being
 * wrong on its own.
 *
 * Naming the maximum of the active series fixes both at once. Floored at 1 so an
 * all-zero series still has a scale to draw against.
 */
const yDomain = computed(() => {
  const max = Math.max(
    ...(props.data ?? []).map((d) => Number(d[activeChart.value]) || 0),
    1
  );

  return [0, max];
});

const totals = computed(() =>
  Object.fromEntries(
    keys.value.map((key) => [key, props.data.reduce((acc, d) => acc + (Number(d[key]) || 0), 0)])
  )
);

/**
 * One colour, whichever metric is selected.
 *
 * The buttons switch WHAT is plotted, not which of several co-plotted series to
 * look at - only ever one is on screen. A colour that changes with the selection
 * therefore encodes nothing, while looking like it encodes something; and since
 * the ramp gets paler further along it, picking Revenue used to wash the whole
 * chart out next to Tickets for no reason a reader could name. The first key's
 * colour is the card's colour, and it stays put.
 */
const activeColor = computed(
  () => props.config[keys.value[0]]?.color || "var(--chart-1)"
);

const xFormat = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const yFormat = (d) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(d);

const currentConfig = computed(() => props.config);

const tooltipTemplate = componentToString(currentConfig, ChartTooltipContent, {
  labelFormatter: (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
});
</script>
