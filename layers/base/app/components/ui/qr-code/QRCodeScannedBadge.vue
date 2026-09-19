<template>
  <!-- The slot grows from zero while the badge drops in, so whatever shares its
       row (axis x) or sits below it (axis y) moves aside instead of jumping. A
       badge present on first render starts open, with nothing to animate. -->
  <span
    v-if="present"
    ref="slotEl"
    :class="cn('qr-scanned-badge-slot', `qr-scanned-badge-slot-${axis}`, props.class)"
    :data-open="open || undefined"
    @transitionend.self="onSlotTransitionEnd"
  >
    <span class="qr-scanned-badge-clip">
      <span class="qr-scanned-badge-pad">
        <Badge variant="success" icon="hugeicons:tick-double-02" class="qr-scanned-badge">
          <slot>{{ label }}<template v-if="time"> · {{ time }}</template></slot>
        </Badge>
      </span>
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { Badge } from "../badge";

/**
 * The "checked in" badge that goes with a scanned QRCode: two ticks in the
 * scan sweep's colour, dropping in from above - the way the sweep line
 * travels - once the line has crossed the code.
 *
 * `axis="y"` is the one that sits directly under the code: its height grows,
 * so content below the QR slides down. `axis="x"` sits in a row of chips and
 * grows its width instead.
 */
const props = withDefaults(
  defineProps<{
    show: boolean;
    /** When the seat was checked in (ISO). Shown as a time after the label. */
    at?: string | null;
    label?: string;
    /** Locale for the time, e.g. the page's i18n locale. */
    locale?: string;
    /** "y" under the code (grows in height), "x" in a row (grows in width). */
    axis?: "x" | "y";
    /** Wait for the sweep to cross the code before arriving. Off when the
     * sweep did not run, e.g. a scan synced minutes late. */
    afterSweep?: boolean;
    class?: HTMLAttributes["class"];
  }>(),
  {
    at: null,
    label: "Checked in",
    locale: "en-US",
    axis: "y",
    afterSweep: true,
    class: undefined,
  },
);

const time = computed(() =>
  props.at
    ? new Date(props.at).toLocaleTimeString(props.locale, { hour: "2-digit", minute: "2-digit" })
    : "",
);

/** How long the sweep takes to cross the code, of its 1.1s. */
const SWEEP_CROSSED_MS = 820;

/** In the DOM at all. Stays true through the closing transition. */
const present = ref(props.show);
/** Expanded and visible. Flipping it runs the transitions. */
const open = ref(props.show);
const slotEl = ref<HTMLElement | null>(null);
let timer: ReturnType<typeof setTimeout> | undefined;

async function arrive() {
  present.value = true;
  await nextTick();
  // Force a layout at the collapsed state so the browser has a start to
  // animate from. A reflow rather than requestAnimationFrame: rAF does not run
  // in a background tab, and a staff screen hears scans while it is one.
  void slotEl.value?.offsetHeight;
  open.value = true;
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
    // take its room and shove its neighbours aside before anything appears.
    timer = setTimeout(arrive, props.afterSweep ? SWEEP_CROSSED_MS : 0);
  },
);

function onSlotTransitionEnd(event: TransitionEvent) {
  if (event.propertyName.startsWith("grid-template") && !open.value) present.value = false;
}

onBeforeUnmount(() => clearTimeout(timer));
</script>

<style scoped>
/* Same pair as QRCode's sweep: sky-600 on light, sky-400 on dark. */
.qr-scanned-badge-slot {
  --qr-scan-color: var(--color-sky-600, oklch(0.588 0.158 241.966));
}
.dark .qr-scanned-badge-slot {
  --qr-scan-color: var(--color-sky-400, oklch(0.746 0.16 232.661));
}

/* x: in a row of chips. Width grows; clipped sideways only, so the badge
   still drops in from above unclipped. */
.qr-scanned-badge-slot-x {
  display: inline-grid;
  grid-template-columns: 0fr;
  transition: grid-template-columns 150ms ease-in-out;
}
.qr-scanned-badge-slot-x[data-open] {
  grid-template-columns: 1fr;
  transition: grid-template-columns 300ms cubic-bezier(0.22, 1, 0.36, 1);
}
.qr-scanned-badge-slot-x > .qr-scanned-badge-clip {
  min-width: 0;
  overflow-x: clip;
  overflow-y: visible;
}

/* y: directly under the code. Height grows from zero, so what is below
   slides down. The 4px above and below live on the inner pad, not on the grid
   item: padding on the item itself would hold the collapsed track at 8px.
   With the code's own quiet zone the top 4px leaves about 18px between the
   modules and the badge. */
.qr-scanned-badge-slot-y {
  display: grid;
  justify-items: center;
  grid-template-rows: 0fr;
  transition: grid-template-rows 150ms ease-in-out;
}
.qr-scanned-badge-slot-y[data-open] {
  grid-template-rows: 1fr;
  transition: grid-template-rows 300ms cubic-bezier(0.22, 1, 0.36, 1);
}
.qr-scanned-badge-slot-y > .qr-scanned-badge-clip {
  min-height: 0;
}
.qr-scanned-badge-slot-y .qr-scanned-badge-pad {
  display: block;
  padding-block: 4px;
}

.qr-scanned-badge {
  white-space: nowrap;
}
.qr-scanned-badge :deep(.iconify) {
  color: var(--qr-scan-color);
}

/* transitions-dev texts reveal (18), turned to come from above. */
.qr-scanned-badge-pad > .qr-scanned-badge {
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
  .qr-scanned-badge-slot-x,
  .qr-scanned-badge-slot-y,
  .qr-scanned-badge-pad > .qr-scanned-badge {
    transition: none !important;
  }
}
</style>
