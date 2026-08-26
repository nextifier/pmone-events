<template>
  <!-- aspect-square reserves the space before the QR generates (no layout shift).
       The code is drawn client-side after a dynamic import of `qrcode`, so the
       reserved box used to sit empty and then fill in one frame with nothing in
       between. Two stacked layers cross-fade instead. -->
  <div
    :class="cn('t-skel aspect-square w-full', svgContent && 'is-revealed', props.class)"
    :data-state="svgContent ? 'ready' : 'loading'"
  >
    <div class="t-skel-skeleton">
      <Skeleton class="size-full rounded-xl" />
    </div>

    <div class="t-skel-content">
      <template v-if="svgContent">
        <Tippy v-if="canToggle" tag="div" theme="primary" placement="bottom">
          <button
            type="button"
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
        <div
          v-else
          v-html="svgContent"
          class="[&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
        />
      </template>
    </div>
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
  transition:
    opacity var(--reveal-dur) var(--reveal-ease),
    filter var(--reveal-dur) var(--reveal-ease);
}
.t-skel-content {
  z-index: 2;
  opacity: 0;
  filter: blur(var(--reveal-blur));
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

@media (prefers-reduced-motion: reduce) {
  .t-skel-skeleton,
  .t-skel-content {
    transition: none !important;
  }
}
</style>

<script setup lang="ts">
import { computed, nextTick, onMounted, shallowRef, watch } from "vue";
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
    class: undefined,
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
