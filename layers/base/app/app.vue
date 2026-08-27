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
      <ScrollToTop v-if="!hidesScrollToTop" />
      <!-- One cart bar for the whole ticket flow. Outside <NuxtLayout> so it
           survives /tickets -> /tickets/checkout instead of unmounting and
           remounting. -->
      <TicketsTicketCartBarHost v-if="showsCartBar" />
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

// `@nuxtjs/i18n` suffixes route names with `___<locale>` (`tickets___en`), so
// every comparison below is against the base name - the technique Header.vue,
// Rundown.vue and contentContract.ts already use.
const routeBaseName = computed(
  () => (route.name?.toString() ?? "").split("___")[0],
);

/**
 * The cart bar belongs to the two buying routes and nowhere else.
 *
 * It used to test `startsWith("tickets")`, which also matched every page a
 * visitor reaches AFTER buying: the saved e-ticket (`tickets-attendeeUlid`),
 * the order receipt (`tickets-order-token`) and the payment result
 * (`tickets-result`). Checkout clears the cart, but a visitor who browsed
 * tickets and then opened their e-ticket link still has one in storage - so a
 * "1 ticket selected / Checkout" bar sat on top of their own QR code. Match
 * the route exactly; new pages under /tickets now stay clean by default.
 */
const CART_BAR_ROUTES = ["tickets", "tickets-checkout"];

const showsCartBar = computed(() =>
  CART_BAR_ROUTES.includes(routeBaseName.value),
);

// Home and winner anchor their own UI to the bottom of the viewport, and on the
// buying routes the cart bar already occupies that corner. The post-purchase
// ticket pages get the button back - they are ordinary content pages, and it
// only appears past 1000px of scroll anyway.
const hidesScrollToTop = computed(
  () => ["index", "winner"].includes(routeBaseName.value) || showsCartBar.value,
);

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
