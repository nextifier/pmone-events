<template>
  <div class="space-y-16 pb-16 lg:space-y-24 lg:pb-24">
    <MegapropertyMegaPropertyHero />
    <LazyMegapropertyMegaPropertyAbout />
    <LazyFactsAndFigures />
    <LazyMegapropertyMegaPropertyExpect />
    <LazyMegapropertyMegaPropertyExhibitors />
    <LazyMegapropertyMegaPropertyVisitors />
    <LazyMegapropertyMegaPropertyWhyExhibit />
    <LazyMegapropertyMegaPropertyCta />
  </div>
</template>

<script setup>
const { t } = useI18n();

useSeoMeta({
  title: t("megaProperty.meta.title"),
  description: t("megaProperty.meta.description"),
  ogTitle: t("megaProperty.meta.ogTitle"),
  ogDescription: t("megaProperty.meta.ogDescription"),
  ogImage: "/img/megaproperty/og-image.jpg",
  twitterCard: "summary_large_image",
});
</script>
