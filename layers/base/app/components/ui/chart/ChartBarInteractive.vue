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
        <VisXYContainer :data="data" :margin="{ left: 4, right: 4 }" :y-domain="yDomain">
          <!-- 0.11, measured against the reference rather than guessed.
               Recharts leaves `barCategoryGap` at its "10%" default there, and
               the rendered result is a 15.36px band carrying a 12px bar - a
               bar/band ratio of 0.781. Unovis applies `barPadding` to BOTH sides
               of the band, so the same ratio needs half the number: (1-0.781)/2.
               Setting 0.22 by reading the Recharts value straight across gave
               0.603 and visibly thinner bars. -->
          <VisGroupedBar
            :x="(d) => d[xKey]"
            :y="(d) => d[activeChart]"
            :color="activeColor"
            :bar-padding="0.11"
          />
          <VisAxis
            type="x"
            :x="(d) => d[xKey]"
            :tick-line="false"
            :domain-line="false"
            :grid-line="false"
            :num-ticks="xTickCount"
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
 * Tick count follows the WIDTH, not a fixed number.
 *
 * The hardcoded 6 gave a 1470px chart the same six labels as a 340px one - the
 * reference fits about nineteen at that width and five on a phone. Capping it at
 * six was my own overcorrection for a different bug: a three-day range used to
 * come back "Jun 21 · Jun 21 · Jun 21" because the date scale interpolated
 * between the only real points it had. Filling the missing days at the call site
 * removed that cause, so the count is free to follow the space again.
 *
 * ~78px per label is what the reference works out to. Never more ticks than
 * there are distinct days, or the interpolation problem comes straight back.
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

const xTickCount = computed(() => {
  const days = new Set(
    (props.data ?? []).map((d) => {
      const value = d?.[props.xKey];
      const date = value instanceof Date ? value : new Date(value);
      return Number.isNaN(date.getTime()) ? String(value) : date.toDateString();
    })
  );

  // The reference draws one label per ~75px. Unovis treats num-ticks as a HINT
  // and snaps to a whole-day interval, so the drawn count jumps rather than
  // slides: at 1518px, asking for 19 draws 24 (every 6 days) and asking for 15
  // draws 12 (every 12 days). Nothing in between exists. 78 picks the 24 - 63px
  // a label, denser than the reference but far closer than 127px would be.
  const fits = plotWidth.value > 0 ? Math.round(plotWidth.value / 78) : 6;

  return Math.max(2, Math.min(fits, days.size, 24));
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

const activeColor = computed(() => props.config[activeChart.value]?.color || "var(--chart-1)");

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
