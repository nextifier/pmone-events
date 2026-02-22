<template>
  <section id="business-segments">
    <div class="container-wider">
      <div class="flex flex-col items-center text-center">
        <h2
          class="section-title-large relative isolate !leading-[1] font-extrabold tracking-tighter text-balance"
        >
          <span class="text-outline">Business</span> Segments
        </h2>

        <p class="section-description mt-4 sm:mt-8">
          Explore a world of opportunities to enhance your business and expand
          your horizons.
        </p>
      </div>

      <div
        class="bg-border *:bg-background relative mt-8 grid grid-cols-1 gap-px p-px *:relative sm:grid-cols-2 lg:mt-10 lg:grid-cols-3"
      >
        <div
          v-for="(item, index) in items"
          :key="index"
          class="flex flex-col items-start gap-y-3 px-6 py-8 pb-10"
        >
          <div
            class="bg-muted flex size-14 shrink-0 items-center justify-center rounded-3xl"
          >
            <Icon :name="item.icon" class="text-primary size-6" />
          </div>
          <div class="flex flex-col items-start gap-y-1">
            <span
              class="text-primary text-base font-semibold tracking-tighter sm:text-xl"
              >{{ item.title }}</span
            >
            <span class="text-muted-foreground tracking-tight">{{
              item.description
            }}</span>
          </div>
        </div>

        <div
          class="bg-pattern-diagonal hidden items-center justify-center px-6 py-8 [--pattern-fg:var(--color-primary)]/10 sm:flex"
        ></div>
      </div>
    </div>
  </section>
</template>

<script setup>
const items = ref([
  {
    title: "Franchise",
    description:
      "Find stability and profitability with proven business models. We feature top-tier local and international brands that offer strong support and guidance for their partners.",
    icon: "hugeicons:store-01",
  },
  {
    title: "Business Opportunity",
    description:
      "Perfect for those starting their journey. Discover promising business concepts with high potential to grow and evolve into a successful franchise.",
    icon: "hugeicons:briefcase-dollar",
  },
  {
    title: "Retail Tech Solution",
    description:
      "Stay ahead of the curve. Explore technologies that streamline operations, enhance customer experience, and keep your business competitive in the digital age.",
    icon: "hugeicons:ai-scan",
  },
  {
    title: "Licensing & Co-Branding",
    description:
      "Boost your sales by leveraging the power of famous characters and well-loved brands. Find licensing partners to make your product stand out.",
    icon: "hugeicons:checkmark-badge-04",
  },
  {
    title: "Distributor",
    description:
      "Tap into Indonesia's massive distribution network. Connect with brands looking for agents, wholesalers, and online affiliates to expand their reach.",
    icon: "hugeicons:shopping-cart-check-02",
  },
]);
</script>
