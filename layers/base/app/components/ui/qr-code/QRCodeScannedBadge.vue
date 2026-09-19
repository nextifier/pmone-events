<template>
  <!-- The slot grows from zero width while the badge drops in, so chips sharing
       its row slide aside instead of jumping. A badge present on first render
       starts open, with nothing to animate. -->
  <span
    v-if="present"
    :class="cn('qr-scanned-badge-slot', props.class)"
    :data-open="open || undefined"
    @transitionend.self="onSlotTransitionEnd"
  >
    <span class="qr-scanned-badge-clip">
      <Badge variant="success" icon="hugeicons:tick-double-02" class="qr-scanned-badge">
        <slot />
      </Badge>
    </span>
  </span>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { Badge } from "../badge";

/**
 * The "checked in" badge that goes with a scanned QRCode: two ticks in the
 * scan sweep's colour, dropping in from above - the way the sweep line
 * travels - once the line has crossed the code. Each surface places it in its
 * own status row, so the QR itself never grows or gets covered.
 */
const props = withDefaults(
  defineProps<{
    show: boolean;
    /** Wait for the sweep to cross the code before arriving. Off when the
     * sweep did not run, e.g. a scan synced minutes late. */
    afterSweep?: boolean;
    class?: HTMLAttributes["class"];
  }>(),
  { afterSweep: true, class: undefined },
);

/** How long the sweep takes to cross the code, of its 1.1s. */
const SWEEP_CROSSED_MS = 820;

/** In the DOM at all. Stays true through the closing transition. */
const present = ref(props.show);
/** Expanded and visible. Flipping it runs the transitions. */
const open = ref(props.show);
let timer: ReturnType<typeof setTimeout> | undefined;

async function arrive() {
  present.value = true;
  await nextTick();
  // One frame at the collapsed state, so the browser has a start to animate from.
  requestAnimationFrame(() => (open.value = true));
}

watch(
  () => props.show,
  (show) => {
    clearTimeout(timer);

    if (!show) {
      open.value = false;
      // No transition runs under reduced motion, so nothing would end it.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) present.value = false;
      return;
    }

    // Inserted late rather than faded late: an invisible badge would already
    // take its width and shove its neighbours aside before anything appears.
    timer = setTimeout(arrive, props.afterSweep ? SWEEP_CROSSED_MS : 0);
  },
);

function onSlotTransitionEnd(event: TransitionEvent) {
  if (event.propertyName === "grid-template-columns" && !open.value) present.value = false;
}

onBeforeUnmount(() => clearTimeout(timer));
</script>

<style scoped>
/* Same pair as QRCode's sweep: sky-600 on light, sky-400 on dark. */
.qr-scanned-badge-slot {
  --qr-scan-color: var(--color-sky-600, oklch(0.588 0.158 241.966));
  display: inline-grid;
  grid-template-columns: 0fr;
  transition: grid-template-columns 150ms ease-in-out;
}
.dark .qr-scanned-badge-slot {
  --qr-scan-color: var(--color-sky-400, oklch(0.746 0.16 232.661));
}
.qr-scanned-badge-slot[data-open] {
  grid-template-columns: 1fr;
  transition: grid-template-columns 300ms cubic-bezier(0.22, 1, 0.36, 1);
}
/* Clipped sideways only, so the width can grow from zero while the badge
   still drops in from above, unclipped. */
.qr-scanned-badge-clip {
  min-width: 0;
  overflow-x: clip;
  overflow-y: visible;
}

.qr-scanned-badge {
  white-space: nowrap;
}
.qr-scanned-badge :deep(.iconify) {
  color: var(--qr-scan-color);
}

/* transitions-dev texts reveal (18), turned to come from above. */
.qr-scanned-badge-clip > .qr-scanned-badge {
  opacity: 0;
  filter: blur(3px);
  transform: translateY(-12px);
  transition:
    opacity 150ms ease-in-out,
    filter 150ms ease-in-out,
    transform 150ms ease-in-out;
}
.qr-scanned-badge-slot[data-open] .qr-scanned-badge {
  opacity: 1;
  filter: blur(0);
  transform: translateY(0);
  transition:
    opacity 500ms ease-in-out,
    filter 500ms ease-in-out,
    transform 500ms ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  .qr-scanned-badge-slot,
  .qr-scanned-badge-clip > .qr-scanned-badge {
    transition: none !important;
  }
}
</style>
