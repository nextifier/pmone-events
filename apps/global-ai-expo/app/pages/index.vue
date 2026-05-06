<template>
  <div class="space-y-16 overflow-hidden pb-16 lg:space-y-24 lg:pb-24">
    <Hero />
    <LazySpeakers class="pt-8" />
    <LazyBrandPreview v-if="brandPreviewVisible" />
    <LazyRundown v-if="rundownVisible" />
    <LazyAboutEvent />
    <LazyPartnerships />
    <LazyVisitorCta />
    <LazyCredits class="container flex flex-col items-center text-center" />
    <RollingText
      text="Global AI Expo"
      :lines="4"
      :duration="2.5"
      :stagger="0.2"
      :line-offset="1.2"
    />
    <LazyBlogPostSlider
      :headline="useContentStore().components.postSlider.title.default"
    />
    <LazyFAQ tag="h2" />
    <FAB />

    <!-- <div class="fixed inset-x-0 bottom-8 flex items-center justify-center">
      <div
        class="bg-primary text-primary-foreground no-scrollbar scroll-fade-x flex min-w-fit gap-1 overflow-x-auto rounded-full p-1"
      >
        <NuxtLink
          to="/brand-guidelines"
          class="bg-background/10 border-background/25 hover:bg-background/20 flex shrink-0 items-center gap-x-1 rounded-full border px-3 py-2 text-sm font-semibold tracking-tighter active:scale-98 sm:text-base"
        >
          <Icon
            name="hugeicons:pen-tool-03"
            class="size-4 shrink-0 sm:size-5"
          />
          Brand Guidelines</NuxtLink
        >
        <NuxtLink
          to="/quotation"
          class="bg-background/10 border-background/25 hover:bg-background/20 flex shrink-0 items-center gap-x-1 rounded-full border px-3 py-2 text-sm font-semibold tracking-tighter active:scale-98 sm:text-base"
        >
          <Icon name="hugeicons:invoice-04" class="size-4 shrink-0 sm:size-5" />
          Quotation</NuxtLink
        >
      </div>
    </div> -->
  </div>
</template>

<script setup>
usePageMeta("home");
useEventSchema();
const { visible: rundownVisible } = useRundownVisibility();
const { visible: brandPreviewVisible } = useBrandPreviewVisibility();
</script>
