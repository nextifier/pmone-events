<template>
  <article class="flex flex-col">
    <!-- Photo: the tickets-page poster treatment, one to one. TiltCard plus a
         zoom trigger into the list's Lightbox; the name below links to the
         guest page. -->
    <TiltCard
      class="bg-muted relative isolate w-full overflow-hidden rounded-xl sm:rounded-2xl"
      :style="{ aspectRatio }"
    >
      <button
        v-if="photoSrc"
        type="button"
        class="absolute inset-0 z-10 cursor-zoom-in"
        :aria-label="t('ui.viewGuestPhoto', { name: guest.name })"
        @click="emit('zoom')"
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
        <Icon name="hugeicons:user" class="size-8" />
      </div>

      <span
        v-if="featured && !badgeHidden"
        class="pointer-events-none absolute top-2 right-2 z-20 inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-2 py-0.5 text-xs font-medium tracking-tight text-amber-950 backdrop-blur-sm"
      >
        <Icon name="hugeicons:star" class="size-3" />
        {{ $t("guests.featured", "Featured") }}
      </span>
    </TiltCard>

    <!-- Caption. The date tile sets its height (min-h matches it), so every
         card in a row, and GuestCardSkeleton, measure the same. -->
    <NuxtLink
      :to="localePath(`/guests/${guest.slug}`)"
      class="group mt-2.5 flex min-h-11 items-center gap-x-2 sm:min-h-14"
    >
      <div class="flex min-w-0 grow flex-col gap-y-0.5">
        <h3
          class="truncate text-sm font-semibold tracking-tight group-hover:underline sm:text-base"
        >
          {{ guest.name }}
        </h3>
        <p v-if="subtitle" class="text-muted-foreground truncate text-sm tracking-tight">
          {{ subtitle }}
        </p>
      </div>

      <div
        v-if="guest.appearance_date?.date"
        class="bg-muted flex h-11 min-w-11 shrink-0 flex-col items-center justify-center gap-y-1 rounded-xl px-1.5 text-center whitespace-nowrap sm:h-14 sm:min-w-14 sm:rounded-2xl sm:px-2"
        :title="t('guests.appearanceDate')"
      >
        <span class="text-sm leading-none font-semibold tracking-tighter sm:text-base">
          {{ guest.appearance_date.date }}
        </span>
        <span
          v-if="guest.appearance_date.month"
          class="text-muted-foreground text-sm leading-none tracking-tight"
        >
          {{ guest.appearance_date.month }}
        </span>
      </div>
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
import type { Guest } from "../composables/useGuests";

const props = withDefaults(
  defineProps<{
    guest: Guest;
    featured?: boolean;
    badgeHidden?: boolean;
    /** CSS aspect-ratio of the photo frame, from guestAspectRatio(). */
    aspectRatio?: string;
  }>(),
  {
    featured: false,
    badgeHidden: false,
    aspectRatio: "4 / 5",
  },
);

const emit = defineEmits<{ zoom: [] }>();

const { t } = useI18n();
const localePath = useLocalePath();

// Posters carry small print, so the card asks for `lg`; the Lightbox opens `xl`.
const photoSrc = computed(() => {
  const photo = props.guest.profile_image;
  return photo?.lg || photo?.md || photo?.original || photo?.url || "";
});

// One line, so every caption has the same height.
const subtitle = computed(() =>
  [props.guest.title, props.guest.organization].filter(Boolean).join(" · "),
);
</script>
