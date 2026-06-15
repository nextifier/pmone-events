<template>
  <div
    v-if="items.length"
    class="relative inline-flex h-8 items-center justify-start overflow-hidden rounded-full px-3 py-1 font-semibold tracking-tighter transition active:scale-95"
  >
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      leave-active-class="transition-all duration-500 ease-out absolute"
      enter-from-class="opacity-0 translate-y-full"
      leave-to-class="opacity-0 -translate-y-full"
    >
      <nuxt-link
        :key="currentItem.text"
        :to="currentItem.link"
        :target="currentItem.link.startsWith('http') ? '_blank' : ''"
        class="flex items-center justify-start gap-x-1 text-left whitespace-nowrap"
        @click="trackClick(currentItem.id, currentItem.text || 'announcement')"
      >
        <span class="line-clamp-1">
          {{ currentItem.text }}
        </span>
        <Icon name="lucide:arrow-right" class="size-4 shrink-0" />
      </nuxt-link>
    </Transition>
  </div>
</template>

<script setup>
const { trackImpression, trackClick } = useBannerTracking();

// Hero CTA strip now comes from PM One (ProjectBanner, placement=hero-announcement)
// instead of the hardcoded content.js array. Mapped to the legacy {text, link} shape.
const { data: bannersData } = await useFetch("/api/banners", {
  key: "hero-announcement-banners",
  query: { placement: "hero-announcement" },
  default: () => ({ data: [] }),
});

const items = computed(() =>
  (bannersData.value?.data ?? []).map((b) => ({
    id: b.id,
    text: b.subHeadline || b.cta?.label || "",
    link: b.cta?.link || "#",
  })),
);

const currentIndex = ref(0);
let intervalId = null;

const currentItem = computed(() => items.value[currentIndex.value]);

// Count an impression for each announcement as it rotates into view (deduped
// per id per page load by useBannerTracking). The strip sits above the hero so
// it is always in view on load.
watch(currentItem, (item) => trackImpression(item?.id), { immediate: true });

onMounted(() => {
  if (items.value.length <= 1) return;

  intervalId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % items.value.length;
  }, 6000);
});

onUnmounted(() => {
  clearInterval(intervalId);
});
</script>
