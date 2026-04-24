<template>
  <div v-if="brand" class="container py-10 lg:py-16">
    <ButtonBack />

    <!-- Hero -->
    <div class="mb-12 lg:mb-16">
      <span
        class="text-muted-foreground text-sm font-medium tracking-wide uppercase"
      >
        {{ brand.category }}
      </span>
      <h1 class="section-title mt-2">{{ brand.hero.headline }}</h1>
      <p class="text-muted-foreground mt-4 text-lg">
        {{ brand.hero.subheadline }}
      </p>
      <p
        class="text-muted-foreground mt-6 max-w-3xl leading-relaxed whitespace-pre-line"
      >
        {{ brand.hero.description }}
      </p>
    </div>

    <!-- Services/What We Do -->
    <div v-if="brand.services" class="mb-12 lg:mb-16">
      <h2 class="mb-6 text-xl font-semibold tracking-tight">What We Do</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="service in brand.services"
          :key="service.title"
          class="bg-muted rounded-xl p-5"
        >
          <h3 class="font-medium">{{ service.title }}</h3>
          <p class="text-muted-foreground mt-1 text-sm">
            {{ service.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Four Festivals (CBE) -->
    <div v-if="brand.festivals" class="mb-12 lg:mb-16">
      <h2 class="mb-6 text-xl font-semibold tracking-tight">
        Four Festivals, One Ticket
      </h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div
          v-for="festival in brand.festivals"
          :key="festival.name"
          class="bg-muted rounded-xl p-5"
        >
          <h3 class="font-medium">{{ festival.name }}</h3>
          <p class="text-muted-foreground mt-1 text-sm">
            {{ festival.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Categories/What's On Show -->
    <div v-if="brand.categories" class="mb-12 lg:mb-16">
      <h2 class="mb-6 text-xl font-semibold tracking-tight">What's On Show</h2>
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="category in brand.categories"
          :key="category.title"
          class="bg-muted rounded-xl p-5"
        >
          <h3 class="mb-3 font-medium">{{ category.title }}</h3>
          <ul class="text-muted-foreground space-y-1 text-sm">
            <li v-for="item in category.items" :key="item">{{ item }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Five Pillars (ICC) -->
    <div v-if="brand.pillars" class="mb-12 lg:mb-16">
      <h2 class="mb-6 text-xl font-semibold tracking-tight">
        Five Pillars of Pop Culture
      </h2>
      <ul class="text-muted-foreground space-y-2">
        <li v-for="pillar in brand.pillars" :key="pillar">{{ pillar }}</li>
      </ul>
    </div>

    <!-- Focus (INACON) -->
    <div v-if="brand.focus" class="mb-12 lg:mb-16">
      <h2 class="mb-6 text-xl font-semibold tracking-tight">J-Culture Focus</h2>
      <ul class="text-muted-foreground space-y-2">
        <li v-for="item in brand.focus" :key="item">{{ item }}</li>
      </ul>
    </div>

    <!-- Approach -->
    <div v-if="brand.approach" class="mb-12 lg:mb-16">
      <h2 class="mb-4 text-xl font-semibold tracking-tight">
        {{ brand.approach.title }}
      </h2>
      <p
        class="text-muted-foreground max-w-3xl leading-relaxed whitespace-pre-line"
      >
        {{ brand.approach.description }}
      </p>
    </div>

    <!-- Notable Events -->
    <div v-if="brand.notableEvents" class="mb-12 lg:mb-16">
      <h2 class="mb-6 text-xl font-semibold tracking-tight">Notable Events</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div
          v-for="event in brand.notableEvents"
          :key="event.title"
          class="bg-muted rounded-xl p-5"
        >
          <h3 class="font-medium">{{ event.title }}</h3>
          <p class="text-muted-foreground mt-1 text-sm">
            {{ event.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Programs -->
    <div v-if="brand.programs" class="mb-12 lg:mb-16">
      <h2 class="mb-6 text-xl font-semibold tracking-tight">Programs</h2>
      <ul
        class="text-muted-foreground grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
      >
        <li v-for="program in brand.programs" :key="program">{{ program }}</li>
      </ul>
    </div>

    <!-- Competitions -->
    <div v-if="brand.competitions" class="mb-12 lg:mb-16">
      <h2 class="mb-6 text-xl font-semibold tracking-tight">Competitions</h2>
      <ul class="text-muted-foreground space-y-2">
        <li v-for="competition in brand.competitions" :key="competition">
          {{ competition }}
        </li>
      </ul>
    </div>

    <!-- Achievements -->
    <div v-if="brand.achievements" class="mb-12 lg:mb-16">
      <h2 class="mb-6 text-xl font-semibold tracking-tight">
        Indonesia's Coffee Achievements
      </h2>
      <ul class="text-muted-foreground space-y-2">
        <li v-for="achievement in brand.achievements" :key="achievement">
          {{ achievement }}
        </li>
      </ul>
    </div>

    <!-- What's Included -->
    <div v-if="brand.included" class="mb-12 lg:mb-16">
      <h2 class="mb-6 text-xl font-semibold tracking-tight">What's Included</h2>
      <ul class="text-muted-foreground space-y-2">
        <li v-for="item in brand.included" :key="item">{{ item }}</li>
      </ul>
    </div>

    <!-- Exhibitors -->
    <div v-if="brand.exhibitors" class="mb-12 lg:mb-16">
      <h2 class="mb-6 text-xl font-semibold tracking-tight">Who Exhibits</h2>
      <ul class="text-muted-foreground space-y-2">
        <li v-for="exhibitor in brand.exhibitors" :key="exhibitor">
          {{ exhibitor }}
        </li>
      </ul>
    </div>

    <!-- Visitors -->
    <div v-if="brand.visitors" class="mb-12 lg:mb-16">
      <h2 class="mb-6 text-xl font-semibold tracking-tight">Who Visits</h2>
      <ul class="text-muted-foreground grid grid-cols-1 gap-2 sm:grid-cols-2">
        <li v-for="visitor in brand.visitors" :key="visitor">{{ visitor }}</li>
      </ul>
    </div>

    <!-- Past Guests (ICC) -->
    <div v-if="brand.pastGuests" class="mb-12 lg:mb-16">
      <h2 class="mb-6 text-xl font-semibold tracking-tight">Past Guests</h2>
      <ul class="text-muted-foreground space-y-2">
        <li v-for="guest in brand.pastGuests" :key="guest">{{ guest }}</li>
      </ul>
    </div>

    <!-- Clients -->
    <div v-if="brand.clients" class="mb-12 lg:mb-16">
      <h2 class="mb-6 text-xl font-semibold tracking-tight">
        Who We've Worked With
      </h2>
      <p class="text-muted-foreground">{{ brand.clients.join(", ") }}</p>
    </div>

    <!-- Partners -->
    <div v-if="brand.partners" class="mb-12 lg:mb-16">
      <h2 class="mb-6 text-xl font-semibold tracking-tight">Partners</h2>
      <ul class="text-muted-foreground space-y-2">
        <li v-for="partner in brand.partners" :key="partner">{{ partner }}</li>
      </ul>
    </div>

    <!-- Bundled Access -->
    <div v-if="brand.bundledAccess" class="mb-12 lg:mb-16">
      <h2 class="mb-6 text-xl font-semibold tracking-tight">Bundled Access</h2>
      <p class="text-muted-foreground">
        One ticket includes free entry to: {{ brand.bundledAccess.join(", ") }}
      </p>
    </div>

    <!-- Industry Context -->
    <div v-if="brand.industryContext" class="mb-12 lg:mb-16">
      <h2 class="mb-4 text-xl font-semibold tracking-tight">
        Industry Context
      </h2>
      <p class="text-muted-foreground">{{ brand.industryContext }}</p>
    </div>

    <!-- Values -->
    <div v-if="brand.values" class="mb-12 lg:mb-16">
      <h2 class="mb-6 text-xl font-semibold tracking-tight">Core Values</h2>
      <p class="text-muted-foreground">{{ brand.values.join(" · ") }}</p>
    </div>

    <!-- Contact -->
    <div class="bg-muted rounded-2xl p-6 lg:p-8">
      <h2 class="mb-4 text-xl font-semibold tracking-tight">Contact</h2>
      <div class="text-muted-foreground space-y-2 text-sm">
        <p v-if="brand.website">
          Website:
          <a
            :href="brand.website"
            target="_blank"
            class="text-primary hover:underline"
            >{{ brand.website.replace("https://", "") }}</a
          >
        </p>
        <p v-if="brand.email">Email: {{ brand.email }}</p>
        <p v-if="brand.whatsapp">
          WhatsApp: +{{ brand.whatsapp.replace("62", "62 ") }}
        </p>
        <p v-if="brand.companyName">{{ brand.companyName }}</p>
      </div>
    </div>
  </div>

  <div v-else class="container py-10 lg:py-16">
    <p>Brand not found.</p>
  </div>
</template>

<script setup>
const route = useRoute();
const brandsStore = useBrandsStore();
const brand = brandsStore.getBrandBySlug(route.params.slug);

if (brand) {
  usePageMeta("", {
    title: brand.name,
    description: brand.shortDescription,
  });
}
</script>
