<template>
  <div
    class="from-background to-background text-foreground relative isolate overflow-hidden bg-linear-to-b via-blue-100/0 tracking-tight lg:bg-radial-[at_25%_25%] dark:via-blue-950/50"
  >
    <div
      class="from-background to-background/0 absolute inset-x-0 top-0 z-0 h-[20%] bg-linear-to-b"
    ></div>
    <div
      class="from-background to-background/0 absolute inset-x-0 bottom-0 z-0 h-[20%] bg-linear-to-t"
    ></div>

    <div class="z-20 container space-y-10">
      <!-- Shape variants (full size for comparison with test-2) -->
      <section>
        <h2 class="mb-4 text-lg font-medium">Shape (full size)</h2>
        <div class="grid grid-cols-2 gap-4">
          <GlowCard shape="circle"> Circle (default) </GlowCard>
          <GlowCard variant="crescent"> Crescent </GlowCard>
        </div>
      </section>

      <!-- Shape variants small -->
      <section>
        <h2 class="mb-4 text-lg font-medium">Shape (small)</h2>
        <div class="grid grid-cols-3 place-items-center gap-4">
          <GlowCard shape="circle" class="max-w-60 text-sm"> Circle </GlowCard>
          <GlowCard shape="card" class="max-w-60 text-sm"> Card </GlowCard>
          <GlowCard variant="crescent" class="max-w-60 text-sm">
            Crescent
          </GlowCard>
        </div>
      </section>

      <!-- Custom colors -->
      <section>
        <h2 class="mb-4 text-lg font-medium">Custom Colors</h2>
        <div class="grid grid-cols-3 place-items-center gap-4">
          <GlowCard :colors="colorsRainbow" class="max-w-60 text-sm">
            Rainbow
          </GlowCard>
          <GlowCard
            shape="card"
            :colors="colorsOrange"
            class="max-w-60 text-sm"
          >
            Orange
          </GlowCard>
          <GlowCard
            variant="crescent"
            :colors="colorsPurple"
            class="max-w-60 text-sm"
          >
            Purple
          </GlowCard>
        </div>
      </section>

      <!-- Animation speed -->
      <section>
        <h2 class="mb-4 text-lg font-medium">Animation Speed</h2>
        <div class="grid grid-cols-3 place-items-center gap-4">
          <GlowCard :duration="1" class="max-w-60 text-sm">
            Fast (1s)
          </GlowCard>
          <GlowCard :duration="4" class="max-w-60 text-sm">
            Normal (4s)
          </GlowCard>
          <GlowCard :duration="10" class="max-w-60 text-sm">
            Slow (10s)
          </GlowCard>
        </div>
      </section>

      <!-- Blur amount -->
      <section>
        <h2 class="mb-4 text-lg font-medium">Blur Amount</h2>
        <div class="grid grid-cols-3 place-items-center gap-4">
          <GlowCard blur="1cqi" class="max-w-60 text-sm">
            Subtle (1cqi)
          </GlowCard>
          <GlowCard blur="4cqi" class="max-w-60 text-sm">
            Default (4cqi)
          </GlowCard>
          <GlowCard blur="8cqi" class="max-w-60 text-sm">
            Heavy (8cqi)
          </GlowCard>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
const colorsRainbow = [
  { color: "oklch(0.595 0.196 254.96)", position: "0%" },
  { color: "oklch(0.659 0.187 252.32)", position: "7%" },
  { color: "oklch(0.775 0.121 247.99)", position: "25%" },
  { color: "oklch(0.953 0.083 144.45)", position: "49%" },
  { color: "oklch(0.875 0.175 92.22)", position: "68%" },
  { color: "oklch(0.7 0.202 44.18)", position: "80%" },
  { color: "oklch(0.676 0.217 38.8)", position: "85%" },
  { color: "oklch(0.595 0.196 254.96)", position: "100%" },
];

const colorsOrange = [
  { color: "#f97316", position: "0deg" },
  { color: "#ef4444", position: "120deg" },
  { color: "#fbbf24", position: "240deg" },
  { color: "#f97316", position: "360deg" },
];

const colorsPurple = [
  { color: "#a855f7", position: "0deg" },
  { color: "#6366f1", position: "120deg" },
  { color: "#ec4899", position: "240deg" },
  { color: "#a855f7", position: "360deg" },
];
</script>
