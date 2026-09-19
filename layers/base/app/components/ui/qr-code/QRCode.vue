<template>
  <!-- aspect-square reserves the space before the QR generates (no layout shift).
       The code is drawn client-side after a dynamic import of `qrcode`, so the
       reserved box used to sit empty and then fill in one frame with nothing in
       between. Two stacked layers cross-fade instead, unless `animate` is off -
       then the skeleton still holds the space but the swap is a cut. -->
  <div
    :class="cn('t-skel aspect-square w-full', svgContent && 'is-revealed', props.class)"
    :data-state="svgContent ? 'ready' : 'loading'"
    :data-qr-animate="animate ? '' : undefined"
  >
    <div class="t-skel-skeleton">
      <Skeleton class="size-full rounded-xl" />
    </div>

    <div class="t-skel-content">
      <template v-if="svgContent">
        <Tippy v-if="canToggle && hint" tag="div" theme="primary" placement="bottom">
          <button
            type="button"
            aria-label="Change QR Code style"
            @click="toggleQrStyle"
            class="block w-full cursor-pointer rounded-lg transition active:scale-98"
          >
            <div v-html="svgContent" class="[&>svg]:block [&>svg]:h-auto [&>svg]:w-full" />
          </button>
          <template #content>
            <span class="flex items-center gap-x-1.5 leading-none tracking-tight">
              <Icon name="hugeicons:mouse-left-click-01" class="size-4 shrink-0" />
              <span>Click to change QR Code style</span>
            </span>
          </template>
        </Tippy>
        <button
          v-else-if="canToggle"
          type="button"
          aria-label="Change QR Code style"
          @click="toggleQrStyle"
          class="block w-full cursor-pointer rounded-lg transition active:scale-98"
        >
          <div v-html="svgContent" class="[&>svg]:block [&>svg]:h-auto [&>svg]:w-full" />
        </button>
        <div
          v-else
          v-html="svgContent"
          class="[&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
        />
      </template>
    </div>

    <!-- Scanned: the gate scanner's own sweep (a line dragging a fine grid, as
         on /scan) runs down the code once. It is an overlay that takes no
         pointer events and leaves the DOM when it ends, so the code is never
         covered afterwards - a gate that needs a second read still gets one -
         and a click still reaches the style toggle. -->
    <span
      v-if="sweepKey"
      :key="sweepKey"
      class="t-qr-sweep"
      aria-hidden="true"
      @animationend.self="sweepKey = 0"
    >
      <span class="t-qr-sweep-track">
        <span class="t-qr-sweep-mesh" />
        <span class="t-qr-sweep-edge" />
      </span>
    </span>
  </div>
</template>

<style scoped>
/* transitions-dev: skeleton loader and reveal, reveal half only.
   The snippet's `.is-pulsing` opacity pulse is deliberately left out - this
   repo's <Skeleton> already carries its own `animate-skeleton` shimmer, and
   stacking an opacity pulse on a moving gradient reads as a flicker. What is
   kept is the cross-fade + cross-blur, which is the part that makes the swap a
   motion instead of a cut. Tokens scoped to .t-skel so they stay out of :root. */
.t-skel {
  --reveal-dur: 400ms;
  --reveal-blur: 2px;
  --reveal-ease: ease-in-out;
  position: relative;
}
.t-skel-skeleton,
.t-skel-content {
  position: absolute;
  inset: 0;
}
.t-skel-skeleton {
  z-index: 1;
  opacity: 1;
  filter: blur(0);
}
.t-skel-content {
  z-index: 2;
  opacity: 0;
  filter: blur(var(--reveal-blur));
}
/* The cross-fade itself is opt-out: without `animate` the two layers still
   stack and still swap, they just swap in one frame. Declaring the transition
   here rather than on the layers keeps the off state free of any timing. */
.t-skel[data-qr-animate] .t-skel-skeleton,
.t-skel[data-qr-animate] .t-skel-content {
  transition:
    opacity var(--reveal-dur) var(--reveal-ease),
    filter var(--reveal-dur) var(--reveal-ease);
}
.t-skel.is-revealed .t-skel-skeleton {
  opacity: 0;
  filter: blur(var(--reveal-blur));
}
.t-skel.is-revealed .t-skel-content {
  opacity: 1;
  filter: blur(0);
}

/* The scan sweep. Same mesh as the scanner's `scan-beam` utility (a 7px grid
   of 1px lines at half strength over a 12% wash, masked to dissolve away from
   the line), run once, downwards. sky-600 on light surfaces, where the
   scanner's sky-400 all but vanishes on white; sky-400 on dark, as on /scan.
   QRCodeScannedBadge reads the same pair. */
.t-skel {
  --qr-scan-color: var(--color-sky-600, oklch(0.588 0.158 241.966));
  --qr-sweep-dur: 1100ms;
}
.dark .t-skel {
  --qr-scan-color: var(--color-sky-400, oklch(0.746 0.16 232.661));
}
.t-qr-sweep {
  position: absolute;
  inset: 0;
  z-index: 3;
  overflow: hidden;
  border-radius: 0.75rem;
  pointer-events: none;
  animation: t-qr-sweep-frame var(--qr-sweep-dur) linear both;
}
.t-qr-sweep-track {
  position: absolute;
  inset: 0;
  animation: t-qr-sweep-down var(--qr-sweep-dur) ease-in-out both;
}
.t-qr-sweep-mesh {
  position: absolute;
  inset-inline: 0;
  bottom: 100%;
  height: 3.5rem;
  background-image:
    linear-gradient(to bottom, transparent 0%, color-mix(in oklab, var(--qr-scan-color) 12%, transparent) 100%),
    repeating-linear-gradient(
      to right,
      color-mix(in oklab, var(--qr-scan-color) 50%, transparent) 0 1px,
      transparent 1px 7px
    ),
    repeating-linear-gradient(
      to bottom,
      color-mix(in oklab, var(--qr-scan-color) 50%, transparent) 0 1px,
      transparent 1px 7px
    );
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 85%, #000 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, #000 85%, #000 100%);
}
.t-qr-sweep-edge {
  position: absolute;
  inset-inline: 0;
  top: 0;
  height: 2px;
  background: var(--qr-scan-color);
  box-shadow:
    0 0 6px color-mix(in oklab, var(--qr-scan-color) 90%, transparent),
    0 0 18px color-mix(in oklab, var(--qr-scan-color) 55%, transparent);
}
/* Fades at both ends so the line never pops in or out. */
@keyframes t-qr-sweep-frame {
  0% {
    opacity: 0;
  }
  8%,
  88% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
@keyframes t-qr-sweep-down {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(calc(100% - 2px));
  }
}

@media (prefers-reduced-motion: reduce) {
  .t-skel-skeleton,
  .t-skel-content {
    transition: none !important;
  }
  .t-qr-sweep {
    display: none;
  }
}
</style>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, shallowRef, watch } from "vue";
import type { HTMLAttributes } from "vue";
import type QRCodeLib from "qrcode";
import { cn } from "@/lib/utils";
import {
  buildQRSvgString,
  loadQRCodeLib,
  useQRCodeStyle,
  type QRStyleVariant,
} from "./useQRCode";

const props = withDefaults(
  defineProps<{
    /** Text encoded in the QR. Any string: URL, token, plain text. */
    url: string;
    /** Rendered SVG viewBox size. The element itself always fills its container. */
    size?: number;
    /** Quiet zone around the code, in modules. */
    margin?: number;
    fgColor?: string;
    bgColor?: string;
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    /** Pin the module shape. Left unset, it follows the shared, persisted style. */
    variant?: QRStyleVariant;
    /** Allow clicking the code to switch between square and rounded modules. */
    toggleable?: boolean;
    /** Cross-fade from the skeleton once the code is drawn. Off inside a dialog,
     * where the panel's own entrance already covers the same frames. */
    animate?: boolean;
    /** Show the "Click to change QR Code style" tooltip. The click works either way. */
    hint?: boolean;
    /** The code was redeemed. Turning it on while mounted runs the scanner's
     * sweep over the code once; the code itself never changes, so it still scans. */
    scanned?: boolean;
    /** Run the sweep when `scanned` turns on. Off for a change nobody just
     * watched happen, such as a scan synced minutes late. */
    scannedAnimate?: boolean;
    class?: HTMLAttributes["class"];
  }>(),
  {
    size: 268,
    margin: 2,
    fgColor: "var(--foreground)",
    bgColor: "transparent",
    errorCorrectionLevel: "M",
    variant: undefined,
    toggleable: true,
    animate: true,
    hint: false,
    scanned: false,
    scannedAnimate: true,
    class: undefined,
  },
);

/** Bumped when a scan lands while this code is on screen; 0 = no sweep. */
const sweepKey = ref(0);

watch(
  () => props.scanned,
  (scanned, wasScanned) => {
    if (scanned && !wasScanned && props.scannedAnimate) sweepKey.value += 1;
  },
);

const { qrStyle, toggleQrStyle } = useQRCodeStyle();

/** A pinned `variant` wins over the shared style, and drops the toggle with it. */
const activeVariant = computed<QRStyleVariant>(
  () => props.variant ?? qrStyle.value,
);
const canToggle = computed(() => props.toggleable && !props.variant);

const qrData = shallowRef<QRCodeLib.QRCode | null>(null);

const svgContent = computed(() => {
  if (!qrData.value) return "";

  const svg = buildQRSvgString(qrData.value, {
    size: props.size,
    margin: props.margin,
    fgColor: props.fgColor,
    bgColor: props.bgColor,
    styleVariant: activeVariant.value,
  });

  return svg
    .replace(`width="${props.size}"`, 'width="100%"')
    .replace(`height="${props.size}"`, 'height="100%"');
});

const generateQRData = async (): Promise<void> => {
  if (!import.meta.client || !props.url) {
    qrData.value = null;
    return;
  }

  try {
    const lib = await loadQRCodeLib();
    qrData.value = lib.create(props.url, {
      errorCorrectionLevel: props.errorCorrectionLevel,
    });
  } catch (err) {
    console.error("Failed to generate QR code:", err);
    qrData.value = null;
  }
};

onMounted(() => props.url && nextTick(generateQRData));

watch(
  () => [props.url, props.errorCorrectionLevel],
  () => props.url && nextTick(generateQRData),
);
</script>
