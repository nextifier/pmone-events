<template>
  <!-- Circle / Crescent: circular glow variants -->
  <div
    v-if="shape === 'circle'"
    :class="[
      'glow-container relative aspect-square w-full overflow-hidden rounded-full',
      props.class,
    ]"
    :style="baseStyle"
  >
    <div class="glow-blur absolute z-1">
      <div
        :class="[
          'glow-ring h-full w-full [clip-path:circle(50%)]',
          variant === 'crescent'
            ? 'glow-ring--crescent-blur'
            : 'glow-ring--circle',
        ]"
      />
    </div>
    <div
      v-if="variant === 'crescent'"
      class="glow-ring glow-ring--crescent-sharp absolute inset-0 z-10 [clip-path:circle(50%)]"
    />
    <div
      class="absolute inset-0 z-20 grid place-content-center text-center text-balance uppercase"
    >
      <slot />
    </div>
  </div>

  <!-- Card: border glow via ::before -->
  <div
    v-else
    :class="[
      'glow-container glow-card relative isolate grid aspect-square w-full place-content-center place-self-center overflow-hidden rounded-lg p-2 text-center text-balance uppercase',
      props.class,
    ]"
    :style="baseStyle"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface ColorStop {
  color: string;
  position?: string;
}

interface Props {
  shape?: "circle" | "card";
  variant?: "glow" | "crescent";
  colors?: ColorStop[];
  duration?: number;
  blur?: string;
  animated?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  shape: "circle",
  variant: "glow",
  colors: () => [
    { color: "#3b82f6", position: "0deg" },
    { color: "#22d3ee", position: "118.8deg" },
    { color: "#ec4899", position: "237.6deg" },
    { color: "#3b82f6", position: "360deg" },
  ],
  duration: 4,
  blur: "2cqi",
  animated: false,
});

const colorStops = computed(() =>
  props.colors
    .map((c) => (c.position ? `${c.color} ${c.position}` : c.color))
    .join(", "),
);

const baseStyle = computed(() => ({
  "--glow-colors": colorStops.value,
  "--glow-duration": `${props.duration}s`,
  "--glow-blur": props.blur,
  "--glow-play-state": props.animated ? "running" : "paused",
}));
</script>

<style>
@property --glow-angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

@keyframes glow-rotate {
  to {
    --glow-angle: 1turn;
  }
}
</style>

<style scoped>
.glow-container {
  container-type: inline-size;
}

/* Shared animated gradient */
.glow-ring {
  background: conic-gradient(
    in oklch from var(--glow-angle) at 50% 50%,
    var(--glow-colors)
  );
  animation: glow-rotate var(--glow-duration) linear infinite;
  animation-play-state: var(--glow-play-state, paused);
}

/* Blur wrapper shared by circle and crescent */
.glow-blur {
  inset: -3cqi;
  filter: blur(var(--glow-blur));
}

/* Circle: centered thin ring → even inner glow all around */
.glow-ring--circle {
  mask: radial-gradient(
    ellipse 45% 45% at 50% 50%,
    transparent 100%,
    #000 100%
  );
}

/* Crescent blur layer: off-center thin ring (from test-2.vue .crescent-glow) */
.glow-ring--crescent-blur {
  mask: radial-gradient(
    ellipse 48% 48% at 48% 52%,
    transparent 100%,
    #000 100%
  );
}

/* Crescent sharp overlay: crisp ring on top (from test-2.vue .crescent-shape) */
.glow-ring--crescent-sharp {
  mask: radial-gradient(
    ellipse 49.49% 49.49% at 49.49% 50.51%,
    transparent 100%,
    #000 100%
  );
}

/* Card: border glow via ::before */
.glow-card::before {
  position: absolute;
  z-index: -1;
  inset: -6cqi;
  border: solid 8cqi;
  border-image: conic-gradient(
      in oklch from var(--glow-angle),
      var(--glow-colors)
    )
    1;
  filter: blur(var(--glow-blur));
  animation: glow-rotate var(--glow-duration) linear infinite;
  animation-play-state: var(--glow-play-state, paused);
  content: "";
}
</style>
