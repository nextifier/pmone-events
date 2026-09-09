<template>
  <!-- Nothing to sell yet (ticketing disabled or an empty listing): a focused
       coming-soon page instead of the full shell. Invite links and previously
       applied access codes bypass this so hidden tickets stay reachable. -->
  <div
    v-if="showComingSoon"
    class="min-h-screen-offset pt-4 pb-16 lg:pt-10 lg:pb-24"
  >
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

  <!-- overflow-x-clip: the tilting poster below projects ~15px past its layout
       box, which is off-screen on narrow viewports but still lengthens the
       document and raises a horizontal scrollbar. `clip` (not `hidden`) drops
       it without turning the page into a scroll container, so the sticky tab
       bar keeps sticking.

       Header layout: one DOM for every breakpoint.
       - lg+: poster (5 cols) beside the text column (7 cols).
       - md–lg: poster 2/5, text column 3/5.
       - below md: the text column's wrappers go `display: contents` and each
         item is placed by hand (see `SPLIT`): countdown, title, edition and
         the co-located events in column 2 beside the poster (rows 2-5), then
         when/where across both columns. Rows 1 and 6 are `1fr` spacers that
         split the poster's spare height, so the column sits vertically
         centred against it. Without a poster none of that applies and the
         column simply flows. -->
  <div
    v-else
    id="ticket-page"
    class="overflow-x-clip pt-4 pb-16 lg:pt-6 lg:pb-20"
  >
    <div
      class="grid grid-cols-1 gap-4 px-4 sm:container sm:max-w-5xl lg:grid-cols-12 lg:gap-10"
      :class="split.grid"
    >
      <div v-if="hasPoster" class="lg:col-span-5" :class="split.poster">
        <Lightbox
          :items="posterItems"
          :show-thumbnails="false"
          full-key="xl"
          :alt="event.title"
        >
          <template #trigger="{ openAt }">
            <TiltCard
              class="bg-muted relative isolate aspect-4/5 w-full overflow-hidden rounded-xl sm:rounded-2xl"
            >
              <button
                type="button"
                class="absolute inset-0 z-10 cursor-zoom-in"
                :aria-label="t('ui.viewPoster')"
                @click="openAt(0)"
              >
                <BlurImage
                  :src="posterSrc"
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
                  class="flex size-12 items-center justify-center rounded-full bg-white/30 text-white shadow-xl outline -outline-offset-6 outline-white transition hover:bg-white/60 active:scale-98 lg:size-16"
                  @click="
                    uiStore.openEmbedVideoDialog(
                      `https://www.youtube.com/embed/${event.teaserVideoId}`,
                    )
                  "
                  v-ripple
                >
                  <Icon
                    name="material-symbols:play-arrow-rounded"
                    class="size-6 shrink-0 lg:size-8"
                  />
                </button>
              </div>
            </TiltCard>
          </template>
        </Lightbox>
      </div>

      <div
        class="lg:pt-6"
        :class="
          hasPoster
            ? [split.contents, 'lg:col-span-7']
            : 'mx-auto w-full lg:col-span-12 lg:max-w-2xl'
        "
      >
        <div class="flex flex-col" :class="split.contents">
          <div
            class="flex items-center justify-between gap-x-2"
            :class="split.contents"
          >
            <EventStatus
              :class="[
                event.startTime ? 'min-h-6 md:min-h-10 lg:h-10' : '',
                split.status,
              ]"
              :startTime="startTime"
              :endTime="endTime"
            />

            <!-- Desktop share pill. On phones the button lives inside the
                 co-located block further down, next to the avatars. -->
            <DialogShare :pageTitle="title" :class="split.share" />
          </div>

          <h1
            class="text-foreground mt-1 text-xl leading-[1.25] font-semibold tracking-tighter sm:mt-2 sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl"
            :class="[split.title, !hasConjunction && split.titleSolo]"
            :style="!hasConjunction ? titleFitVars : undefined"
          >
            {{ event.title }}
          </h1>

          <div
            class="mt-2.5 flex flex-col gap-y-2.5 sm:mt-1.5 sm:gap-y-3"
            :class="split.contents"
          >
            <div v-if="event.edition?.value" class="flex" :class="split.edition">
              <!-- The number and its English ordinal are slots, not baked into
                   the sentence: "2nd edition" is "Edisi ke-2" in Indonesian and
                   "第2回" in Japanese, so each locale places the digit itself
                   and simply leaves {ordinal} out when its grammar has no
                   English-style suffix. -->
              <i18n-t
                keypath="ui.editionBadge"
                tag="span"
                scope="global"
                class="text-foreground bg-muted rounded-full px-3 py-1.5 text-sm tracking-tight"
                :class="split.editionBadge"
              >
                <template #n>{{ event.edition.value }}</template>
                <template #ordinal
                  ><span class="align-super text-[10px]">{{
                    event.edition.ordinal
                  }}</span></template
                >
              </i18n-t>
            </div>

            <InConjunction
              :class="split.conjunction"
              :avatar-class="split.avatars"
            />

            <!-- Phone share button, right-aligned in an existing row without
                 reserving space: the co-located block's row (level with its
                 avatars) when there is one, otherwise the edition row. Hidden
                 from `md` up, where the header pill above takes over. -->
            <DialogShare
              v-if="hasPoster"
              :pageTitle="title"
              :class="[
                'md:hidden',
                hasConjunction ? split.mobileShare : split.mobileShareSolo,
              ]"
            >
              <template #trigger="{ open }">
                <Button
                  variant="secondary"
                  size="iconXs"
                  class="size-8 rounded-full"
                  aria-label="Share"
                  @click="open"
                >
                  <Icon name="lucide:share" class="size-4 shrink-0" />
                </Button>
              </template>
            </DialogShare>
          </div>

          <WhenAndWhere
            v-if="event.date || event.location || event.hall"
            class="mt-3 md:mt-5"
            :class="split.whenWhere"
            mobile-grid
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
      class="scroll-mt-navbar mt-3 flex w-full flex-col sm:mt-8"
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
        class="max-sm:[&_[data-section-description]]:text-muted-foreground! min-h-[calc(100dvh-var(--navbar-height-mobile)*2)] outline-hidden data-[state=inactive]:hidden max-sm:[&_[data-section-description]]:mt-1"
        :class="{
          'pt-2 sm:pt-8': tab.withPadding,
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

// Staff preview. Written to the cart on EVERY visit (true or false) so an
// ordinary visit clears a flag left over from an earlier one - the cart is
// persisted, and /tickets/checkout is a separate route that cannot read this
// page's query string. The write happens AFTER cart.hydrate() below, which
// would otherwise restore the stale value straight back over it.
const forceCheckout = useForceShow("force-checkout-ticket");
watch(forceCheckout, (value) => {
  if (cart.hydrated) cart.setForceCheckout(value);
});

// Same lifecycle as the flag above, and for the same reason: /tickets/checkout
// is a separate route that cannot read this page's query string, so the token
// has to ride in the persisted cart to survive the hop.
const previewToken = usePreviewToken();
watch(previewToken, (value) => {
  if (cart.hydrated) cart.setPreviewToken(value);
});

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
  cart.setForceCheckout(forceCheckout.value);
  cart.setPreviewToken(previewToken.value);
});

// Poster sourced from PM One (already optimized), so no NuxtImg/Cloudflare
// re-optimization.
const hasPoster = computed(() => Boolean(event.posterImage));
const hasConjunction = computed(() =>
  Boolean(event.inConjunction?.list?.length),
);

// Displayed at `lg` (fast); the Lightbox opens the `xl` conversion.
const posterSrc = computed(() => {
  const p = event.posterImage;
  return p ? p.lg || p.md || p.url : "";
});

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

const startTime = computed(() => new Date(event.startTime));
const endTime = computed(() => new Date(event.endTime));

// Phone header placement (see the template comment). Every class here is
// `max-md:` so it is inert from `md` up, and the whole set is dropped when
// there is no poster, which keeps the plain single-column flow. Kept as
// literal strings in one place so Tailwind sees them and the template stays
// readable.
const SPLIT = {
  grid: "max-lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] max-md:@container max-md:grid-cols-[minmax(0,8fr)_minmax(0,17fr)] max-md:grid-rows-[1fr_auto_auto_auto_auto_1fr_auto] max-md:items-start max-md:gap-x-3 max-md:gap-y-0",
  poster: "max-md:row-span-6",
  contents: "max-md:contents",
  status:
    "max-md:text-body max-md:col-start-2 max-md:row-start-2 max-md:justify-start",
  share: "max-md:hidden",
  title: "max-md:col-start-2 max-md:row-start-3",
  // Without a co-located block the column runs out of content before the
  // poster runs out of height (the wider the phone, the taller the poster),
  // so the title is sized to fill it, CSS-only, as the smaller of:
  //  - width bound: column width (17/25 of the grid, in cqi) over the
  //    longest line of the balanced `--title-lines`-line wrap (~0.55em per
  //    character); `text-balance` makes the browser wrap the same way;
  //  - height bound: poster height (8/25 of the grid × 5/4 = 40cqi - 4.8px)
  //    minus the column's fixed rows (countdown 24 + edition/share row 32 +
  //    margins 8 = 64px), over line-height 1.25 × target lines;
  // clamped between text-xl and 3.5rem. `--title-line-chars`/`--title-lines`
  // come from the data (see `titleFitVars`), so SSR and client agree. `!`
  // because `sm:text-2xl` would otherwise win between 640 and 767px.
  titleSolo:
    "max-md:text-balance max-md:text-[clamp(1.25rem,min(calc(100cqi*0.68/(var(--title-line-chars)*0.55)),calc((40cqi-69px)/(1.25*var(--title-lines)))),3.5rem)]!",
  edition:
    "max-md:col-start-2 max-md:row-start-4 max-md:mt-1 max-md:self-center",
  editionBadge:
    "max-md:text-body max-md:bg-transparent max-md:px-0 max-md:py-0",
  conjunction:
    "max-md:[&>span]:text-body max-md:col-start-2 max-md:row-start-5 max-md:mt-3 max-md:flex-col max-md:items-start max-md:gap-y-1.5",
  avatars: "max-md:[--avatar-size:1.75rem]!",
  // With a co-located block: same cell as that block, level with its avatar
  // row (`mt-2.5` = the block's `mt-3` minus half the 4px the 32px button is
  // taller than the 28px avatars).
  mobileShare:
    "max-md:col-start-2 max-md:row-start-5 max-md:mt-2.5 max-md:self-start max-md:justify-self-end",
  // Without one: the edition row, right-aligned and centred against the
  // badge (both margin boxes are centred in the row, so the centres meet).
  mobileShareSolo:
    "max-md:col-start-2 max-md:row-start-4 max-md:mt-1 max-md:self-center max-md:justify-self-end",
  whenWhere: "max-md:col-span-2 max-md:row-start-7",
};
const split = computed(() => (hasPoster.value ? SPLIT : {}));

// Short titles get two lines, longer ones three; the CSS above turns that
// into a font size that fills the column at that many lines.
const titleFitVars = computed(() => {
  const text = event.title ?? "";
  const lines = text.length <= 30 ? 2 : 3;
  return {
    "--title-lines": lines,
    "--title-line-chars": Math.max(1, longestBalancedLine(text, lines)),
  };
});

/**
 * Length of the longest line when `text` is wrapped at spaces into at most
 * `lines` lines as evenly as possible (what `text-wrap: balance` produces).
 * Binary search on the line length; the check is a greedy wrap.
 */
function longestBalancedLine(text, lines) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return text.length;
  let lo = Math.max(...words.map((w) => w.length));
  let hi = text.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    let count = 1;
    let current = 0;
    for (const word of words) {
      if (current === 0) current = word.length;
      else if (current + 1 + word.length <= mid) current += 1 + word.length;
      else {
        count += 1;
        current = word.length;
      }
    }
    if (count <= lines) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

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
  Boolean(event.startTime || event.location || event.hall || event.posterImage),
);

const showComingSoon = computed(
  () =>
    tabSettings.value.showTickets &&
    !eventHasDetails.value &&
    !route.query.invite &&
    !route.query.code &&
    !forceCheckout.value &&
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
