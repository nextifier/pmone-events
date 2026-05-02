<template>
  <Html>
    <NuxtPwaManifest />
    <Body
      class="bg-background text-body font-sans text-sm antialiased sm:text-base"
    >
      <NuxtLoadingIndicator :color="false" class="bg-accent" />
      <NuxtLayout>
        <NuxtPage
          :page-key="stripLocaleFromPath"
          :keepalive="{
            include: ['brands', 'rundown', 'news', 'ticket'],
          }"
        />
      </NuxtLayout>
      <ScrollToTop v-if="!['index', 'ticket'].some((n) => route.name?.toString().startsWith(n))" />
      <Toaster class="pointer-events-auto" />
    </Body>
  </Html>
</template>

<script setup>
import "vue-sonner/style.css";
const route = useRoute();
const { locales } = useI18n();

const localeCodes = computed(() => locales.value.map((l) => l.code));

function stripLocaleFromPath(routeObj) {
  const match = routeObj.path.match(/^\/([^/]+)(\/.*|\/?$)/);
  if (match && localeCodes.value.includes(match[1])) {
    return match[2] || "/";
  }
  return routeObj.path;
}

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
