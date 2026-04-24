<template>
  <section>
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <h2 class="section-title">
          Here’s How We Craft Your
          <span class="text-gradient-accent">Perfect End-to-End Outing</span>
        </h2>
      </div>

      <Stepper
        orientation="vertical"
        class="mx-auto mt-8 flex w-full max-w-xl flex-col justify-start gap-8"
      >
        <StepperItem
          v-for="(item, index) in items"
          :key="index"
          class="relative flex w-full items-start gap-5"
          :step="index + 1"
          v-slot="{ state }"
        >
          <StepperSeparator
            class="bg-border group-data-[state=active]:bg-border group-data-[state=completed]:bg-border group-data-[state=inactive]:bg-border absolute top-0 left-7 block w-px shrink-0 rounded-full"
            :class="
              index != Object.keys(items).length - 1
                ? 'h-[calc(100%+2rem)] lg:h-[calc(100%+5rem)]'
                : ''
            "
          />

          <span
            class="bg-background text-primary border-border z-0 flex size-14 shrink-0 items-center justify-center rounded-full border"
          >
            <Icon
              v-if="item.iconName"
              :name="item.iconName"
              class="size-6 shrink-0"
            />
          </span>

          <div>
            <StepperTitle class="hidden"></StepperTitle>
            <StepperDescription class="hidden"></StepperDescription>

            <div class="flex flex-col gap-2">
              <span
                class="text-primary text-lg font-semibold tracking-tighter whitespace-normal sm:text-xl"
              >
                {{ item.title }}
              </span>
              <span class="text-primary/70 !leading-normal tracking-tight">
                {{ item.description }}
              </span>
            </div>
          </div>
        </StepperItem>
      </Stepper>
    </div>
  </section>
</template>

<script setup>
const items = [
  {
    title: "Understanding Your Vision & Designing with Purpose",
    description:
      "First, we learn your unique HR goals to design a fun, purposeful outing concept perfectly tailored for your team.",
    iconName: "hugeicons:cursor-pointer-02",
  },
  {
    title: "Managing Every Little Detail (Relax, We’ll Handle It!)",
    description:
      "Next, we handle all your travel, hotel, and transport logistics nationwide, ensuring a smooth and comfortable journey for everyone.",
    iconName: "hugeicons:bus-01",
  },
  {
    title: "Making Magic Happen On-Site",
    description:
      "On the day, our expert team manages every detail flawlessly on-site, so you can relax and fully enjoy the experience alongside your team.",
    iconName: "hugeicons:time-setting-01",
  },
  {
    title: "Adding Those Extra Sparkles 'Wow' Moments",
    description:
      "We then weave in memorable 'wow' moments through unique experiences and special highlights designed for your team, making your outing truly special.",
    iconName: "hugeicons:clapping-01",
  },
  {
    title: "Keeping the Good Vibes Going: Memories & Recaps",
    description:
      "Finally, we capture all the great moments with professional photos and videos, helping to keep the positive impact alive long after.",
    iconName: "hugeicons:magic-wand-02",
  },
];
</script>
