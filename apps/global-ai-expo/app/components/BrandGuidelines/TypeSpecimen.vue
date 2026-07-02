<template>
  <section
    id="brand-typography"
    class="container"
    :style="{ '--brand-weight': weight }"
  >
    <div class="flex flex-col gap-y-3">
      <span class="section-subtitle">03 · Typography</span>
      <h2 class="section-title">One typeface, one voice.</h2>
      <p class="section-description">
        MinusOne does the heavy lifting across every surface. A variable font,
        weights 400 to 1000, set tight on the kerning. The scale below is the
        scale we use. Anything outside it is wrong.
      </p>
    </div>

    <div
      class="border-foreground/10 mt-10 grid grid-cols-1 overflow-hidden rounded-3xl border lg:mt-14 lg:grid-cols-12"
    >
      <div
        class="border-foreground/10 relative col-span-12 flex flex-col justify-between overflow-hidden border-b lg:col-span-5 lg:border-r lg:border-b-0"
      >
        <div
          class="bg-foreground/[0.02] flex flex-1 items-center justify-center p-6 sm:min-h-[420px] sm:p-10"
        >
          <div
            class="brand-weight-target text-foreground flex items-baseline gap-x-1 text-[40vw] leading-[0.8] tracking-[-0.08em] sm:text-[18rem] lg:text-[16rem] xl:text-[20rem]"
          >
            <span>A</span>
            <span class="text-accent">a</span>
          </div>
        </div>

        <div
          class="bg-background border-foreground/10 flex flex-col gap-y-4 border-t p-6 sm:p-8"
        >
          <div class="flex items-end justify-between gap-x-4">
            <div class="flex flex-col gap-y-1">
              <span
                class="text-muted-foreground text-sm font-medium tracking-tight"
              >
                Family
              </span>
              <span
                class="text-foreground text-2xl font-semibold tracking-tighter"
              >
                MinusOne
              </span>
              <span class="text-muted-foreground text-sm tracking-tight">
                Variable, 400-1000. Self-hosted woff2.
              </span>
            </div>
            <div class="flex flex-col items-end gap-y-1">
              <span
                class="text-muted-foreground text-sm font-medium tracking-tight"
              >
                Weight
              </span>
              <span
                class="text-foreground text-2xl font-mono font-medium tracking-tighter tabular-nums"
              >
                {{ weight }}
              </span>
            </div>
          </div>

          <input
            v-model.number="weight"
            type="range"
            min="400"
            max="900"
            step="100"
            class="brand-weight-slider h-1.5 w-full cursor-pointer appearance-none rounded-full bg-foreground/10"
            aria-label="Adjust font weight"
          />

          <div
            class="text-muted-foreground grid grid-cols-6 text-sm tracking-tight"
          >
            <span>400</span>
            <span class="text-center">500</span>
            <span class="text-center">600</span>
            <span class="text-center">700</span>
            <span class="text-center">800</span>
            <span class="text-right">900</span>
          </div>
        </div>
      </div>

      <div class="col-span-12 flex flex-col lg:col-span-7">
        <div
          v-for="(row, idx) in scales"
          :key="row.label"
          class="border-foreground/10 flex flex-col gap-y-3 p-6 sm:p-8"
          :class="{ 'border-t': idx > 0 }"
        >
          <div class="flex items-start justify-between gap-x-3">
            <div class="flex flex-col gap-y-0.5">
              <code
                class="text-muted-foreground font-mono text-sm tracking-tight"
              >
                {{ row.className }}
              </code>
              <span class="text-muted-foreground text-sm tracking-tight">
                {{ row.note }}
              </span>
            </div>
            <ButtonCopy :text="row.className" />
          </div>

          <div
            :class="[row.class, { 'brand-weight-target': !row.weight }]"
            :style="row.weight ? { fontWeight: row.weight } : undefined"
          >
            {{ row.sample }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const weight = ref(600);

const scales = [
  {
    className: ".section-title-large",
    class: "section-title-large !text-3xl sm:!text-5xl",
    sample: "Asia's AI floor.",
    note: "Display headlines. Hero, page titles.",
  },
  {
    className: ".section-title",
    class: "section-title !text-2xl sm:!text-3xl",
    sample: "Built for buyers and builders.",
    note: "Section titles, mid-page headings.",
  },
  {
    className: ".section-subtitle",
    class: "section-subtitle text-base sm:text-lg",
    sample: "Why walk the floor",
    note: "Eyebrow above section titles.",
    weight: 600,
  },
  {
    className: "body",
    class: "text-body text-base tracking-tight",
    sample:
      "Body text in gray-700, 16 to 18px, with leading-relaxed. Long copy lives here.",
    note: "Default paragraph text.",
    weight: 400,
  },
  {
    className: "small",
    class: "text-muted-foreground text-sm tracking-tight",
    sample: "Industry zones · Sentul · 2026",
    note: "Tags, captions, metadata.",
    weight: 500,
  },
];
</script>

<style scoped>
.brand-weight-target {
  font-weight: var(--brand-weight, 600);
}

.brand-weight-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: var(--accent);
  cursor: pointer;
  border: 3px solid white;
  box-shadow:
    0 0 0 1px var(--accent),
    0 1px 2px rgba(0, 0, 0, 0.1);
}

.brand-weight-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: var(--accent);
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 0 0 1px var(--accent);
}
</style>
