<template>
  <section class="container">
    <div class="flex flex-col items-center text-center">
      <h2
        class="inline gap-2.5 text-6xl leading-[0.8]! font-semibold tracking-[-0.07em] sm:text-9xl lg:text-[13rem]"
      >
        <span class="text-outline">Our</span>
        <span class="text-gradient-accent pr-1 lg:pr-2"> Brands</span>
      </h2>
      <p class="section-description mt-4 lg:mt-8">
        Whether you need to inspire your team, showcase your industry, or
        celebrate your passion, we create the experiences that make it happen.
      </p>
    </div>

    <div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="brand in brands"
        :key="brand.slug"
        :to="`/brands/${brand.slug}`"
        class="bg-muted hover:bg-muted/70 group flex flex-col gap-y-3 rounded-2xl p-6 transition"
      >
        <span
          class="text-muted-foreground text-xs font-medium tracking-wide uppercase"
        >
          {{ brand.category }}
        </span>
        <h3 class="text-lg font-semibold tracking-tight">{{ brand.name }}</h3>
        <p class="text-muted-foreground text-sm leading-relaxed">
          {{ brand.tagline }}
        </p>
      </NuxtLink>
    </div>

    <div class="mt-8 flex justify-center">
      <NuxtLink
        to="/brands"
        class="text-muted-foreground hover:text-primary text-sm font-medium transition"
      >
        View all brands
      </NuxtLink>
    </div>
  </section>
</template>

<script setup>
const brandsStore = useBrandsStore();
const brands = brandsStore.brands;
</script>
