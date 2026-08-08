<template>
  <section class="container">
    <h2 class="section-title text-center">{{ $t("icgp.timelineTitle") }}</h2>

    <Stepper
      orientation="vertical"
      class="mx-auto mt-6 grid w-full max-w-screen-sm grid-cols-1 gap-y-8 lg:mt-8 lg:gap-y-10"
    >
      <StepperItem
        v-for="(item, index) in items"
        :key="index"
        class="relative flex w-full items-start gap-x-3 lg:gap-x-6"
        :step="index + 1"
      >
        <StepperSeparator
          v-if="index != Object.keys(items).length - 1"
          class="absolute left-[1.25rem] top-0 block w-px shrink-0 rounded-full bg-gray-200 !opacity-100 group-data-[state=active]:bg-gray-200 group-data-[state=completed]:bg-gray-200 group-data-[state=inactive]:bg-gray-200 dark:bg-gray-800 dark:group-data-[state=active]:bg-gray-800 dark:group-data-[state=completed]:bg-gray-800 dark:group-data-[state=inactive]:bg-gray-800"
          :class="
            index != Object.keys(items).length - 1
              ? 'h-[calc(100%+2rem)] lg:h-[calc(100%+5rem)]'
              : 'h-full'
          "
        />

        <StepperTrigger as-child>
          <Button
            variant="outline"
            size="icon"
            class="z-10 size-10 shrink-0 rounded-full border-gray-300 bg-white !opacity-100 dark:border-gray-800 dark:bg-gray-950"
          >
            <span>{{ index + 1 }}</span>
          </Button>
        </StepperTrigger>

        <div class="flex flex-col">
          <StepperTitle></StepperTitle>
          <StepperDescription> </StepperDescription>

          <div class="flex flex-col">
            <span
              class="text-lg font-bold tracking-tighter text-black dark:text-white sm:text-xl"
              >{{ item.title }}</span
            >

            <span
              class="mt-1 text-base font-medium tracking-tight text-gray-700 dark:text-gray-300 sm:text-lg"
              >{{ item.description }}</span
            >
          </div>
        </div>
      </StepperItem>
    </Stepper>
  </section>
</template>

<script setup>
import { Dot } from "@lucide/vue";
const { t } = useI18n();

const items = computed(() => [
  {
    title: t("icgp.timeline.0.title"),
    description: t("icgp.timeline.0.description"),
  },
  {
    title: t("icgp.timeline.1.title"),
    description: t("icgp.timeline.1.description"),
  },
  {
    title: t("icgp.timeline.2.title"),
    description: t("icgp.timeline.2.description"),
  },
  {
    title: t("icgp.timeline.3.title"),
    description: t("icgp.timeline.3.description"),
  },
]);
</script>
