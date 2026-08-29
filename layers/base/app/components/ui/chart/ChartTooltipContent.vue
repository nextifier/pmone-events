<script setup lang="ts">
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "vue";
import type { ChartConfig } from ".";

const props = withDefaults(
  defineProps<{
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    labelKey?: string;
    labelFormatter?: (d: number | Date) => string;
    valueFormatter?: (v: any) => string;
    /**
     * Full-control row formatter. When set, its returned string replaces the
     * default label/value split for each series row. Mirrors shadcn's tooltip
     * `formatter(value, name, item, index, payload)` — returns a string here
     * because the tooltip is serialized to HTML (see chart/utils.ts).
     */
    formatter?: (
      value: any,
      name: string,
      item: { value: any; key: string; itemConfig: any; indicatorColor?: string },
      index: number,
      payload: Record<string, any>
    ) => string;
    /**
     * Categorical charts (pie/donut/radial) hand the tooltip a whole datum -
     * `{status, count, label, fill}` - rather than a `{seriesKey: value}` map.
     * Looking each datum key up in `config` then resolves the DATA key ("count")
     * instead of the slice, so every slice rendered the same label. Naming the
     * two keys explicitly is what lets a slice describe itself.
     */
    nameKey?: string;
    valueKey?: string;
    /** Parity with shadcn: render nothing when the tooltip is inactive. */
    active?: boolean;
    payload?: Record<string, any>;
    config?: ChartConfig;
    class?: HTMLAttributes["class"];
    x?: number | Date;
  }>(),
  {
    payload: () => ({}),
    config: () => ({}),
    indicator: "dot",
    active: true,
  }
);

// TODO: currently we use `createElement` and `render` to render the
// const chartContext = useChart(null)

const payload = computed(() => {
  // One row, named by the datum itself. The `?? { label: name }` fallback is
  // load-bearing rather than cosmetic: without it the filter below drops the row
  // whenever the config carries no per-slice entry, and an empty tooltip is
  // worse than a mislabelled one.
  if (props.nameKey) {
    const name = props.payload[props.nameKey];
    if (name === undefined || name === null) return [];

    const itemConfig = props.config[name] ?? { label: name };

    return [
      {
        key: String(name),
        value: props.payload[props.valueKey ?? "value"],
        itemConfig,
        indicatorColor: props.config[name]?.color ?? props.payload.fill,
      },
    ];
  }

  return Object.entries(props.payload)
    .map(([key, value]) => {
      // const key = `${item.name || item.dataKey || "value"}`
      const itemConfig = props.config[key];
      const indicatorColor = props.config[key]?.color ?? props.payload.fill;

      return { key, value, itemConfig, indicatorColor };
    })
    .filter((i) => i.itemConfig);
});

const nestLabel = computed(
  () => Object.keys(props.payload).length === 1 && props.indicator !== "dot"
);
const tooltipLabel = computed(() => {
  if (props.hideLabel) return null;
  if (props.labelFormatter && props.x !== undefined) {
    return props.labelFormatter(props.x);
  }
  return props.labelKey
    ? props.config[props.labelKey]?.label || props.payload[props.labelKey]
    : props.x;
});
</script>

<template>
  <div
    v-if="active"
    :class="
      cn(
        'cn-chart-tooltip grid min-w-[8rem] items-start',
        props.class
      )
    "
  >
    <slot>
      <div v-if="!nestLabel && tooltipLabel" class="text-foreground font-mono font-medium tabular-nums">
        {{ tooltipLabel }}
      </div>
      <div class="grid gap-1.5">
        <div
          v-for="({ value, itemConfig, indicatorColor, key }, index) in payload"
          :key="key"
          :class="
            cn(
              '[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5',
              indicator === 'dot' && 'items-center'
            )
          "
        >
          <component :is="itemConfig.icon" v-if="itemConfig?.icon" />
          <template v-else-if="!hideIndicator">
            <div
              :class="
                cn('shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)', {
                  'h-2.5 w-2.5': indicator === 'dot',
                  'w-1': indicator === 'line',
                  'w-0 border-[1.5px] border-dashed bg-transparent': indicator === 'dashed',
                  'my-0.5': nestLabel && indicator === 'dashed',
                })
              "
              :style="{
                '--color-bg': indicatorColor,
                '--color-border': indicatorColor,
              }"
            />
          </template>

          <div
            :class="
              cn(
                'flex flex-1 justify-between gap-2 leading-none',
                nestLabel ? 'items-end' : 'items-center'
              )
            "
          >
            <span v-if="formatter" class="text-foreground font-medium">
              {{ formatter(value, key, { value, key, itemConfig, indicatorColor }, index, props.payload) }}
            </span>
            <template v-else>
              <div class="grid gap-1.5">
                <div v-if="nestLabel" class="text-5xl font-medium tracking-tighter">
                  {{ tooltipLabel }}
                </div>
                <span class="text-muted-foreground">
                  {{ itemConfig?.label || value }}
                </span>
              </div>
              <span v-if="value != null" class="text-foreground font-medium">
                {{ valueFormatter ? valueFormatter(value) : value.toLocaleString() }}
              </span>
            </template>
          </div>
        </div>
      </div>
    </slot>
  </div>
</template>
