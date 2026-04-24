<template>
  <div class="container py-10 lg:py-16">
    <div class="mb-10 lg:mb-14">
      <h1 class="section-title">Our Brands</h1>
      <p class="section-description mt-4 max-w-2xl">
        From corporate events to exhibitions, from pop culture gatherings to
        industry trade shows. Each brand serves a different purpose, but all
        share the same commitment to creating meaningful experiences.
      </p>
    </div>

    <div class="space-y-10">
      <div v-for="category in categories" :key="category">
        <h2 class="text-muted-foreground mb-4 text-sm font-medium tracking-wide uppercase">
          {{ category }}
        </h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="brand in getBrandsByCategory(category)"
            :key="brand.slug"
            :to="`/brands/${brand.slug}`"
            class="bg-muted hover:bg-muted/70 group flex flex-col gap-y-2 rounded-2xl p-6 transition"
          >
            <h3 class="text-lg font-semibold tracking-tight">
              {{ brand.name }}
            </h3>
            <p class="text-muted-foreground text-sm">{{ brand.tagline }}</p>
            <p class="text-muted-foreground mt-2 text-sm leading-relaxed">
              {{ brand.shortDescription }}
            </p>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
usePageMeta("", {
  title: "Our Brands",
  description:
    "Explore Panorama Media's portfolio of brands - from corporate events and exhibitions to pop culture gatherings and industry trade shows.",
});

const brandsStore = useBrandsStore();
const categories = brandsStore.getAllCategories;
const getBrandsByCategory = brandsStore.getBrandsByCategory;
</script>
