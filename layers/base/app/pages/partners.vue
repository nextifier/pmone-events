<template>
  <div class="min-h-screen-offset space-y-10 pt-6 pb-16 lg:space-y-16">
    <Credits class="container-wider flex flex-col items-center text-center" />

    <section id="media" v-if="news?.length" class="container-wider">
      <div class="flex flex-col items-center text-center">
        <h1 class="section-title">{{ content.title }}</h1>

        <p class="mt-3 text-base tracking-tight text-pretty sm:text-lg">
          {{ content.description }}
        </p>
      </div>

      <div
        class="mt-8 grid w-full grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-x-2 gap-y-4 sm:gap-x-4"
      >
        <MediaCard v-for="(item, index) in news" :key="index" :item="item" />
      </div>
    </section>
  </div>
</template>

<script setup>
usePageMeta("partners");
const { data: mediaCoverageData } = await useMediaCoverages();
const news = computed(() => mediaCoverageData.value?.data ?? []);
const content = computed(() => useContentStore().components.mediaCoverage);
</script>
