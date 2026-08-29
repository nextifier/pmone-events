<script setup lang="ts">
/**
 * Positions `ChartTooltipContent` for the hand-rolled SVG charts.
 *
 * The Unovis-backed charts get their tooltip placement from Unovis. The bespoke
 * ones - Radar, RadialBar, Bar3D, BarAnimated - draw raw SVG and had no tooltip
 * at all, so hovering told you nothing. This is the missing half: the panel
 * itself is the same `ChartTooltipContent` every other chart uses, unchanged.
 *
 * Only the placement lives here. It follows the pointer inside the chart's own
 * box, flipping left or above when it would otherwise run past the edge, and
 * never takes pointer events - a tooltip that steals the cursor makes the chart
 * under it flicker.
 */
const props = withDefaults(
  defineProps<{
    open?: boolean;
    /** Pointer position, relative to the positioned ancestor. */
    x?: number;
    y?: number;
    /** Measured box of that ancestor, so the panel can flip near an edge. */
    boxWidth?: number;
    boxHeight?: number;
  }>(),
  { open: false, x: 0, y: 0, boxWidth: 0, boxHeight: 0 }
);

const OFFSET = 12;

/**
 * The panel measures ITSELF rather than trusting a constant.
 *
 * The flip decision needs the panel's real size, and that depends on the content
 * - a currency row is wider than a count. Hardcoding 168px meant a 180px panel
 * flipped a step too late and clipped. `ResizeObserver` keeps the number honest
 * as the rows change.
 */
const panel = ref(null);
const size = ref({ w: 0, h: 0 });
let observer = null;

// Watched, not mounted: the panel sits behind `v-if="open"`, so at mount time
// the ref is still null and an onMounted observer would never attach to
// anything. This picks it up the first time it actually exists.
watch(panel, (el) => {
  observer?.disconnect();
  observer = null;

  if (!el || typeof ResizeObserver === "undefined") return;

  observer = new ResizeObserver(([entry]) => {
    size.value = { w: entry.contentRect.width, h: entry.contentRect.height };
  });
  observer.observe(el);
});

onBeforeUnmount(() => observer?.disconnect());

const style = computed(() => {
  const w = size.value.w || 180;
  const h = size.value.h || 72;
  const flipX = props.boxWidth > 0 && props.x + OFFSET + w > props.boxWidth;
  const flipY = props.boxHeight > 0 && props.y + OFFSET + h > props.boxHeight;

  // Clamped so a flip near the opposite edge cannot push the panel out the other
  // side of the chart on a narrow card.
  const left = flipX ? props.x - OFFSET - w : props.x + OFFSET;
  const top = flipY ? props.y - OFFSET - h : props.y + OFFSET;

  return {
    left: `${Math.max(0, Math.min(left, Math.max(0, props.boxWidth - w)))}px`,
    top: `${Math.max(0, top)}px`,
  };
});
</script>

<template>
  <div
    v-if="open"
    ref="panel"
    class="pointer-events-none absolute z-50"
    :style="style"
  >
    <slot />
  </div>
</template>
