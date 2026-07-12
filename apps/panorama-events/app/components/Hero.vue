<template>
  <section id="hero" class="min-h-screen-offset overflow-hidden pt-8 lg:pt-4">
    <div class="sm:container-wider relative isolate">
      <div
        class="relative isolate z-10 grid grid-cols-1 items-end gap-x-5 gap-y-5 lg:grid-cols-2 xl:grid-cols-3"
      >
        <div
          class="relative z-10 flex flex-col justify-between gap-y-10 px-4 sm:px-0 lg:min-h-[90%] lg:pb-32 xl:pb-40"
        >
          <ul
            class="text-foreground flex flex-col items-end space-y-1 text-sm tracking-tight lg:items-start"
          >
            <li class="flex items-center gap-x-1">
              HR-Driven Corporate Outings
              <IconCheck class="text-accent size-4" />
            </li>

            <li class="flex items-center gap-x-1">
              Seamless Event & Travel Execution
              <IconCheck class="text-accent size-4" />
            </li>

            <li class="flex items-center gap-x-1">
              People-Focused Experiences
              <IconCheck class="text-accent size-4" />
            </li>
          </ul>

          <h1 class="text-foreground flex flex-col gap-y-1">
            <span
              class="text-[clamp(1rem,6vw,2rem)] !leading-[1.25] font-medium tracking-tighter sm:text-2xl"
              >Corporate Outings That Actually</span
            >
            <span
              class="text-[clamp(2rem,20vw,7rem)] !leading-[1] font-semibold tracking-tighter"
              >Build
              <span
                class="inline-flex bg-linear-to-r from-yellow-400 via-orange-600 to-red-600 bg-clip-text text-transparent dark:from-yellow-300"
                >Stronger Teams</span
              >
            </span>
          </h1>
        </div>

        <div
          class="relative isolate z-20 flex w-full flex-col items-center justify-end overflow-hidden lg:min-h-screen lg:w-auto xl:overflow-visible"
        >
          <NuxtImg
            src="/img/hero-img-two-climbers.png"
            alt=""
            class="3xl:scale-130 pointer-events-none relative z-10 w-full origin-top scale-105 select-none sm:scale-100 xl:scale-120 dark:brightness-90 dark:contrast-110"
            width="800"
            height="1488"
            sizes="100vw lg:800px"
            format="webp"
          />

          <div
            class="from-background/100 to-background/0 pointer-events-none absolute inset-x-0 bottom-0 z-30 h-32 translate-y-0.5 bg-linear-to-t mask-t-from-20% mask-t-to-100% backdrop-blur-lg lg:backdrop-blur-none xl:hidden xl:scale-x-100"
          ></div>

          <div
            class="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center justify-center pb-32 xl:pb-40"
          >
            <button
              @click="openContactDialog"
              class="flex items-center gap-x-1 rounded-xl border border-white bg-white/85 px-6 py-4 text-lg font-semibold tracking-tighter text-black backdrop-blur-md transition hover:bg-white active:scale-95"
              v-ripple
            >
              <span>Plan Your Outing</span>
              <Icon name="hugeicons:arrow-up-right-01" class="size-5" />
            </button>
          </div>
        </div>

        <div
          class="relative z-10 grid grid-cols-1 justify-between gap-x-5 gap-y-10 px-4 sm:px-0 lg:col-span-2 lg:min-h-[90%] lg:grid-cols-2 lg:items-end lg:pb-56 xl:col-span-1 xl:grid-cols-1 xl:place-items-end"
        >
          <div ref="statsContainer" class="grid grid-cols-2 gap-2 xl:w-max">
            <div
              v-for="(stat, index) in stats"
              :key="index"
              class="text-foreground hover:bg-muted flex flex-col items-start gap-y-1 rounded-xl px-4 py-4 transition"
            >
              <NumberFlow
                class="text-foreground text-4xl font-extrabold tracking-tighter"
                :value="statValues[index]"
                :format="{ notation: 'compact' }"
                suffix="+"
              />
              <span class="tracking-tight">{{ stat.label }}</span>
            </div>
          </div>

          <div
            class="text-foreground flex flex-col gap-y-3 lg:items-end lg:text-right"
          >
            <p class="text-3xl font-semibold tracking-tighter text-balance">
              Stop settling for average corporate outings.
            </p>
            <p class="text-base tracking-tight text-balance">
              Panorama Events designs HR-Driven experiences to genuinely connect
              your team, supercharge engagement, and deliver impactful growth.
              Because
              <span class="text-gradient-accent font-bold"
                >every great team has its moments</span
              >.
            </p>
          </div>
        </div>
      </div>

      <div
        class="from-background/100 to-background/0 pointer-events-none absolute inset-x-0 bottom-0 z-30 hidden h-32 bg-linear-to-t mask-t-from-20% mask-t-to-100% backdrop-blur-xl xl:block"
      ></div>

      <div
        class="absolute inset-x-0 bottom-0 z-0 hidden h-[80%] grid-cols-12 gap-5 xl:grid"
      >
        <div
          v-for="(_, index) in 12"
          class="to-background size-full bg-gradient-to-t from-gray-50 dark:from-gray-900"
        ></div>

        <!-- <div
          v-for="(_, index) in 12"
          class="from-muted to-background size-full bg-linear-to-r p-px"
        >
          <div class="bg-background size-full"></div>
        </div> -->
      </div>
    </div>
  </section>
</template>

<script setup>
const uiStore = useUiStore();
const openContactDialog = () => {
  uiStore.openContactDialog();
};

const stats = ref([
  {
    value: 20,
    label: "Years of Experiences",
  },
  {
    value: 450,
    label: "Successful Events",
  },
  {
    value: 140,
    label: "Satisfied Clients",
  },
  {
    value: 50000,
    label: "Participants Handled",
  },
]);

const statsContainer = ref();
const isInView = useElementVisibility(statsContainer, { threshold: 0.5 });

// Set all values to 0 initially
const statValues = ref(stats.value.map(() => 0));

watch(
  isInView,
  (isVisible) => {
    if (isVisible) {
      stats.value.forEach((stat, index) => {
        statValues.value[index] = stat.value; // Update to original value when in view
      });
    }
  },
  { immediate: true },
);
</script>
