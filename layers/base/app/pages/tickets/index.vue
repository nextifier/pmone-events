<template>
  <!-- Nothing to sell yet (ticketing disabled or an empty listing): a focused
       coming-soon page instead of the full shell. Invite links and previously
       applied access codes bypass this so hidden tickets stay reachable. -->
  <div v-if="showComingSoon" class="min-h-screen-offset pt-4 pb-16 lg:pt-10 lg:pb-24">
    <div class="container flex flex-col items-center">
      <div class="flex flex-col items-center text-center">
        <h1 class="section-title">{{ title }}</h1>
        <p
          v-if="description"
          class="mt-3 max-w-2xl text-base tracking-tight text-pretty sm:text-lg"
        >
          {{ description }}
        </p>
      </div>

      <EmptyState
        class="mt-10"
        :title="t('tickets.unavailableTitle')"
        :description="t('tickets.unavailableDescription')"
      >
        <template #image>
          <TicketListEmptyStateImage />
        </template>
        <template #actions>
          <Button v-if="instagramUrl" as-child variant="outline">
            <NuxtLink :to="instagramUrl" target="_blank" rel="noopener">
              <Icon name="hugeicons:instagram" class="size-4 shrink-0" />
              {{ t("ui.followInstagram") }}
            </NuxtLink>
          </Button>
          <Button as-child>
            <NuxtLink :to="localePath('/')">
              {{ t("ui.backToHome") }}
            </NuxtLink>
          </Button>
        </template>
      </EmptyState>
    </div>
  </div>

  <div v-else id="ticket-page" class="pb-16 lg:pt-6 lg:pb-20">
    <div
      class="grid grid-cols-1 gap-4 sm:container sm:max-w-5xl lg:grid-cols-12 lg:gap-10"
    >
      <div v-if="event.posterImage" class="px-1 sm:px-0 lg:col-span-5">
        <Lightbox
          :items="posterItems"
          :show-thumbnails="false"
          full-key="xl"
          :alt="event.title"
        >
          <template #trigger="{ openAt }">
            <div
              class="bg-muted relative isolate aspect-4/5 w-full overflow-hidden rounded-xl sm:rounded-2xl"
            >
              <button
                v-if="event.posterImage"
                type="button"
                class="absolute inset-0 z-10 cursor-zoom-in"
                :aria-label="t('ui.viewPoster')"
                @click="openAt(0)"
              >
                <BlurImage
                  :src="
                    event.posterImage.lg ||
                    event.posterImage.md ||
                    event.posterImage.url
                  "
                  :lqip="event.posterImage.lqip || ''"
                  :alt="event.title"
                  image-class="size-full object-cover select-none outline-inside rounded-xl sm:rounded-2xl"
                />
              </button>

              <div
                v-if="event.teaserVideoId"
                class="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full backdrop-blur-sm transition delay-1000 duration-800 ease-out starting:scale-0 starting:opacity-0"
              >
                <button
                  type="button"
                  :aria-label="t('ui.watchTeaser')"
                  class="flex size-16 items-center justify-center rounded-full bg-white/30 text-white shadow-xl outline -outline-offset-6 outline-white transition hover:bg-white/60 active:scale-98"
                  @click="
                    uiStore.openEmbedVideoDialog(
                      `https://www.youtube.com/embed/${event.teaserVideoId}`,
                    )
                  "
                  v-ripple
                >
                  <Icon
                    name="material-symbols:play-arrow-rounded"
                    class="size-8 shrink-0"
                  />
                </button>
              </div>
            </div>
          </template>
        </Lightbox>
      </div>

      <div
        class="px-4 sm:px-0 lg:pt-6"
        :class="
          event.posterImage
            ? 'lg:col-span-7'
            : 'mx-auto w-full lg:col-span-12 lg:max-w-2xl'
        "
      >
        <div class="flex flex-col">
          <div class="flex items-center justify-between">
            <EventStatus
              :class="event.startTime ? 'h-10' : ''"
              :startTime="new Date(event.startTime)"
              :endTime="new Date(event.endTime)"
            />

            <DialogShare :pageTitle="title" />
          </div>

          <h1
            class="text-foreground mt-1 text-3xl leading-[1.25] font-semibold tracking-tighter sm:mt-2 sm:text-4xl xl:text-5xl"
          >
            {{ event.title }}
          </h1>

          <div class="mt-2.5 flex flex-col gap-y-2.5 sm:mt-1.5 sm:gap-y-3">
            <div v-if="event.edition?.value" class="flex">
              <span
                class="text-foreground bg-muted rounded-full px-3 py-1.5 text-sm tracking-tight"
                >{{ event.edition.value
                }}<span class="align-super text-[10px]">{{
                  event.edition.ordinal
                }}</span>
                {{ t("ui.edition") }}</span
              >
            </div>

            <InConjunction />
          </div>

          <WhenAndWhere
            v-if="event.date || event.location || event.hall"
            class="mt-5"
            :date="event.date"
            :time="event.time"
            :location="event.location"
            :locationLink="event.locationLink"
            :hall="event.hall"
          />
        </div>
      </div>
    </div>

    <Tabs
      ref="tabsRootRef"
      variant="underline"
      v-model="activeTab"
      default-value="tickets"
      class="scroll-mt-navbar mt-8 flex w-full flex-col"
    >
      <div
        class="bg-background/95 supports-backdrop-filter:bg-background/90 sticky inset-x-0 top-(--navbar-height-mobile) isolate z-40 lg:top-(--navbar-height-desktop)"
      >
        <TabsList
          class="scroll-fade-x no-scrollbar flex h-(--navbar-height-mobile) w-full items-center justify-center-safe overflow-x-auto px-4 backdrop-blur-sm sm:px-0 lg:h-(--navbar-height-desktop)"
        >
          <TabsIndicator />

          <TabsTrigger
            v-for="tab in tabList"
            :key="tab.value"
            :value="tab.value"
            @click="scrollToTabsRootTop"
            class="shrink-0 rounded-lg"
          >
            <Icon :name="tab.iconName" class="size-4 shrink-0" />
            <span>{{ tab.name }}</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent
        v-for="tab in tabList"
        :key="tab.value"
        :ref="(el) => (tabContentRefs[tab.value] = el)"
        :value="tab.value"
        :forceMount="tab.forceMount"
        tabindex="-1"
        class="min-h-[calc(100dvh-var(--navbar-height-mobile)*2)] outline-hidden data-[state=inactive]:hidden"
        :class="{
          'pt-6 sm:pt-8': tab.withPadding,
        }"
      >
        <component
          v-if="activatedTabs[tab.value]"
          :is="tab.component"
          v-bind="tab.props"
        />
      </TabsContent>
    </Tabs>

    <!-- <div
      class="xs:right-[calc(var(--spacing)*4+var(--scrollbar-width,0px))] fixed right-[calc(var(--spacing)*3+var(--scrollbar-width,0px))] bottom-8 z-50 hidden sm:right-[calc(var(--spacing)*6+var(--scrollbar-width,0px))] sm:bottom-5 lg:bottom-12 lg:block xl:right-[calc(var(--spacing)*12+var(--scrollbar-width,0px))]"
    >
      <Transition
        enter-active-class="transition duration-300 ease-out"
        leave-active-class="transition duration-300 ease-in"
        enter-from-class="translate-y-full opacity-0"
        leave-to-class="translate-y-full opacity-0"
      >
        <button
          v-if="!isTabTicketsVisible"
          type="button"
          @click="scrollToTabsRootTop(_, 'tickets')"
          class="text-primary border-primary/20 bg-background/50 pointer-fine:hover:bg-primary pointer-fine:hover:text-primary-foreground flex items-center justify-center gap-x-1.5 rounded-full border px-3 py-2 text-sm font-semibold tracking-tighter backdrop-blur-md transition-all duration-300"
          v-ripple
        >
          <Icon
            v-if="activeTab !== 'tickets'"
            name="lucide:chevrons-left"
            class="size-4.5 shrink-0"
          />
          <span>{{ t("tickets.chooseTicket") }}</span>
          <Icon
            v-if="activeTab === 'tickets'"
            name="lucide:chevrons-down"
            class="size-4.5 shrink-0"
          />
        </button>
      </Transition>
    </div> -->
  </div>
</template>

<script setup>
import { useIntersectionObserver } from "@vueuse/core";
import { useTicketCartStore } from "../../stores/ticketCart";

const { title, description } = usePageMeta("ticket");
defineOptions({
  name: "ticket",
});

const { t } = useI18n();
const event = useEvent();
const uiStore = useUiStore();
const route = useRoute();
const localePath = useLocalePath();
const cart = useTicketCartStore();

// Wait for the event payload first: `useEvent()` does not await its own fetch,
// so `event.slug` is still "" on the next line and the listing would request
// `/api/tickets/` (no slug). That 404 falls through to the SSR renderer and
// leaves `ticketsDisabled` / `showComingSoon` reading an error that has nothing
// to do with ticketing. Shares the `active-event` asyncData entry — no extra
// request.
await useEventData();

const {
  data: ticketsData,
  error: ticketsError,
  refresh: refreshTickets,
} = await useTicketsListing(() => event.slug);

// This page is prerendered, so the SSR payload is a build-time snapshot — and
// `on_sale` / `sales_status` / `available` are computed server-side against
// `now()`, not derived in the browser from raw timestamps. Left alone, a sale
// that opened after the build would keep showing "coming soon" until the next
// deploy, and a closed one would keep taking orders that then 422 at checkout.
//
// So: paint the static HTML instantly, then re-fetch once hydration is DONE.
//
// `onMounted` is too early and silently did nothing. Nuxt's asyncData `execute`
// still consults `getCachedData` whenever `nuxtApp.isHydrating` is true — manual
// refreshes included — and `isHydrating` is still true inside a page's mounted
// hook, because NuxtLayout only releases hydration a tick later. So
// `ticketsListingCachedData` handed the build-time payload straight back and no
// request ever left the browser: prices, `on_sale` and `sales_status` stayed
// frozen at build time for every visitor. `onNuxtReady` runs after hydration
// settles, which is the same wait `refreshNuxtData` performs internally.
//
// Costs one small JSON request per visitor — roughly a tenth of the CPU of
// rendering this page server-side — and leaves the data as fresh as the SSR
// site was (the API caches it 5 minutes).
onNuxtReady(() => {
  refreshTickets();
});

// Returning to a cached page must re-ask too: a visitor who opens /tickets,
// browses away and comes back would otherwise keep the snapshot from their
// first visit. Skipped on the first activation, which onNuxtReady already
// covers.
let activatedBefore = false;
onActivated(() => {
  if (activatedBefore) {
    refreshTickets();
  }
  activatedBefore = true;
});

// A 404 with this code means the organizer has not enabled ticketing yet,
// rendered as a full-page "coming soon" instead of the regular ticket shell.
const ticketsDisabled = computed(() => {
  const body = ticketsError.value?.data;
  return (
    body?.error_code === "TICKETS_DISABLED" ||
    body?.data?.error_code === "TICKETS_DISABLED"
  );
});

const instagramUrl = useInstagramUrl();

// Hidden tickets are reached via an invite link (?invite= / ?code=) or a
// previously applied access code persisted in the cart, all of which must
// reach <TicketList> instead of the coming-soon state.
onMounted(() => {
  cart.hydrate();
});

// Ticket poster: display a smaller conversion (lg) for fast load; the Lightbox
// shows the larger xl version. Sourced from PM One (already optimized), so no
// NuxtImg/Cloudflare re-optimization.
const posterItems = computed(() => {
  const p = event.posterImage;
  if (!p) return [];
  return [
    {
      sm: p.md || p.url,
      md: p.md || p.url,
      lg: p.lg || p.url,
      xl: p.xl || p.lg || p.url,
      url: p.url,
      lqip: p.lqip,
      alt: event.title,
    },
  ];
});

const tabsRootRef = ref(null);
const isTabTicketsVisible = ref(true);
const activeTab = ref("tickets");

const tabContentRefs = ref({});
const tabTicketsRef = computed(() => tabContentRefs.value["tickets"]);

const activatedTabs = ref({
  tickets: true,
});

watch(activeTab, (newTabValue) => {
  if (newTabValue && !activatedTabs.value[newTabValue]) {
    activatedTabs.value[newTabValue] = true;
  }
});

useIntersectionObserver(
  tabTicketsRef,
  ([{ isIntersecting }]) => {
    isTabTicketsVisible.value = isIntersecting;
  },
  {
    rootMargin: "0px 0px -420px 0px",
    threshold: 0,
  },
);

import {
  LazyGuestList,
  LazyBrandList,
  LazyRundown,
  LazyAboutEvent as AboutEvent,
  LazyGallery,
} from "#components";
// Ticket list, sourced entirely from PM One's public ticket API. There is no
// static fallback: on failure or when ticketing is disabled it shows a clear
// error/empty state instead of fabricated ticket data.
import TicketList from "../../components/tickets/TicketList.vue";

// Ticket tabs visibility now comes from PM One (website settings).
const projectSettings = useProjectSettings();
const tabSettings = computed(() => projectSettings.ticketTabs);

/**
 * The event header is worth showing on its own when the active event carries
 * real details (date, venue, or poster). The full-page coming-soon state is
 * reserved for placeholder events with none of those - a real event with
 * unopened ticket sales keeps the regular shell, and <TicketList> shows its
 * own in-tab empty state.
 */
const eventHasDetails = computed(() =>
  Boolean(
    event.startTime || event.location || event.hall || event.posterImage,
  ),
);

const showComingSoon = computed(
  () =>
    tabSettings.value.showTickets &&
    !eventHasDetails.value &&
    !route.query.invite &&
    !route.query.code &&
    !cart.accessCode &&
    (ticketsDisabled.value ||
      (!ticketsError.value && !ticketsData.value?.data?.length)),
);

const tabList = computed(() => {
  const tabs = [];

  if (tabSettings.value.showTickets) {
    tabs.push({
      name: t("tickets.tabs.tickets"),
      value: "tickets",
      iconName: "hugeicons:ticket-01",
      forceMount: true,
      withPadding: true,
      component: TicketList,
      props: { eventSlug: event.slug },
    });
  }
  if (tabSettings.value.showGuests) {
    tabs.push({
      name: t("tickets.tabs.guests"),
      value: "guests",
      iconName: "hugeicons:star",
      forceMount: true,
      withPadding: true,
      component: LazyGuestList,
      props: {},
    });
  }
  if (tabSettings.value.showBrands) {
    tabs.push({
      name: t("tickets.tabs.brands"),
      value: "brands",
      iconName: "hugeicons:grid-view",
      forceMount: true,
      withPadding: true,
      component: LazyBrandList,
      props: {},
    });
  }
  if (tabSettings.value.showRundown) {
    tabs.push({
      name: t("tickets.tabs.rundown"),
      value: "rundown",
      iconName: "hugeicons:check-list",
      forceMount: true,
      withPadding: true,
      component: LazyRundown,
      props: {},
    });
  }
  if (tabSettings.value.showAbout) {
    tabs.push({
      name: t("tickets.tabs.about"),
      value: "about",
      iconName: "hugeicons:information-circle",
      forceMount: false,
      withPadding: false,
      component: AboutEvent,
      props: {},
    });
  }
  if (tabSettings.value.showPhotos) {
    tabs.push({
      name: t("tickets.tabs.photos"),
      value: "photos",
      iconName: "hugeicons:image-01",
      forceMount: false,
      withPadding: false,
      component: LazyGallery,
      props: {},
    });
  }

  return tabs;
});

const scrollToTabsRootTop = async (event, newActiveTabValue) => {
  if (newActiveTabValue) {
    activeTab.value = newActiveTabValue;
  }

  await nextTick();

  const el = tabsRootRef.value?.$el;
  if (!el) return;

  // Tab Brands memuat konten secara async sehingga tinggi dokumen melonjak. Bila
  // smooth-scroll berjalan saat itu, animasinya terganggu reflow lalu overshoot
  // dan berhenti tidak di atas tab. Maka khusus Brands: tunggu sampai tinggi
  // dokumen BENAR-BENAR stabil (lewati fase skeleton pra-data yang sempat
  // "stabil"), baru smooth-scroll SEKALI. Tab lain langsung smooth-scroll.
  if (typeof window !== "undefined" && activeTab.value === "brands") {
    let lastHeight = -1;
    let stableTicks = 0;
    const start = Date.now();
    const scrollWhenStable = () => {
      const h = document.documentElement.scrollHeight;
      stableTicks = h === lastHeight ? stableTicks + 1 : 0;
      lastHeight = h;
      const elapsed = Date.now() - start;
      // butuh 4 tick sama (~200ms tanpa perubahan) DAN minimal 450ms terlewati
      // supaya tidak ter-trigger oleh skeleton yang stabil sebelum data datang.
      if ((stableTicks >= 4 && elapsed >= 450) || elapsed > 1600) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        setTimeout(scrollWhenStable, 50);
      }
    };
    scrollWhenStable();
    return;
  }

  el.scrollIntoView({ behavior: "smooth", block: "start" });
};
</script>
