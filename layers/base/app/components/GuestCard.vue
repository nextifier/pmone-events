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

    <!-- Caption. min-h keeps every card in a row, and GuestCardSkeleton, the
         same height whether or not a guest has a title or a date. -->
    <NuxtLink
      :to="localePath(`/guests/${guest.slug}`)"
      class="group mt-2.5 flex min-h-11 items-center gap-x-2 sm:min-h-12"
    >
      <div class="flex min-w-0 grow flex-col gap-y-0.5">
        <h3
          class="text-foreground truncate text-sm font-semibold tracking-tight group-hover:underline sm:text-base"
        >
          {{ guest.name }}
        </h3>
        <p v-if="subtitle" class="text-muted-foreground truncate text-sm tracking-tight">
          {{ subtitle }}
        </p>
      </div>

      <!-- Appearance date: WhenAndWhere's date badge, month over the day
           range. `min-w-10 px-2` so a wide range gets room. -->
      <div
        v-if="guest.appearance_date?.date"
        class="bg-muted flex h-10 w-fit min-w-10 shrink-0 flex-col items-center justify-center gap-y-0.5 rounded-xl px-2 text-center"
        :title="t('guests.appearanceDate')"
      >
        <span class="sr-only">{{ t("guests.appearanceDate") }}:</span>
        <span
          v-if="guest.appearance_date.month"
          class="text-muted-foreground text-[0.625rem] leading-none font-semibold tracking-tight uppercase"
        >
          {{ guest.appearance_date.month }}
        </span>
        <span
          class="text-foreground text-sm leading-none font-semibold tracking-tight whitespace-nowrap"
        >
          {{ guest.appearance_date.date }}
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
    /** CSS aspect-ratio of the photo frame, e.g. "3 / 4". */
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

// Displayed at `lg`, like the tickets-page poster; the Lightbox opens `xl`.
const photoSrc = computed(() => {
  const p = props.guest.profile_image;
  return p ? p.lg || p.md || p.url || "" : "";
});

// One line, so every caption has the same height.
const subtitle = computed(() =>
  [props.guest.title, props.guest.organization].filter(Boolean).join(" · "),
);
</script>
