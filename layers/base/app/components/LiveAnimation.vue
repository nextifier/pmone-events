<template>
  <div class="wave" :style="rootStyle" aria-hidden="true">
    <!-- Delay is inline rather than in nth-child rules so any bar count works. -->
    <span
      v-for="index in bars"
      :key="index"
      :style="{ animationDelay: `calc(${index - 1} * var(--wave-stagger))` }"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  /**
   * Height of the animation. A number is read as px; any CSS length string
   * ("2.5rem", "1em") passes through. Bar width, gap and radius are derived
   * from it, so the shape stays identical at every size.
   */
  size: {
    type: [Number, String],
    default: 40,
  },
  bars: {
    type: Number,
    default: 5,
  },
  /** Any CSS colour — a theme token (`var(--destructive)`) or `currentColor`. */
  color: {
    type: String,
    default: "var(--primary)",
  },
  /**
   * Second stop of the per-bar vertical gradient. Left empty each bar is a
   * flat `color` fill.
   */
  colorTo: {
    type: String,
    default: "",
  },
  /** One full rise-and-fall cycle. */
  speed: {
    type: [Number, String],
    default: "1s",
  },
  /**
   * Offset between neighbouring bars — this is what makes the wave travel.
   * Left empty it tracks `speed` (a tenth of it), so slowing the animation
   * down keeps the same wave shape instead of bunching the bars up.
   */
  stagger: {
    type: [Number, String],
    default: "",
  },
  /** How far a bar shrinks at rest, as a fraction of full height. */
  minScale: {
    type: Number,
    default: 0.4,
  },
});

const toLength = (value) =>
  typeof value === "number" || /^-?[\d.]+$/.test(value) ? `${value}px` : value;

const toDuration = (value) =>
  typeof value === "number" || /^-?[\d.]+$/.test(value) ? `${value}s` : value;

const rootStyle = computed(() => ({
  "--wave-size": toLength(props.size),
  "--wave-color": props.color,
  "--wave-color-to": props.colorTo || props.color,
  "--wave-speed": toDuration(props.speed),
  // Omitted when unset so the stylesheet's speed-relative default applies.
  "--wave-stagger": props.stagger ? toDuration(props.stagger) : undefined,
  "--wave-min-scale": props.minScale,
}));
</script>

<style scoped>
.wave {
  /* Proportions read off the 40px reference: 6px bar, 4px gap, 3px radius.
     Override any of them per instance with an inline custom property. */
  --wave-bar-width: calc(var(--wave-size) * 0.15);
  --wave-gap: calc(var(--wave-size) * 0.1);
  --wave-radius: calc(var(--wave-bar-width) / 2);
  /* Beaten by the inline value whenever the `stagger` prop is set. */
  --wave-stagger: calc(var(--wave-speed) * 0.1);

  display: inline-flex;
  align-items: center;
  gap: var(--wave-gap);
  height: var(--wave-size);
}

.wave span {
  width: var(--wave-bar-width);
  height: 100%;
  border-radius: var(--wave-radius);
  /* Always a gradient: with no `colorTo` both stops match and it renders flat,
     which keeps one code path for solid and gradient bars alike. */
  background: linear-gradient(
    180deg,
    var(--wave-color),
    var(--wave-color-to)
  );
  animation: waveBar var(--wave-speed) ease-in-out infinite;
}

@keyframes waveBar {
  0%,
  100% {
    transform: scaleY(var(--wave-min-scale));
  }

  50% {
    transform: scaleY(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .wave span {
    animation: none;
    transform: scaleY(0.7);
  }
}
</style>
