<template>
  <!-- The brand page's shape (brands/[slug].vue): same top bar, container,
       12-column grid and type scale, with the poster in the column the brand
       gives its identity rail. overflow-x-clip: the tilting poster projects
       ~15px past its box, which near the viewport edge lengthens the document
       into a horizontal scrollbar; `clip` (not `hidden`) drops it without
       making this a scroll container. -->
  <div class="space-y-4 overflow-x-clip pt-4 pb-20">
    <!-- Top bar: back + share (matching icon buttons) -->
    <div class="container flex items-center justify-between">
      <ButtonBack destination="/guests" v-slot="{ goBack }">
        <button
          type="button"
          class="text-foreground lg:hover:bg-muted bg-background border-border flex items-center justify-center gap-x-1 rounded-full border p-3 transition active:scale-98 lg:border-0"
          v-ripple
          @click="goBack"
        >
          <Icon name="lucide:arrow-left" class="size-4 shrink-0" />
          <span class="hidden text-sm tracking-tight lg:block">Back</span>
        </button>
      </ButtonBack>

      <DialogShare v-if="guest" :pageTitle="guest.name" />
    </div>

    <!-- Loading skeleton: the loaded grid below, cell for cell. -->
    <div v-if="pending && !guest" class="container">
      <div class="grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-12 lg:gap-x-16">
        <Skeleton
          class="w-full rounded-xl sm:rounded-2xl lg:col-span-6"
          :style="{ aspectRatio }"
        />
        <div class="flex flex-col lg:col-span-6 lg:pt-10">
          <div class="flex items-center justify-between gap-x-4">
            <Skeleton class="h-12 w-3/4 rounded-2xl lg:h-14" />
            <Skeleton class="size-12 shrink-0 rounded-xl" />
          </div>
          <Skeleton class="mt-3 h-5 w-1/3" />
          <div class="mt-8 w-full max-w-2xl space-y-3">
            <Skeleton class="h-5 w-full" />
            <Skeleton class="h-5 w-11/12" />
            <Skeleton class="h-5 w-4/5" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="container mt-12 text-center">
      <h1 class="text-2xl font-semibold tracking-tight">{{ $t("ui.failedToGetData") }}</h1>
    </div>

    <div v-else-if="guest" class="container">
      <div class="grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-12 lg:gap-x-16">
        <!-- Poster: the tickets-page poster treatment, one to one. -->
        <div class="lg:col-span-6">
          <Lightbox
            :items="photoItems"
            :show-thumbnails="false"
            full-key="xl"
            :alt="guest.name"
          >
            <template #trigger="{ openAt }">
              <TiltCard
                class="bg-muted relative isolate w-full overflow-hidden rounded-xl sm:rounded-2xl"
                :style="{ aspectRatio }"
              >
                <button
                  v-if="photoSrc"
                  type="button"
                  class="absolute inset-0 z-10 cursor-zoom-in"
                  :aria-label="t('ui.viewGuestPhoto', { name: guest.name })"
                  @click="openAt(0)"
                >
                  <BlurImage
                    :src="photoSrc"
                    :srcset="photoSrcset"
                    sizes="(min-width: 1024px) 50vw, calc(100vw - 2rem)"
                    loading="eager"
                    fetchpriority="high"
                    :lqip="guest.profile_image?.lqip || ''"
                    :alt="guest.profile_image?.alt || guest.name"
                    image-class="size-full object-cover select-none outline-inside rounded-xl sm:rounded-2xl"
                  />
                </button>
                <div
                  v-else
                  class="text-muted-foreground flex size-full items-center justify-center"
                >
                  <Icon name="hugeicons:user" class="size-10" />
                </div>
              </TiltCard>
            </template>
          </Lightbox>
        </div>

        <!-- Identity + bio, left-aligned at every width. `lg:pt-10` only once
             the grid has two columns: it starts the text a step below the
             poster's top edge instead of flush with it. -->
        <div class="flex flex-col lg:col-span-6 lg:pt-10">
          <!-- Name, with the appearance date on the same row -->
          <div class="flex items-center justify-between gap-x-4">
            <h1
              class="text-foreground min-w-0 text-4xl leading-[0.95] font-semibold tracking-tighter text-balance sm:text-5xl"
            >
              {{ guest.name }}
            </h1>

            <!-- WhenAndWhere's date badge, month over the day range.
                 `min-w-12 px-2` so a wide range gets room. -->
            <div
              v-if="guest.appearance_date?.date"
              class="bg-muted flex h-12 w-fit min-w-12 shrink-0 flex-col items-center justify-center gap-y-0.5 rounded-xl px-2 text-center"
            >
              <span class="sr-only">{{ t("guests.appearanceDate") }}:</span>
              <span
                v-if="guest.appearance_date.month"
                class="text-foreground text-xs leading-none font-semibold tracking-tight uppercase"
              >
                {{ guest.appearance_date.month }}
              </span>
              <span
                class="text-foreground text-lg leading-none font-semibold tracking-tighter whitespace-nowrap"
              >
                {{ guest.appearance_date.date }}
              </span>
            </div>
          </div>

          <!-- Title + organization -->
          <p
            v-if="guest.title"
            class="text-muted-foreground mt-2 text-base tracking-tight lg:text-lg"
          >
            {{ guest.title }}
          </p>
          <p
            v-if="guest.organization"
            class="text-muted-foreground mt-1 text-base tracking-tight lg:text-lg"
          >
            {{ guest.organization }}
          </p>

          <div
            v-if="guest.tags?.length"
            class="mt-3 flex flex-wrap gap-1.5"
          >
            <span
              v-for="tag in guest.tags"
              :key="tag"
              class="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs tracking-tight"
            >
              {{ tag }}
            </span>
          </div>

          <!-- Links -->
          <div
            v-if="guest.links?.length"
            class="mt-6 flex flex-wrap gap-x-4 gap-y-2"
          >
            <SocialLink
              v-for="link in guest.links"
              :key="`${link.label}-${link.url}`"
              :to="link.url"
              :iconName="guestLinkIcon(link.label)"
              :label="guestLinkLabel(link)"
              size="lg"
            />
          </div>

          <!-- Bio: rich text from PM One's editor in typeset (paragraphs,
               lists, bold), set through typeset's own knobs to the brand
               description's metrics: text-lg / lg:text-xl size and leading,
               and its 16px (`mt-4`) gap between paragraphs. -->
          <div
            v-if="guest.bio"
            class="typeset typeset-cms mt-8 w-full max-w-2xl font-medium tracking-tight text-pretty [--typeset-flow:1rem] [--typeset-leading:calc(1.75/1.125)] [--typeset-size-lg:1.125rem] [--typeset-size:1.125rem] lg:[--typeset-leading:calc(1.75/1.25)] lg:[--typeset-size-lg:1.25rem]"
            v-html="guest.bio"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const { t } = useI18n();

const { data, pending, error } = await useGuest(route.params.slug);
const guest = computed(() => data.value?.data ?? null);

if (!pending.value && !guest.value && !error.value) {
  throw createError({ statusCode: 404, statusMessage: "Guest not found" });
}

usePageMeta("", {
  title: () => (guest.value ? `${guest.value.name}` : "Guest"),
  description: () =>
    [guest.value?.title, guest.value?.organization].filter(Boolean).join(" · "),
});

// BreadcrumbList JSON-LD: Home -> Guests -> {guest name}.
useDetailBreadcrumbs(() => guest.value?.name);

// Photo frame, the way Gallery.vue reads its ratio: PM One sends the ratio of
// the edition this guest belongs to.
const aspectRatio = computed(() =>
  (data.value?.meta?.aspect_ratio || "4:5").replace(":", " / "),
);

// The srcset lets the browser take the conversion that fits half the page on
// desktop and the full width on a phone at the screen's density (xl on a
// Retina desktop); `lg` is only the fallback. The Lightbox opens `xl`.
const photoSrc = computed(() => {
  const p = guest.value?.profile_image;
  return p ? p.lg || p.md || p.url || "" : "";
});

const photoSrcset = computed(() =>
  buildGuestPhotoSrcset(guest.value?.profile_image, aspectRatio.value),
);

const photoItems = computed(() => {
  const p = guest.value?.profile_image;
  if (!p?.url) return [];
  return [
    {
      sm: p.md || p.url,
      md: p.md || p.url,
      lg: p.lg || p.url,
      xl: p.xl || p.lg || p.url,
      url: p.url,
      lqip: p.lqip,
      alt: guest.value.name,
    },
  ];
});

</script>
