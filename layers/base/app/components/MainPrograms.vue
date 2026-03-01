<template>
  <section
    id="main-programs"
    v-if="content.list?.length"
    class="overflow-hidden"
  >
    <div class="container">
      <div ref="containerRef" class="flex flex-col items-center text-center">
        <h2
          class="section-title-large text-primary relative isolate !leading-[1] font-semibold tracking-tighter text-balance"
          v-html="content.title"
        ></h2>

        <p class="section-description mt-4">
          {{ content.description }}
        </p>
      </div>
    </div>

    <div v-if="['programs'].includes(route.name)" class="container mt-10">
      <div
        class="grid gap-x-2 gap-y-3 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] sm:gap-y-8"
        :class="content.list[0].image ? 'grid-cols-2' : 'grid-cols-1'"
      >
        <MainProgramCard
          v-for="(program, index) in content.list"
          :key="index"
          :program="program"
        />
      </div>
    </div>

    <MainProgramSlider v-else class="mt-10" :programs="content.list" />
  </section>
</template>

<script setup>
const route = useRoute();
const content = computed(() => useContentStore().components.mainPrograms);
</script>
