<template>
  <div class="space-y-16 pb-16 lg:space-y-24 lg:pb-24">
    <Hero v-if="heroVisible" />
    <LazyAboutEvent v-if="aboutEventVisible" />
    <LazyPartnerships v-if="partnershipsVisible" />
    <LazyMediaCoveragesSlider v-if="mediaCoveragesSliderVisible" />
    <LazyBlogPostSlider
      v-if="blogPostSliderVisible"
      :headline="useContentStore().components.postSlider.title.default"
    />
  </div>
</template>

<script setup>
usePageMeta("home");
const { visible: heroVisible } = useHomeSection("hero", { defaultVisible: true });
const { visible: aboutEventVisible } = useHomeSection("about_event", {
  defaultVisible: true,
});
const { visible: partnershipsVisible } = useHomeSection("partnerships", {
  defaultVisible: true,
});
const { visible: mediaCoveragesSliderVisible } = useHomeSection(
  "media_coverages_slider",
  { defaultVisible: true },
);
const { visible: blogPostSliderVisible } = useHomeSection("blog_post_slider", {
  defaultVisible: true,
});
</script>
