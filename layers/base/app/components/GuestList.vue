<template>
  <section id="guests" class="container mx-auto">
    <div class="flex flex-col items-center text-center">
      <h1 class="section-title">{{ pageTitle }}</h1>
      <p
        v-if="pageDescription"
        class="mt-3 max-w-2xl text-base tracking-tight text-pretty sm:text-lg"
        data-section-description
      >
        {{ pageDescription }}
      </p>
      <FallbackNotice v-if="fallbackSource" :source="fallbackSource" class="mt-4" />
    </div>

    <!-- Loading skeleton. Every geometry class on it must match the real grid
         below verbatim, and GuestCardSkeleton must match GuestCard, or the grid
         jumps the moment the guests land. -->
    <div
      v-if="loading"
      class="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4"
    >
      <GuestCardSkeleton v-for="i in 8" :key="`sk-${i}`" :aspect-ratio="aspectRatio" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="mt-8 flex justify-center">
      <span class="text-foreground text-lg font-semibold tracking-tighter">
        {{ $t("ui.failedToGetData") }}
      </span>
    </div>

    <!-- Empty -->
    <EmptyState
      v-else-if="!data?.data?.length"
      class="mt-10"
      :title="$t('guests.emptyTitle', 'Guests coming soon')"
      :description="
        $t(
          'guests.emptyDescription',
          'We\'re still locking in the lineup. Check back soon to see who\'s joining.',
        )
      "
    >
      <template #image>
        <GuestListEmptyStateImage />
      </template>
      <template v-if="instagramUrl" #actions>
        <Button as-child variant="outline">
          <NuxtLink :to="instagramUrl" target="_blank" rel="noopener">
            <Icon name="hugeicons:instagram" class="size-4 shrink-0" />
            {{ $t("ui.followInstagram", "Follow us on Instagram") }}
          </NuxtLink>
        </Button>
      </template>
    </EmptyState>

    <!-- Guests. One Lightbox over the whole lineup, so its arrows walk every
         photo, the way the tickets-page poster opens. -->
    <Lightbox
      v-else
      :items="lightboxItems"
      :show-thumbnails="false"
      full-key="xl"
      :alt="pageTitle"
    >
      <template #trigger="{ openAt }">
        <div v-if="featured.length" class="mt-10">
          <h2 class="text-xl font-semibold tracking-tight">
            {{ $t("guests.featuredHeading", "Featured") }}
          </h2>
          <div
            class="mt-4 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4"
          >
            <GuestCard
              v-for="guest in featured"
              :key="guest.id"
              :guest="guest"
              :aspect-ratio="aspectRatio"
              featured
              @zoom="openAt(zoomIndex(guest))"
            />
          </div>
        </div>

        <div :class="featured.length ? 'mt-10' : 'mt-8'">
          <h2 v-if="featured.length" class="text-xl font-semibold tracking-tight">
            {{ $t("guests.allHeading", "All") }}
          </h2>
          <div
            :class="[
              'grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4',
              featured.length ? 'mt-4' : '',
            ]"
          >
            <GuestCard
              v-for="guest in nonFeatured"
              :key="guest.id"
              :guest="guest"
              :aspect-ratio="aspectRatio"
              @zoom="openAt(zoomIndex(guest))"
            />

            <!-- Last cell: the brand directory's "and many more!" flourish in a
                 guest-card frame, so the row stays even. Only until the event
                 opens, while the lineup can still grow. -->
            <div v-if="lineupGrowing" class="flex flex-col">
              <div
                class="bg-muted flex w-full items-center overflow-hidden rounded-xl px-4 sm:rounded-2xl"
                :style="{ aspectRatio }"
              >
                <div class="w-full">
                  <TextFit
                    tag="span"
                    :text="$t('guests.andManyMore', 'and many more!')"
                    text-classes="leading-[1.1] text-outline text-center font-semibold tracking-tighter"
                  />
                </div>
              </div>
              <div class="mt-2.5 flex min-h-10.5 items-center sm:min-h-11.5">
                <p class="text-muted-foreground text-sm tracking-tight">
                  {{ $t("guests.moreComing", "More guests coming soon") }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Lightbox>
  </section>
</template>

<script setup lang="ts">
import type { Guest } from "../composables/useGuests";

const { t, te } = useI18n();
const appConfig = useAppConfig();
const route = useRoute();
const event = useEvent();

// On the dedicated /guests and /speakers pages we SSR the data: those pages are
// on the prerender deny list, so they stay Worker-rendered and crawlable.
// Embedded on the prerendered home and /tickets pages the fetch must be
// client-only, or the guest list would be frozen into static HTML.
// `@nuxtjs/i18n` suffixes route names with `___<locale>`, so match the base name.
const routeBaseName = (route.name?.toString() ?? "").split("___")[0];
const isGuestsPage = routeBaseName === "guests" || routeBaseName === "speakers";

const { data, pending, error } = await useGuests({ ssr: isGuestsPage });

// With `server: false` the fetch has not run during SSR/prerender, so its status
// is `idle` and `pending` is FALSE (experimental.pendingWhenIdle defaults to
// false in Nuxt 4). Without this gate the empty-state branch below would win on
// the server and bake "Guests coming soon" into the prerendered HTML. The first
// client render (before onMounted) also sees `mounted === false`, so the
// skeleton matches on both sides and hydration stays clean. A refetch that
// already has guests on screen keeps them instead of flashing the skeleton.
const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});
const loading = computed(
  () => (!isGuestsPage && !mounted.value) || (pending.value && !data.value?.data?.length),
);

const instagramUrl = useInstagramUrl();

const isGuestProject = computed(() => {
  const username = (appConfig.app as any).projectUsername || (appConfig.app as any).dataSourceUsername;
  return username === "icc" || username === "inacon";
});

const pageTitle = computed(() => {
  if (te("pages.guests.title")) return t("pages.guests.title");
  return isGuestProject.value ? "Guests" : "Speakers";
});

const pageDescription = computed(() => {
  if (te("pages.guests.description")) {
    return t("pages.guests.description", {
      appName: (appConfig.app as any).name,
    });
  }
  return "";
});

const featured = computed(() => (data.value?.data ?? []).filter((g) => g.is_featured));
const nonFeatured = computed(() => (data.value?.data ?? []).filter((g) => !g.is_featured));

// Source edition when guests were borrowed from a previous event.
const fallbackSource = computed(() => {
  const fb = data.value?.meta?.fallback;
  return fb?.is_fallback ? fb.source_event : null;
});

// The lineup can still grow until the event opens. After that, a "more coming"
// cell would promise names that are not coming.
const lineupGrowing = computed(() => {
  const start = event.startTime ? new Date(event.startTime).getTime() : Number.NaN;
  return Number.isNaN(start) || start > Date.now();
});

// Photo frame, the way Gallery.vue reads its ratio: PM One sends it with the
// lineup (the source edition's, when guests are borrowed).
const aspectRatio = computed(() =>
  (data.value?.meta?.aspect_ratio || "4:5").replace(":", " / "),
);

// Lightbox order follows the page: featured first, then everyone else. Items
// take the tickets-page poster's shape.
const photoGuests = computed(() =>
  [...featured.value, ...nonFeatured.value].filter((guest) => guest.profile_image?.url),
);
const lightboxItems = computed(() =>
  photoGuests.value.map((guest) => {
    const p = guest.profile_image!;
    return {
      sm: p.md || p.url,
      md: p.md || p.url,
      lg: p.lg || p.url,
      xl: p.xl || p.lg || p.url,
      url: p.url,
      lqip: p.lqip,
      alt: guest.name,
    };
  }),
);
const zoomIndexById = computed(
  () => new Map(photoGuests.value.map((guest, index) => [guest.id, index])),
);
const zoomIndex = (guest: Guest) => zoomIndexById.value.get(guest.id) ?? 0;
</script>
