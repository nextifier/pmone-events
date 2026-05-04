<template>
  <div
    ref="containerRef"
    class="rolling-text-container"
    :class="{ 'is-ready': isReady }"
  >
    <div ref="tubeRef" class="rolling-text-tube">
      <h1
        v-for="i in props.lines"
        :key="i"
        ref="lineRefs"
        class="rolling-text-line text-foreground font-medium tracking-[-0.06em]"
      >
        {{ props.text }}
      </h1>
    </div>
  </div>
</template>

<script setup lang="ts">
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

if (import.meta.client) {
  gsap.registerPlugin(SplitText);
}

interface Props {
  text?: string;
  lines?: number;
  duration?: number;
  stagger?: number;
  lineOffset?: number;
}

const props = withDefaults(defineProps<Props>(), {
  text: "RollingText",
  lines: 4,
  duration: 4.5,
  stagger: 0.35,
  lineOffset: 2.2,
});

const containerRef = ref<HTMLDivElement | null>(null);
const tubeRef = ref<HTMLDivElement | null>(null);
const lineRefs = ref<HTMLHeadingElement[]>([]);
const isReady = ref(false);

let splitters: SplitText[] = [];
let timeline: gsap.core.Timeline | null = null;
let ctx: gsap.Context | null = null;
let resizeTimer: ReturnType<typeof setTimeout> | null = null;
let intersectionObserver: IntersectionObserver | null = null;
let motionMediaQuery: MediaQueryList | null = null;
let isInView = false;
let prefersReducedMotion = false;

const teardown = () => {
  if (timeline) {
    timeline.kill();
    timeline = null;
  }
  if (ctx) {
    ctx.revert();
    ctx = null;
  }
  splitters.forEach((s) => s.revert());
  splitters = [];
};

const fitFontSize = () => {
  if (!tubeRef.value || !lineRefs.value.length) return;
  const tubeWidth = tubeRef.value.clientWidth;
  if (!tubeWidth) return;

  lineRefs.value.forEach((line) => {
    line.style.fontSize = "";
  });

  const reference = lineRefs.value[0];
  if (!reference) return;

  // Force reflow to read fresh measurement
  void reference.offsetWidth;

  const naturalWidth = reference.scrollWidth;
  if (naturalWidth <= tubeWidth) return;

  const baseSize = parseFloat(getComputedStyle(reference).fontSize);
  const scaled = (tubeWidth / naturalWidth) * baseSize * 0.98;
  lineRefs.value.forEach((line) => {
    line.style.fontSize = `${scaled}px`;
  });
};

const init = () => {
  if (!containerRef.value || !lineRefs.value.length) return;

  teardown();

  if (prefersReducedMotion) {
    fitFontSize();
    isReady.value = true;
    return;
  }

  fitFontSize();

  const depth = -window.innerWidth / 8;
  const transformOrigin = `50% 50% ${depth}px`;

  gsap.set(lineRefs.value, {
    perspective: 700,
    transformStyle: "preserve-3d",
  });

  splitters = lineRefs.value.map(
    (line) =>
      new SplitText(line, {
        type: "chars",
        charsClass: "rolling-text-char",
      }),
  );

  isReady.value = true;

  ctx = gsap.context(() => {
    const tl = gsap.timeline({ repeat: -1, paused: !isInView });
    splitters.forEach((split, index) => {
      tl.fromTo(
        split.chars,
        { rotationX: -90 },
        {
          rotationX: 90,
          stagger: props.stagger,
          duration: props.duration,
          ease: "none",
          transformOrigin,
        },
        index * props.lineOffset,
      );
    });
    timeline = tl;
  }, containerRef.value);
};

const handleResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => init(), 150);
};

const setupVisibilityObserver = () => {
  if (!containerRef.value || typeof IntersectionObserver === "undefined") {
    isInView = true;
    return;
  }
  intersectionObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry) return;
      isInView = entry.isIntersecting;
      if (!timeline) return;
      if (isInView) timeline.play();
      else timeline.pause();
    },
    { threshold: 0, rootMargin: "200px 0px" },
  );
  intersectionObserver.observe(containerRef.value);
};

const handleMotionChange = (e: MediaQueryListEvent) => {
  prefersReducedMotion = e.matches;
  init();
};

const bootstrap = async () => {
  if (typeof window === "undefined") return;
  motionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  prefersReducedMotion = motionMediaQuery.matches;
  motionMediaQuery.addEventListener("change", handleMotionChange);

  await nextTick();
  try {
    await document.fonts.ready;
  } catch {
    // ignore
  }
  setupVisibilityObserver();
  init();
};

onMounted(() => {
  bootstrap();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  if (resizeTimer) clearTimeout(resizeTimer);
  window.removeEventListener("resize", handleResize);
  if (intersectionObserver) {
    intersectionObserver.disconnect();
    intersectionObserver = null;
  }
  if (motionMediaQuery) {
    motionMediaQuery.removeEventListener("change", handleMotionChange);
    motionMediaQuery = null;
  }
  teardown();
});

watch(
  () => [props.text, props.lines],
  () => {
    nextTick(() => init());
  },
);
</script>

<style scoped>
.rolling-text-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  visibility: hidden;
  contain: layout paint;
}

.rolling-text-container.is-ready {
  visibility: visible;
}

.rolling-text-tube {
  position: relative;
  width: 100%;
  height: 24vw;
  overflow: visible;
}

.rolling-text-line {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  line-height: 1;
  margin: 0;
  font-size: 18vw;
  white-space: nowrap;
  text-align: center;
  pointer-events: none;
}

.rolling-text-line :deep(.rolling-text-char) {
  backface-visibility: hidden;
  display: inline-block;
}
</style>
