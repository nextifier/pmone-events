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
      <!-- One cart bar for the whole ticket flow. Outside <NuxtLayout> so it
           survives /tickets -> /tickets/checkout instead of unmounting and
           remounting; `startsWith('tickets')` covers both routes. -->
      <TicketsTicketCartBarHost
        v-if="route.name?.toString().startsWith('tickets')"
      />
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

// Opt-in per-project palette from app.config `appearance`. Injects
// <style id="appearance-vars"> into the SSR head; a no-op when disabled.
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
