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
        <VisXYContainer :data="data" :margin="{ left: 4, right: 4 }" :y-domain="[0, undefined]">
          <VisLine :x="(d) => d[xKey]" :y="(d) => d[activeChart]" :color="activeColor" />
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
          <ChartCrosshair :template="tooltipTemplate" :color="activeColor" />
        </VisXYContainer>
      </ChartContainer>
    </div>
  </div>
</template>

<script setup>
import { VisAxis, VisLine, VisXYContainer } from "@unovis/vue";
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
 * The count follows the WIDTH at ~78px a label, the same density the reference
 * works out to, rather than the old fixed six that gave a 1470px chart and a
 * 340px one the same handful.
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
  (props.data ?? [])
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

const keys = computed(() =>
  props.dataKeys && props.dataKeys.length
    ? props.dataKeys
    : Object.keys(props.config).filter((key) => props.config[key]?.color)
);

const activeChart = ref(keys.value[0]);

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
