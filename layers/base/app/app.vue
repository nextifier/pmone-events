<template>
  <Html>
    <Body
      class="bg-background text-body font-sans text-sm antialiased sm:text-base"
    >
      <NuxtLoadingIndicator :color="false" class="bg-accent" />
      <NuxtLayout>
        <NuxtPage
          :keepalive="{
            include: ['brands', 'rundown', 'news', 'ticket'],
          }"
        />
      </NuxtLayout>
      <ScrollToTop v-if="!['index', 'ticket'].includes(route.name)" />
      <Toaster class="pointer-events-auto" />
    </Body>
  </Html>
</template>

<script setup>
import "vue-sonner/style.css";
const route = useRoute();

const i18nHead = useLocaleHead({ dir: true, lang: true, seo: true });
useHead(() => ({
  htmlAttrs: i18nHead.value.htmlAttrs,
  link: i18nHead.value.link,
  meta: i18nHead.value.meta,
}));

onMounted(() => {
  useNuxtApp().$updateMetaThemeColor();
});
</script>
