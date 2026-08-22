<template>
  <div
    ref="rootRef"
    class="t-tilt"
    @pointermove="track"
    @pointerleave="reset"
  >
    <div ref="cardRef" class="t-tilt-card" v-bind="$attrs">
      <slot />
      <span v-if="glare" class="t-tilt-glare" aria-hidden="true" />
    </div>
  </div>
</template>

<script setup>
import { useMediaQuery } from "@vueuse/core";

defineOptions({ inheritAttrs: false });

const props = defineProps({
  /** Peak tilt in degrees at the card edges. 10-16 reads as a tasteful lean. */
  max: {
    type: Number,
    default: 14,
  },
  /** Cursor-tracked light glare layered on top of the card contents. */
  glare: {
    type: Boolean,
    default: true,
  },
});

const rootRef = ref(null);
const cardRef = ref(null);

/**
 * Pointer-only by design: touch devices keep the card flat so a swipe across
 * it still scrolls the page.
 */
const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

function reset() {
  const tilt = rootRef.value;
  const card = cardRef.value;
  if (!tilt || !card) return;

  tilt.classList.remove("is-hover");
  card.classList.remove("is-tilting");
  card.style.setProperty("--tilt-rx", "0deg");
  card.style.setProperty("--tilt-ry", "0deg");
}

/**
 * The pointer is read off the outer wrapper, which never transforms. Tracking
 * the rotating card instead lets its edges slip out from under the cursor near
 * the borders, which flickers the hover state on and off.
 */
function track(event) {
  if (!finePointer.value || reducedMotion.value) return;
  if (event.pointerType !== "mouse") return;

  const tilt = rootRef.value;
  const card = cardRef.value;
  if (!tilt || !card) return;

  const rect = tilt.getBoundingClientRect();
  const px = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  const py = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));

  tilt.classList.add("is-hover");
  card.classList.add("is-tilting");
  card.style.setProperty("--tilt-ry", `${((px - 0.5) * props.max).toFixed(2)}deg`);
  card.style.setProperty("--tilt-rx", `${((0.5 - py) * props.max).toFixed(2)}deg`);
  card.style.setProperty("--tilt-gx", `${(px * 100).toFixed(1)}%`);
  card.style.setProperty("--tilt-gy", `${(py * 100).toFixed(1)}%`);
}
</script>

<style>
/* Card hover tilt (transitions-dev 19).
   Two deliberate departures from the shipped snippet, both because this is a
   pointer-only treatment: `touch-action: none` is gone (it exists there so a
   finger drag tilts instead of scrolling, and keeping it would kill scrolling
   over the card), and so is the pointerdown/setPointerCapture pass that drives
   the touch gesture. Radius and clipping are left to the call site so its
   Tailwind classes stay in charge of the shape.

   A tilted card projects past its layout box — the near corner grows by a few
   percent — which lengthens the document and can raise a horizontal scrollbar
   when the card sits close to the viewport edge. Give the card room, or put
   `overflow-x: clip` on a page-level ancestor (`clip`, not `hidden`, so no
   scroll container is created and sticky children keep working). */
.t-tilt {
  --tilt-perspective: 1000px;
  --tilt-return: 1000ms;
  --tilt-return-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --tilt-follow: 400ms;
  --tilt-follow-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --tilt-glare-opacity: 0.32;
  --tilt-glare-fade: 300ms;
  --tilt-glare-ease: cubic-bezier(0.22, 1, 0.36, 1);
}

.t-tilt-card {
  position: relative;
}

.t-tilt-glare {
  display: none;
}

@media (hover: hover) and (pointer: fine) {
  /* The card leans toward the pointer via rotateX/rotateY fed from JS; on
     leave it eases back to flat. `.is-tilting` swaps in a shorter follow while
     the pointer moves so the tilt tracks the cursor 1:1. */
  .t-tilt-card {
    transform: perspective(var(--tilt-perspective))
      rotateX(var(--tilt-rx, 0deg)) rotateY(var(--tilt-ry, 0deg));
    transform-style: preserve-3d;
    transition: transform var(--tilt-return) var(--tilt-return-ease);
    will-change: transform;
  }
  .t-tilt-card.is-tilting {
    transition: transform var(--tilt-follow) var(--tilt-follow-ease);
  }

  /* Cursor-tracked glare: layered soft circles that add like light (screen
     blend) at the pointer position. Sits above every layer of the card so the
     light falls on the whole surface, and never eats a click. */
  .t-tilt-glare {
    display: block;
    position: absolute;
    inset: 0;
    z-index: 30;
    pointer-events: none;
    opacity: 0;
    mix-blend-mode: screen;
    background:
      radial-gradient(
        circle 95px at var(--tilt-gx, 50%) var(--tilt-gy, 50%),
        rgba(255, 255, 255, 0.48),
        rgba(255, 255, 255, 0.06) 52%,
        rgba(255, 255, 255, 0) 84%
      ),
      radial-gradient(
        circle 200px at var(--tilt-gx, 50%) var(--tilt-gy, 50%),
        rgba(255, 255, 255, 0.22),
        rgba(255, 255, 255, 0.04) 58%,
        rgba(255, 255, 255, 0) 78%
      ),
      radial-gradient(
        circle 360px at var(--tilt-gx, 50%) var(--tilt-gy, 50%),
        rgba(255, 255, 255, 0.1),
        rgba(255, 255, 255, 0) 88%
      );
    transition: opacity var(--tilt-glare-fade) var(--tilt-glare-ease);
  }
  .t-tilt.is-hover .t-tilt-glare {
    opacity: var(--tilt-glare-opacity);
  }
}

@media (prefers-reduced-motion: reduce) {
  .t-tilt-card {
    transform: none !important;
    transition: none !important;
  }
}
</style>
