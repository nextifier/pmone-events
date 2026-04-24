<template>
  <div class="space-y-16 pb-16 lg:space-y-24 lg:pb-24">
    <Hero />
    <TrustedBy />
    <LazySolution />
    <LazyHowWeWork />
    <Services />
    <WhyChooseUs />
    <LazyEventPreview />
    <Testimonials />
    <LazyCta />
    <LazyBlogPostSlider
      :headline="useContentStore().components.postSlider.title.default"
    />
    <FAB />
  </div>
</template>

<script setup>
usePageMeta("home");
</script>
