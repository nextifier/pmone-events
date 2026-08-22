<script setup>
import TicketCartBar from "./TicketCartBar.vue";
import { useTicketCartStore } from "../../stores/ticketCart";
import { computed, onMounted } from "vue";

/**
 * Owns the single sticky cart bar for the whole ticket flow.
 *
 * Mounted in `app.vue` beside `ScrollToTop`, outside `<NuxtLayout>`, so it stays
 * mounted across /tickets -> /tickets/checkout. Previously each page rendered its
 * own `<TicketCartBar>`, so every hop played a leave transition and an enter
 * transition and reset the expanded state.
 *
 * Mode comes from the route, not from a prop: `select` while the buyer is still
 * choosing, `pay` once they are on checkout. The pay-mode action arrives through
 * `useTicketCheckoutBar()`, which checkout.vue publishes.
 */
const route = useRoute();
const localePath = useLocalePath();
const cart = useTicketCartStore();
const checkoutBar = useTicketCheckoutBar();

// i18n suffixes route names (`tickets-checkout___en`), so match on the prefix -
// the same technique app.vue and Header.vue already use.
const isCheckout = computed(() =>
  (route.name?.toString() ?? "").startsWith("tickets-checkout"),
);
const mode = computed(() => (isCheckout.value ? "pay" : "select"));

// `useEvent()` never awaits its own fetch, so without this the slug is still ""
// and the ticket URL below is built from empty defaults. Shares the `active-event`
// asyncData entry, so awaiting costs nothing.
await useEventData();
const event = useEvent();

// The persisted cart may carry a slug from an earlier session; both ticket pages
// resolve it this way and document why.
const eventSlug = computed(() => cart.eventSlug || event.slug);

// Same key + options as the pages, so Nuxt dedupes into one asyncData entry
// instead of adding a request.
const { data: ticketsData } = await useTicketsListing(eventSlug);

const ticketsById = computed(() => {
  const map = {};
  for (const ticket of ticketsData.value?.data ?? []) map[ticket.id] = ticket;
  return map;
});

onMounted(() => {
  cart.hydrate();
});

const ctaLabel = computed(() =>
  isCheckout.value ? checkoutBar.value.ctaLabel : "",
);
// Pay-mode glyph only; the bar keeps the select-mode cart icon stacked beside it.
const ctaIcon = computed(() => checkoutBar.value.ctaIcon);

function onPrimary() {
  if (!isCheckout.value) {
    if (cart.isEmpty) return;
    cart.setEventContext({ eventId: event.id, eventSlug: eventSlug.value });
    navigateTo(localePath("/tickets/checkout"));
    return;
  }
  requestTicketCheckoutPrimary();
}
</script>

<template>
  <TicketCartBar
    :mode="mode"
    :tickets-by-id="ticketsById"
    :cta-label="ctaLabel"
    :cta-icon="ctaIcon"
    :cta-disabled="isCheckout && checkoutBar.ctaDisabled"
    :submitting="isCheckout && checkoutBar.submitting"
    :hide-while-typing="isCheckout"
    @primary="onPrimary"
  />
</template>
