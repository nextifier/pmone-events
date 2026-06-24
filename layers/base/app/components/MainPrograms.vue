<template>
  <section
    id="main-programs"
    v-if="list.length"
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

        <FallbackNotice v-if="fallbackSource" :source="fallbackSource" class="mt-6" />
      </div>
    </div>

    <div v-if="route.name?.toString().startsWith('programs')" class="container mt-10">
      <div
        class="grid gap-x-2 gap-y-3 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] sm:gap-y-8"
        :class="list[0].image ? 'grid-cols-2' : 'grid-cols-1'"
      >
        <MainProgramCard
          v-for="(program, index) in list"
          :key="index"
          :program="program"
        />
      </div>
    </div>

    <MainProgramSlider v-else class="mt-10" :programs="list" />
  </section>
</template>

<script setup>
const route = useRoute();
const { locale } = useI18n();

const content = computed(() => useContentStore().components.mainPrograms);

// Program items are managed in PM One and fetched per active event + locale.
// The section heading (title/description) still comes from i18n.
const { data: programsData } = await useFetch("/api/event/programs", {
  query: { locale },
  watch: [locale],
  default: () => ({ data: [] }),
});

const list = computed(() => programsData.value?.data ?? []);

// Source edition when the programs were borrowed from a previous event.
const fallbackSource = computed(() => {
  const fb = programsData.value?.meta?.fallback;
  return fb?.is_fallback ? fb.source_event : null;
});
</script>
