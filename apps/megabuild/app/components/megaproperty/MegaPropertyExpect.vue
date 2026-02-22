<template>
  <section id="what-to-expect">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <span class="text-gradient-accent font-medium tracking-tight"
          >What to Expect</span
        >
        <h2 class="section-title mt-2.5">
          Your Gateway to Property Excellence
        </h2>
      </div>

      <div
        class="mt-6 grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4"
      >
        <div
          v-for="(item, index) in items"
          :key="index"
          class="border-border flex flex-col rounded-xl border px-5 py-7"
        >
          <Icon :name="item.icon" class="text-primary size-7" />

          <h3
            class="text-foreground mt-5 text-lg font-semibold tracking-tight lg:text-xl"
          >
            {{ item.title }}
          </h3>

          <p
            class="text-muted-foreground mt-2 text-sm tracking-tight lg:text-base"
          >
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const items = [
  {
    icon: "hugeicons:home-01",
    title: "Exclusive Property Showcases",
    description:
      "View and compare high-value developments from across Indonesia and the world, featuring premium residential, commercial, and mixed-use projects.",
  },
  {
    icon: "hugeicons:mic-01",
    title: "World-Class Speakers & Panels",
    description:
      "Gain insights from leading investors, developers, and financial experts through insightful conferences and market outlooks.",
  },
  {
    icon: "hugeicons:agreement-01",
    title: "Premium Networking Opportunities",
    description:
      "Connect with decision-makers, industry leaders, and serious buyers. Build meaningful relationships through Developers Night events.",
  },
  {
    icon: "hugeicons:bank",
    title: "Financing & Investment Solutions",
    description:
      "Meet banks, wealth advisors, and financial institutions for cross-border investment guidance and home mortgage solutions.",
  },
];
</script>
