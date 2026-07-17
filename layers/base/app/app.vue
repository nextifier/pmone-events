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
      <ScrollToTop v-if="!['index', 'tickets', 'winner'].some((n) => route.name?.toString().startsWith(n))" />
      <Toaster class="pointer-events-auto" />
    </Body>
  </Html>
</template>

<script setup>
import "vue-sonner/style.css";

// Single source of truth for theming (color mode + cn-* Style + tokens).
// Self-registers the SSR <body class="style-X"> + theme-color meta (cookie-backed
// → first paint already correct, no flash).
useAppearance();

// Dashboard-managed per-project palette (site_config.appearance). Read here at
// component-setup — after the projectSettings plugin resolved the payload on
// SSR / after hydration on the client — so it sees the real value; a plugin
// read snapshots null. Injects <style id="appearance-vars"> into the SSR head.
useProjectAppearance();

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
</script>
