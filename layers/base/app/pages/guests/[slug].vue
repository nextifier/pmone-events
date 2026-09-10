<template>
  <!-- overflow-x-clip: the tilting photo projects ~15px past its box, which near
       the viewport edge lengthens the document into a horizontal scrollbar.
       `clip` (not `hidden`) drops it without making this a scroll container. -->
  <div class="min-h-screen-offset overflow-x-clip pt-6 pb-14 lg:pt-8 lg:pb-20">
    <div class="container flex items-center justify-between lg:max-w-screen-lg">
      <ButtonBack />
      <DialogShare v-if="guest" :pageTitle="guest.name" />
    </div>

    <!-- Skeleton: the same wrapper, grid, photo frame and text-column line boxes
         as the loaded layout below, so nothing moves when the guest lands. -->
    <div
      v-if="pending && !guest"
      class="container mt-6 sm:container lg:mt-12 lg:max-w-screen-lg"
    >
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton class="w-full rounded-xl sm:rounded-2xl" :style="{ aspectRatio }" />

        <div class="flex flex-col items-center px-4 sm:px-0 lg:items-start lg:pt-10">
          <!-- h1 line box (text-4xl / sm:text-5xl) -->
          <div class="flex h-10 w-full items-center justify-center sm:h-12 lg:justify-start">
            <Skeleton class="h-8 w-3/4 rounded sm:h-10" />
          </div>
          <!-- Title line box (text-base / sm:text-lg) -->
          <div class="mt-2 flex h-6 w-full items-center justify-center sm:h-7 lg:justify-start">
            <Skeleton class="h-4 w-1/2 rounded sm:h-5" />
          </div>
          <!-- Appearance date line box (text-sm / sm:text-base) -->
          <div class="mt-2 flex h-5 w-full items-center justify-center sm:h-6 lg:justify-start">
            <Skeleton class="h-3.5 w-24 rounded sm:h-4" />
          </div>
          <!-- Bio -->
          <div class="mt-6 flex w-full flex-col gap-y-2">
            <Skeleton v-for="i in 4" :key="`bio-${i}`" class="h-5 w-full rounded sm:h-6" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="container mt-12 text-center">
      <h1 class="text-2xl font-semibold tracking-tight">{{ $t("ui.failedToGetData") }}</h1>
    </div>

    <div v-else-if="guest" class="container mt-6 sm:container lg:mt-12 lg:max-w-screen-lg">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Photo: the tickets-page poster treatment, one to one. -->
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

        <div class="flex flex-col items-center px-4 sm:px-0 lg:items-start lg:pt-10">
          <h1
            class="text-center text-4xl font-semibold tracking-tighter sm:text-5xl lg:text-left"
          >
            {{ guest.name }}
          </h1>

          <p
            v-if="guest.title"
            class="mt-2 text-center text-base tracking-tight text-pretty sm:text-lg lg:text-left"
          >
            {{ guest.title }}
          </p>

          <p
            v-if="guest.organization"
            class="text-muted-foreground mt-1 text-center text-sm tracking-tight lg:text-left"
          >
            {{ guest.organization }}
          </p>

          <p
            v-if="appearanceLabel"
            class="text-muted-foreground mt-2 flex items-center gap-x-1.5 text-sm tracking-tight sm:text-base"
          >
            <Icon name="hugeicons:calendar-03" class="size-4 shrink-0" />
            <span class="sr-only">{{ t("guests.appearanceDate") }}:</span>
            <span>{{ appearanceLabel }}</span>
          </p>

          <div v-if="guest.tags?.length" class="mt-3 flex flex-wrap justify-center gap-1.5 lg:justify-start">
            <span
              v-for="tag in guest.tags"
              :key="tag"
              class="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs tracking-tight"
            >
              {{ tag }}
            </span>
          </div>

          <div v-if="guest.links?.length" class="mt-5 flex flex-wrap gap-2">
            <SocialLink
              v-for="link in guest.links"
              :key="`${link.label}-${link.url}`"
              :to="link.url"
              :label="link.label"
              :iconName="iconForLabel(link.label)"
            />
          </div>

          <!-- Rich text from PM One's editor: paragraphs, lists, bold. -->
          <div
            v-if="guest.bio"
            class="typeset typeset-cms mt-6 w-full"
            v-html="guest.bio"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const event = useEvent();

const { data, pending, error } = await useGuest(route.params.slug);
const guest = computed(() => data.value?.data ?? null);

if (!pending.value && !guest.value && !error.value) {
  throw createError({ statusCode: 404, statusMessage: "Guest not found" });
}

usePageMeta("", {
  title: () => (guest.value ? `${guest.value.name}` : "Guest"),
  description: () => guest.value?.organization || "",
});

// BreadcrumbList JSON-LD: Home -> Guests -> {guest name}.
useDetailBreadcrumbs(() => guest.value?.name);

// Photo frame. The endpoint names the ratio of the edition this guest belongs
// to; the active event's ratio covers the skeleton before the guest arrives.
const aspectRatio = computed(() =>
  guestAspectRatio(data.value?.meta?.aspect_ratio, event.guestAspectRatio),
);

// Displayed at `lg` (fast); the Lightbox opens the `xl` conversion, like the
// tickets-page poster.
const photoSrc = computed(() => {
  const photo = guest.value?.profile_image;
  return photo?.lg || photo?.md || photo?.original || photo?.url || "";
});

const photoItems = computed(() =>
  guest.value && photoSrc.value ? [guestLightboxItem(guest.value)] : [],
);

// PM One pre-formats the range: "3-4" + "Oct", or "25 Oct - 2 Nov" + "".
const appearanceLabel = computed(() => {
  const range = guest.value?.appearance_date;
  return range ? [range.date, range.month].filter(Boolean).join(" ") : "";
});

function iconForLabel(label) {
  const map = {
    Website: "hugeicons:globe-02",
    LinkedIn: "hugeicons:linkedin-02",
    Instagram: "hugeicons:instagram",
    Facebook: "hugeicons:facebook-01",
    X: "hugeicons:new-twitter",
    Twitter: "hugeicons:new-twitter",
    YouTube: "hugeicons:youtube",
    TikTok: "hugeicons:tiktok",
  };
  return map[label] || "hugeicons:link-01";
}
</script>
