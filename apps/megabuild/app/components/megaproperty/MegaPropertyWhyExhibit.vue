<template>
  <section id="why-exhibit">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <span class="text-gradient-accent font-medium tracking-tight"
          >Why Exhibit</span
        >
        <h2 class="section-title mt-2.5">6 Reasons Why You Should Exhibit</h2>
        <p
          class="text-muted-foreground mx-auto mt-2 max-w-2xl text-base tracking-tight text-balance sm:text-lg"
        >
          Join the premier platform that connects you with thousands of
          potential buyers, investors, and industry professionals.
        </p>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(reason, index) in reasons"
          :key="index"
          class="border-border bg-background flex flex-col rounded-xl border px-5 py-7"
        >
          <Icon :name="reason.icon" class="text-primary size-7" />

          <h3 class="text-foreground mt-4 text-lg font-semibold tracking-tight">
            {{ reason.title }}
          </h3>

          <p class="text-muted-foreground mt-1 tracking-tight">
            {{ reason.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const reasons = [
  {
    icon: "hugeicons:user-multiple-02",
    title: "Reach Key Buyers & Investors",
    description:
      "Connect with developers, investors, Gen Z, and young families actively seeking property solutions.",
  },
  {
    icon: "hugeicons:idea",
    title: "Showcase Your Innovations",
    description:
      "Present your latest residential, commercial, and smart home projects to a targeted audience.",
  },
  {
    icon: "hugeicons:agreement-01",
    title: "Build Strategic Partnerships",
    description:
      "Engage with key stakeholders to explore joint ventures, collaborations, and business growth.",
  },
  {
    icon: "hugeicons:award-01",
    title: "Strengthen Your Brand",
    description:
      "Position your company as a leader and gain visibility among domestic and international audiences.",
  },
  {
    icon: "hugeicons:chart-line-data-01",
    title: "Gain Market Insights",
    description:
      "Learn from market leaders and property professionals through conferences and panels.",
  },
  {
    icon: "hugeicons:puzzle",
    title: "Integrated with Megabuild",
    description:
      "Benefit from synergy with construction and building materials event for additional exposure.",
  },
];
</script>
