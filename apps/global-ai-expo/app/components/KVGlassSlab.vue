<template>
  <svg
    :width="fill ? '100%' : width"
    :height="fill ? '100%' : height"
    viewBox="0 0 1200 800"
    :preserveAspectRatio="fill ? 'none' : 'xMidYMid slice'"
    class="block"
  >
    <defs>
      <linearGradient :id="`${id}-along`" x1="0" y1="0" x2="1" y2="0">
        <stop
          v-for="(stop, i) in stops"
          :key="i"
          :offset="`${(i / (stops.length - 1)) * 100}%`"
          :stop-color="stop"
        />
      </linearGradient>
      <linearGradient :id="`${id}-cross`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000" stop-opacity="0.32" />
        <stop offset="2%" stop-color="#fff" stop-opacity="0" />
        <stop offset="4%" stop-color="#fff" stop-opacity="0.95" />
        <stop offset="6%" stop-color="#fff" stop-opacity="0.55" />
        <stop offset="10%" stop-color="#fff" stop-opacity="0" />
        <stop offset="50%" stop-color="#fff" stop-opacity="0" />
        <stop offset="92%" stop-color="#000" stop-opacity="0" />
        <stop offset="100%" stop-color="#000" stop-opacity="0.42" />
      </linearGradient>
      <clipPath :id="`${id}-clip`">
        <rect x="0" y="0" width="1200" height="800" />
      </clipPath>
    </defs>

    <g :clip-path="`url(#${id}-clip)`">
      <g :transform="`translate(600 400) rotate(${angle}) translate(-1000 -700)`">
        <g
          v-for="i in barCount"
          :key="i"
          :transform="`translate(0 ${((i - 1 + Math.floor(hueShift)) % bars) * (1400 / bars)})`"
        >
          <rect
            x="0"
            y="0"
            width="2000"
            :height="1400 / bars"
            :fill="`url(#${id}-along)`"
          />
          <rect
            x="0"
            y="0"
            width="2000"
            :height="1400 / bars"
            :fill="`url(#${id}-cross)`"
          />
        </g>
      </g>
    </g>
  </svg>
</template>

<script setup>
const props = defineProps({
  width: { type: Number, default: 800 },
  height: { type: Number, default: 500 },
  palette: {
    type: String,
    default: "aurora",
    validator: (v) => ["magenta", "aurora", "sunset"].includes(v),
  },
  angle: { type: Number, default: -28 },
  bars: { type: Number, default: 7 },
  hueShift: { type: Number, default: 0 },
  fill: { type: Boolean, default: false },
  seed: { type: [String, Number], default: 0 },
});

const PALETTES = {
  magenta: [
    "oklch(0.78 0.20 60)",
    "oklch(0.70 0.30 25)",
    "oklch(0.68 0.34 5)",
    "oklch(0.62 0.34 350)",
    "oklch(0.55 0.34 320)",
    "oklch(0.48 0.32 295)",
    "oklch(0.42 0.30 275)",
    "oklch(0.38 0.26 260)",
  ],
  aurora: [
    "oklch(0.85 0.18 195)",
    "oklch(0.72 0.22 220)",
    "oklch(0.55 0.28 255)",
    "oklch(0.45 0.30 270)",
    "oklch(0.42 0.30 285)",
    "oklch(0.50 0.32 305)",
    "oklch(0.65 0.28 330)",
    "oklch(0.78 0.20 195)",
  ],
  sunset: [
    "oklch(0.92 0.18 95)",
    "oklch(0.85 0.20 80)",
    "oklch(0.74 0.26 50)",
    "oklch(0.65 0.32 25)",
    "oklch(0.60 0.34 5)",
    "oklch(0.58 0.34 340)",
    "oklch(0.50 0.32 310)",
    "oklch(0.42 0.28 280)",
  ],
};

const stops = computed(() => PALETTES[props.palette] || PALETTES.aurora);
const barCount = computed(() => props.bars + 4);
const id = `gs-${props.palette}-${props.seed}`;
</script>
