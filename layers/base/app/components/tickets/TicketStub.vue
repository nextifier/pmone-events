<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useId } from "vue";

/**
 * A ticket card with a perforated stub footer. The card fill AND the border
 * stroke are drawn by a single SVG path, so the hairline follows the two side
 * notches and the notches are real transparent cutouts - the card sits on ANY
 * background. Same technique as ETicket.vue. Provide the upper content via the
 * default slot and the stub (price + CTA) via the #footer slot.
 */
const props = defineProps({
  // Card surface colour painted behind the (transparent) content.
  cardBg: { type: String, default: "var(--color-background)" },
  borderColor: { type: String, default: "var(--color-border)" },
  // Notch radius (side cut-outs at the perforation seam) and card corner radius.
  notchRadius: { type: Number, default: 16 },
  cornerRadius: { type: Number, default: 24 },
});

const cardEl = ref(null);
const stubEl = ref(null);
const pathD = ref("");
const cardW = ref(0);
const cardH = ref(0);
const clipId = "tks-" + useId().replace(/[^a-z0-9]/gi, "");
let ro = null;

function buildClip() {
  const card = cardEl.value;
  if (!card || !stubEl.value) {
    pathD.value = "";
    return;
  }
  const w = card.offsetWidth;
  const h = card.offsetHeight;
  if (!w || !h) {
    pathD.value = "";
    return;
  }
  cardW.value = w;
  cardH.value = h;
  const r = props.notchRadius;
  const R = props.cornerRadius;
  const ty = h - stubEl.value.offsetHeight;
  pathD.value =
    `M ${R} 0 H ${w - R} A ${R} ${R} 0 0 1 ${w} ${R} ` +
    `V ${ty - r} A ${r} ${r} 0 0 0 ${w} ${ty + r} V ${h - R} ` +
    `A ${R} ${R} 0 0 1 ${w - R} ${h} H ${R} A ${R} ${R} 0 0 1 0 ${h - R} ` +
    `V ${ty + r} A ${r} ${r} 0 0 0 0 ${ty - r} V ${R} A ${R} ${R} 0 0 1 ${R} 0 Z`;
}

const clipStyle = computed(() =>
  pathD.value ? { clipPath: `path('${pathD.value}')`, background: "transparent" } : {}
);

onMounted(() => {
  buildClip();
  if (typeof ResizeObserver !== "undefined" && cardEl.value) {
    ro = new ResizeObserver(() => buildClip());
    ro.observe(cardEl.value);
    if (stubEl.value) ro.observe(stubEl.value);
  }
});
onBeforeUnmount(() => {
  ro?.disconnect();
  ro = null;
});
</script>

<template>
  <div ref="cardEl" class="relative h-full">
    <!-- Card surface + border drawn as an SVG so the hairline follows the notches. -->
    <svg
      v-if="pathD"
      :width="cardW"
      :height="cardH"
      :viewBox="`0 0 ${cardW} ${cardH}`"
      class="pointer-events-none absolute inset-0"
      aria-hidden="true"
      shape-rendering="geometricPrecision"
    >
      <defs>
        <clipPath :id="clipId"><path :d="pathD" /></clipPath>
      </defs>
      <path :d="pathD" :fill="cardBg" />
      <path
        :d="pathD"
        fill="none"
        :stroke="borderColor"
        stroke-width="2"
        :clip-path="`url(#${clipId})`"
      />
    </svg>

    <div
      class="relative flex h-full flex-col overflow-hidden"
      :class="pathD ? '' : 'bg-background border-border rounded-3xl border'"
      :style="clipStyle"
    >
      <div class="flex grow flex-col">
        <slot />
      </div>

      <!-- Perforation + stub (side notches are carved by the SVG/clip path above). -->
      <div ref="stubEl" class="border-border relative grow-0 border-t border-dashed">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
