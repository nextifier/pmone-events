<template>
  <section id="venue" class="section-padding bg-surface-1 relative overflow-hidden">
    <div class="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

    <div class="container-wide relative z-10">
      <div class="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <div class="relative order-2 lg:order-1">
          <div class="overflow-hidden rounded-3xl">
            <NuxtImg
              src="https://images.unsplash.com/photo-1584810359583-96fc3448beaa?w=800&q=80"
              alt="Yogyakarta, Indonesia"
              class="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>

          <div
            class="absolute -bottom-6 -right-6 rounded-2xl border border-border bg-card p-6 shadow-2xl md:-bottom-8 md:-right-8"
          >
            <div class="flex items-center gap-4">
              <div class="flex size-14 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Icon name="hugeicons:calendar-03" class="size-6" />
              </div>
              <div>
                <div class="font-display text-3xl text-foreground">{{ $t('venue.date') }}</div>
                <div class="text-muted-foreground">{{ $t('venue.year') }}</div>
              </div>
            </div>
          </div>

          <div class="absolute -left-16 -top-16 size-48 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div class="order-1 lg:order-2">
          <span class="badge-accent mb-8 inline-block">{{ $t('venue.badge') }}</span>

          <h2 class="text-display-sm text-foreground mb-6">
            {{ $t('venue.title') }}
            <span class="text-accent">{{ $t('venue.titleAccent') }}</span>
          </h2>

          <p class="text-body-lg mb-12">
            {{ $t('venue.description') }}
          </p>

          <div class="space-y-6">
            <div
              v-for="feature in venueFeatures"
              :key="feature.title"
              class="group flex items-start gap-5"
            >
              <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-accent transition-all duration-500 group-hover:bg-accent group-hover:text-accent-foreground">
                <Icon :name="feature.icon" class="size-5" />
              </div>
              <div>
                <h3 class="font-display text-lg text-foreground mb-1">
                  {{ feature.title }}
                </h3>
                <p class="text-body leading-relaxed">
                  {{ feature.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const { t } = useI18n();

const venueFeatures = computed(() => [
  {
    icon: "hugeicons:airplane-01",
    title: t('venue.features.easyAccess.title'),
    description: t('venue.features.easyAccess.description'),
  },
  {
    icon: "hugeicons:building-06",
    title: t('venue.features.culturalHeritage.title'),
    description: t('venue.features.culturalHeritage.description'),
  },
  {
    icon: "hugeicons:restaurant-01",
    title: t('venue.features.hospitality.title'),
    description: t('venue.features.hospitality.description'),
  },
]);
</script>
