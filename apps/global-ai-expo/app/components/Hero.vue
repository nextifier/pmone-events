<template>
  <section
    id="hero"
    class="relative isolate overflow-hidden bg-paper text-ink"
  >
    <!-- Vivid WebGL shader shape, bottom-right corner -->
    <div
      class="pointer-events-none absolute z-0"
      :style="{
        right: '-3%',
        bottom: '-14%',
        width: 'min(52%, 780px)',
        aspectRatio: '5 / 4',
        clipPath: 'polygon(16% 0, 100% 0, 100% 100%, 0 100%, 0 42%)',
      }"
    >
      <HeroShaderAccent />
    </div>

    <!-- Editorial headline + meta block -->
    <div
      class="container-wider relative z-10 grid min-h-[calc(100svh-var(--navbar-height-mobile))] content-between gap-y-16 pt-10 pb-12 sm:gap-y-24 lg:min-h-[calc(100lvh-var(--navbar-height-desktop))] lg:pt-16 lg:pb-20"
    >
      <h1
        class="font-display max-w-[14ch] text-[clamp(2.5rem,7.5vw,7.75rem)] font-medium leading-[0.95] tracking-[-0.05em] text-balance text-ink"
      >
        {{ content.title }}
      </h1>

      <div
        class="grid max-w-md grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-0"
      >
        <div
          class="font-display text-base font-normal leading-[1.4] tracking-tight text-ink sm:text-lg"
        >
          {{ event.month }} {{ event.dateOnly }},<br />{{ event.year }}
        </div>
        <div
          class="font-display text-base font-normal leading-[1.4] tracking-tight text-ink sm:text-lg"
        >
          Sentul City,<br />Bogor
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const content = computed(() => useContentStore().components.hero);
const event = useAppConfig().event;
</script>
