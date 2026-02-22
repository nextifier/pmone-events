<template>
  <section id="target-exhibitors">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <span class="text-gradient-accent font-medium tracking-tight"
          >Target Exhibitors</span
        >
        <h2 class="section-title mt-2.5">Who Should Exhibit?</h2>
        <p
          class="text-muted-foreground mx-auto mt-2.5 max-w-2xl text-base tracking-tight text-balance sm:text-lg"
        >
          Developers, Investors, Real Estate Agencies/Brokers, Consultants,
          Financial Institutions
        </p>
      </div>

      <div
        class="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:mt-10 xl:grid-cols-4"
      >
        <div
          v-for="(category, index) in categories"
          :key="index"
          class="border-border flex flex-col rounded-xl border px-5 py-7"
        >
          <Icon :name="category.icon" class="text-primary size-6" />

          <h3 class="text-foreground mt-4 text-lg font-semibold tracking-tight">
            {{ category.title }}
          </h3>

          <ul class="text-muted-foreground mt-2.5 space-y-1.5 tracking-tight">
            <li
              v-for="(item, itemIndex) in category.items"
              :key="itemIndex"
              class="flex items-start gap-2"
            >
              <Icon
                name="hugeicons:tick-02"
                class="text-primary size-[1lh] shrink-0 scale-80"
              />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Zones -->
      <div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div class="border-border flex flex-col rounded-xl border px-5 py-7">
          <Icon
            name="hugeicons:paint-brush-01"
            class="text-foreground size-6"
          />
          <h3 class="text-foreground mt-4 text-lg font-semibold tracking-tight">
            Designers Alley
          </h3>
          <p class="text-muted-foreground mt-1.5">
            Architects, Interior Designers, Contractors
          </p>
        </div>

        <div class="border-border flex flex-col rounded-xl border px-5 py-7">
          <Icon name="hugeicons:building-03" class="text-foreground size-6" />
          <h3 class="text-foreground mt-4 text-lg font-semibold tracking-tight">
            Property Developer Zone
          </h3>
          <p class="text-muted-foreground mt-1.5">
            Property Developers & Real Estate
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const categories = [
  {
    icon: "hugeicons:building-02",
    title: "Property Developers",
    items: [
      "Residential developers",
      "Commercial property developers",
      "Mixed-use & township developers",
      "Industrial & logistics developers",
    ],
  },
  {
    icon: "hugeicons:bank",
    title: "Investors & Financial Institutions",
    items: [
      "Real estate investment companies",
      "REITs",
      "Banks and property financing",
      "Venture capital firms",
    ],
  },
  {
    icon: "hugeicons:briefcase-01",
    title: "Real Estate Agencies & Brokers",
    items: [
      "National real estate agencies",
      "International brokers",
      "Property listing platforms",
      "Bankers",
    ],
  },
  {
    icon: "hugeicons:ruler",
    title: "Architects & Urban Planners",
    items: [
      "Architecture firms",
      "Urban & masterplan consultants",
      "Landscape planners",
      "Sustainability planners",
    ],
  },
  {
    icon: "hugeicons:sofa-01",
    title: "Interior Design & Furniture",
    items: [
      "Interior design studios",
      "Furniture & decor suppliers",
      "Workspace styling solutions",
      "Home styling solutions",
    ],
  },
  {
    icon: "hugeicons:wrench-01",
    title: "Building Materials & Technology",
    items: [
      "Construction materials",
      "Smart building & IoT solutions",
      "Energy efficiency providers",
      "Sustainable technology",
    ],
  },
  {
    icon: "hugeicons:file-validation",
    title: "Property Service Providers",
    items: [
      "Property consultants",
      "Surveyors & valuators",
      "Legal & notary services",
      "Insurance providers",
    ],
  },
  {
    icon: "hugeicons:cpu",
    title: "Investment & Technology",
    items: [
      "Property fintech",
      "Real estate software (CRM)",
      "AI/VR solutions",
      "Asset tokenization",
    ],
  },
];
</script>
