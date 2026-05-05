<template>
  <section id="brand-logo" class="container space-y-12 lg:space-y-16">
    <div class="flex items-end justify-between gap-x-8 gap-y-3">
      <div class="flex flex-col gap-y-3">
        <span class="section-subtitle">01 · Logo</span>
        <h2 class="section-title">The mark, the wordmark, and the rules.</h2>
        <p class="section-description">
          The logo is a compound. Mark plus wordmark, locked in proportion.
          Use the full lockup wherever space allows. Mark or wordmark alone
          are reserved for tight constraints, never as a stylistic choice.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      <div
        v-for="panel in panels"
        :key="panel.label"
        :class="[
          'border-primary/10 relative flex aspect-[5/4] flex-col justify-between rounded-3xl border p-5 sm:p-6',
          panel.bg,
          panel.textShadow ? 'brand-on-image-text' : '',
        ]"
      >
        <div class="flex items-center justify-between">
          <span :class="['text-sm font-medium tracking-tight', panel.labelClass]">
            {{ panel.label }}
          </span>
          <span
            :class="[
              'rounded-full px-2 py-0.5 font-mono text-sm tracking-tight',
              panel.chipClass,
            ]"
          >
            {{ panel.note }}
          </span>
        </div>

        <Logo :class="['mx-auto h-16 sm:h-20', panel.logoClass]" />

        <span :class="['text-sm font-mono tracking-tight', panel.labelClass]">
          {{ panel.usage }}
        </span>
      </div>
    </div>

    <div class="flex flex-col gap-y-6">
      <div class="flex flex-col gap-y-2">
        <h3
          class="text-foreground text-2xl font-semibold tracking-tighter sm:text-3xl"
        >
          Construction
        </h3>
        <p class="text-body max-w-xl text-base tracking-tight">
          Gridlines snap to the actual edges of the mark and the wordmark.
          Use these construction lines when you build new lockups, badges,
          or compositions that need to align with the logo.
        </p>
      </div>

      <div
        class="bg-foreground/[0.02] border-primary/10 relative overflow-hidden rounded-3xl border p-6 sm:p-10"
      >
        <div class="flex items-end justify-between gap-x-4 pb-6">
          <span class="text-muted-foreground text-sm font-medium tracking-tighter">
            Mark · construction
          </span>
          <span
            class="text-muted-foreground hidden font-mono text-sm tracking-tight sm:inline"
          >
            viewBox 400 × 400
          </span>
        </div>

        <div class="relative mx-auto w-full max-w-[640px]">
          <div class="relative aspect-square w-full">
            <LogoMark
              ref="markRef"
              class="text-primary absolute inset-0 size-full"
              aria-hidden="true"
            />

            <svg
              v-if="markBox"
              class="text-accent pointer-events-none absolute inset-0 size-full"
              :viewBox="`0 0 ${markViewBox.w} ${markViewBox.h}`"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <g
                fill="none"
                stroke="currentColor"
                stroke-width="1"
                stroke-dasharray="6 4"
                vector-effect="non-scaling-stroke"
              >
                <line
                  :x1="markBox.left"
                  y1="0"
                  :x2="markBox.left"
                  :y2="markViewBox.h"
                />
                <line
                  :x1="markBox.right"
                  y1="0"
                  :x2="markBox.right"
                  :y2="markViewBox.h"
                />
                <line
                  x1="0"
                  :y1="markBox.top"
                  :x2="markViewBox.w"
                  :y2="markBox.top"
                />
                <line
                  x1="0"
                  :y1="markBox.bottom"
                  :x2="markViewBox.w"
                  :y2="markBox.bottom"
                />
              </g>
            </svg>
          </div>

          <template v-if="markBox">
            <span
              :style="{ left: `${(markBox.left / markViewBox.w) * 100}%` }"
              class="text-accent absolute -top-5 hidden -translate-x-1/2 font-mono text-sm tracking-tight sm:block"
            >
              {{ Math.round(markBox.left) }}
            </span>
            <span
              :style="{ left: `${(markBox.right / markViewBox.w) * 100}%` }"
              class="text-accent absolute -top-5 hidden -translate-x-1/2 font-mono text-sm tracking-tight sm:block"
            >
              {{ Math.round(markBox.right) }}
            </span>
            <span
              :style="{ top: `${(markBox.top / markViewBox.h) * 100}%` }"
              class="text-accent absolute -left-7 hidden -translate-y-1/2 font-mono text-sm tracking-tight sm:block"
            >
              {{ Math.round(markBox.top) }}
            </span>
            <span
              :style="{ top: `${(markBox.bottom / markViewBox.h) * 100}%` }"
              class="text-accent absolute -left-7 hidden -translate-y-1/2 font-mono text-sm tracking-tight sm:block"
            >
              {{ Math.round(markBox.bottom) }}
            </span>
          </template>
        </div>

        <div
          class="border-primary/10 mt-10 grid grid-cols-2 gap-4 border-t pt-6 sm:grid-cols-4 sm:gap-8"
        >
          <div class="flex flex-col gap-y-1">
            <span class="text-muted-foreground text-sm font-medium tracking-tight">
              Width
            </span>
            <span class="text-foreground font-mono text-base tracking-tighter">
              {{ markBox ? Math.round(markBox.width) : "—" }} unit
            </span>
          </div>
          <div class="flex flex-col gap-y-1">
            <span class="text-muted-foreground text-sm font-medium tracking-tight">
              Height
            </span>
            <span class="text-foreground font-mono text-base tracking-tighter">
              {{ markBox ? Math.round(markBox.height) : "—" }} unit
            </span>
          </div>
          <div class="flex flex-col gap-y-1">
            <span class="text-muted-foreground text-sm font-medium tracking-tight">
              Center
            </span>
            <span class="text-foreground font-mono text-base tracking-tighter">
              {{ markBox ? `${Math.round(markBox.cx)}, ${Math.round(markBox.cy)}` : "—" }}
            </span>
          </div>
          <div class="flex flex-col gap-y-1">
            <span class="text-muted-foreground text-sm font-medium tracking-tight">
              Min size
            </span>
            <span class="text-foreground font-mono text-base tracking-tighter">
              24px tall
            </span>
          </div>
        </div>
      </div>

      <div
        class="bg-foreground/[0.02] border-primary/10 relative overflow-hidden rounded-3xl border p-6 sm:p-10"
      >
        <div class="flex items-end justify-between gap-x-4 pb-6">
          <span class="text-muted-foreground text-sm font-medium tracking-tighter">
            Lockup · construction
          </span>
          <span
            class="text-muted-foreground hidden font-mono text-sm tracking-tight sm:inline"
          >
            mark + 0.45em + wordmark
          </span>
        </div>

        <div ref="lockupContainerRef" class="relative mx-auto w-full">
          <div class="relative flex items-center justify-center py-8 sm:py-12">
            <Logo ref="lockupRef" class="text-primary h-24 sm:h-32" />
          </div>

          <template v-if="lockupBoxes">
            <div
              v-for="line in lockupVerticalLines"
              :key="`lv-${line.x}-${line.kind}`"
              :style="{ left: `${line.x}%` }"
              class="brand-dashed-v pointer-events-none absolute inset-y-0 w-px"
            ></div>
            <div
              v-for="line in lockupHorizontalLines"
              :key="`lh-${line.y}-${line.kind}`"
              :style="{ top: `${line.y}%` }"
              class="brand-dashed-h pointer-events-none absolute inset-x-0 h-px"
            ></div>

            <span
              v-for="label in lockupVerticalLabels"
              :key="`lvlabel-${label.x}`"
              :style="{ left: `${label.x}%` }"
              class="text-accent absolute -top-5 hidden -translate-x-1/2 font-mono text-sm tracking-tight sm:block"
            >
              {{ label.text }}
            </span>
            <span
              v-for="label in lockupHorizontalLabels"
              :key="`lhlabel-${label.y}`"
              :style="{ top: `${label.y}%` }"
              class="text-accent absolute -left-9 hidden -translate-y-1/2 font-mono text-sm tracking-tight sm:block"
            >
              {{ label.text }}
            </span>
          </template>
        </div>

        <div
          class="border-primary/10 mt-10 grid grid-cols-2 gap-4 border-t pt-6 sm:grid-cols-4 sm:gap-8"
        >
          <div class="flex flex-col gap-y-1">
            <span class="text-muted-foreground text-sm font-medium tracking-tight">
              Mark width
            </span>
            <span class="text-foreground font-mono text-base tracking-tighter">
              {{ lockupBoxes ? `${Math.round(lockupBoxes.mark.width)}px` : "—" }}
            </span>
          </div>
          <div class="flex flex-col gap-y-1">
            <span class="text-muted-foreground text-sm font-medium tracking-tight">
              Wordmark width
            </span>
            <span class="text-foreground font-mono text-base tracking-tighter">
              {{ lockupBoxes ? `${Math.round(lockupBoxes.type.width)}px` : "—" }}
            </span>
          </div>
          <div class="flex flex-col gap-y-1">
            <span class="text-muted-foreground text-sm font-medium tracking-tight">
              Gap
            </span>
            <span class="text-foreground font-mono text-base tracking-tighter">
              {{ lockupBoxes ? `${Math.round(lockupBoxes.gap)}px` : "—" }}
            </span>
          </div>
          <div class="flex flex-col gap-y-1">
            <span class="text-muted-foreground text-sm font-medium tracking-tight">
              Min lockup width
            </span>
            <span class="text-foreground font-mono text-base tracking-tighter">
              120px
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useDebounceFn } from "@vueuse/core";

const panels = [
  {
    label: "Primary",
    note: "On white",
    usage: "Default lockup. Use everywhere by default.",
    bg: "bg-background border-primary/10",
    labelClass: "text-muted-foreground",
    chipClass: "bg-foreground/5 text-muted-foreground",
    logoClass: "text-primary",
    textShadow: false,
  },
  {
    label: "Reverse",
    note: "On black",
    usage: "Dark surfaces and night sections.",
    bg: "bg-primary",
    labelClass: "text-white",
    chipClass: "bg-white/15 text-white",
    logoClass: "text-background",
    textShadow: false,
  },
  {
    label: "Signature",
    note: "On gradient",
    usage: "Hero art, social covers, key visuals only.",
    bg: "bg-gradient-to-br from-cyan-400 via-blue-600 to-fuchsia-500",
    labelClass: "text-white",
    chipClass: "bg-white/20 text-white",
    logoClass: "text-white",
    textShadow: true,
  },
];

const markRef = ref(null);
const markBox = ref(null);
const markViewBox = { w: 400, h: 400 };

const lockupRef = ref(null);
const lockupContainerRef = ref(null);
const lockupBoxes = ref(null);

const measureMark = () => {
  const svg = markRef.value?.$el ?? markRef.value;
  if (!svg || svg.tagName?.toLowerCase() !== "svg") return;
  const path = svg.querySelector("path");
  if (!path) return;
  const bbox = path.getBBox();
  markBox.value = {
    left: bbox.x,
    right: bbox.x + bbox.width,
    top: bbox.y,
    bottom: bbox.y + bbox.height,
    cx: bbox.x + bbox.width / 2,
    cy: bbox.y + bbox.height / 2,
    width: bbox.width,
    height: bbox.height,
  };
};

const measureLockup = () => {
  const wrapper =
    lockupRef.value?.$el ?? lockupRef.value;
  const container = lockupContainerRef.value;
  if (!wrapper || !container) return;
  const svgs = wrapper.querySelectorAll("svg");
  if (svgs.length < 2) return;

  const containerRect = container.getBoundingClientRect();
  if (!containerRect.width) return;

  const markRect = svgs[0].getBoundingClientRect();
  const typeRect = svgs[1].getBoundingClientRect();

  const toPct = (rect) => ({
    left: ((rect.left - containerRect.left) / containerRect.width) * 100,
    right: ((rect.right - containerRect.left) / containerRect.width) * 100,
    top: ((rect.top - containerRect.top) / containerRect.height) * 100,
    bottom: ((rect.bottom - containerRect.top) / containerRect.height) * 100,
    width: rect.width,
    height: rect.height,
  });

  const mark = toPct(markRect);
  const type = toPct(typeRect);

  lockupBoxes.value = {
    mark,
    type,
    gap: typeRect.left - markRect.right,
  };
};

const lockupVerticalLines = computed(() => {
  const b = lockupBoxes.value;
  if (!b) return [];
  return [
    { x: b.mark.left, kind: "edge" },
    { x: b.mark.right, kind: "edge" },
    { x: b.type.left, kind: "edge" },
    { x: b.type.right, kind: "edge" },
  ];
});

const lockupHorizontalLines = computed(() => {
  const b = lockupBoxes.value;
  if (!b) return [];
  return [
    { y: b.mark.top, kind: "edge" },
    { y: b.mark.bottom, kind: "edge" },
    { y: b.type.top, kind: "edge" },
    { y: b.type.bottom, kind: "edge" },
  ];
});

const lockupVerticalLabels = computed(() => {
  const b = lockupBoxes.value;
  if (!b) return [];
  return [
    { x: b.mark.left, text: "M" },
    { x: b.mark.right, text: "M'" },
    { x: b.type.left, text: "T" },
    { x: b.type.right, text: "T'" },
  ];
});

const lockupHorizontalLabels = computed(() => {
  const b = lockupBoxes.value;
  if (!b) return [];
  return [
    { y: b.mark.top, text: "top" },
    { y: b.mark.bottom, text: "base" },
  ];
});

const debouncedMeasureLockup = useDebounceFn(measureLockup, 120);

let resizeObserver;

onMounted(() => {
  nextTick(() => {
    measureMark();
    measureLockup();
  });

  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => {
      debouncedMeasureLockup();
    });
    if (lockupContainerRef.value) {
      resizeObserver.observe(lockupContainerRef.value);
    }
  }

  window.addEventListener("resize", debouncedMeasureLockup);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  window.removeEventListener("resize", debouncedMeasureLockup);
});
</script>

<style scoped>
.brand-on-image-text :where(.text-white, [class*="text-white"]) {
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.45),
    0 0 12px rgba(0, 0, 0, 0.25);
}

.brand-dashed-v {
  background-image: linear-gradient(
    to bottom,
    var(--accent) 0 6px,
    transparent 6px 10px
  );
  background-size: 1px 10px;
  background-repeat: repeat-y;
}

.brand-dashed-h {
  background-image: linear-gradient(
    to right,
    var(--accent) 0 6px,
    transparent 6px 10px
  );
  background-size: 10px 1px;
  background-repeat: repeat-x;
}
</style>
