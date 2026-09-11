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
          :srcset="photoSrcset"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
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
         same height whether or not a guest has a title or a date. The name
         and date link to the guest page; the menu sits beside that link,
         never inside it. -->
    <div class="mt-2.5 flex min-h-9 items-center sm:min-h-9.5">
      <NuxtLink
        :to="guestPath"
        class="group flex min-w-0 grow items-center gap-x-1 self-stretch"
      >
        <!-- Name over title on tight lines (18px, the name 20px from `sm`) so
             the two read as one block. A long one scrolls sideways under a
             fade instead of being cut short, like a TableData cell. -->
        <div class="no-scrollbar scroll-fade-x flex min-w-0 grow flex-col overflow-x-auto">
          <h3
            class="text-foreground text-sm leading-4.5 font-semibold tracking-tight whitespace-nowrap group-hover:underline sm:text-base sm:leading-5"
          >
            {{ guest.name }}
          </h3>
          <p
            v-if="subtitle"
            class="text-muted-foreground text-sm leading-4.5 tracking-tight whitespace-nowrap"
          >
            {{ subtitle }}
          </p>
        </div>

        <!-- Appearance date: WhenAndWhere's date badge, month over the day
             range in its type, as tall as the name and title beside it (36px,
             38px from `sm`), which leaves the month and day its breathing
             room. `min-w-* px-2` so a wide range gets room. -->
        <div
          v-if="guest.appearance_date?.date"
          class="bg-muted flex h-9 w-fit min-w-9 shrink-0 flex-col items-center justify-center gap-y-0.5 rounded-xl px-2 text-center sm:h-9.5 sm:min-w-9.5"
          :title="t('guests.appearanceDate')"
        >
          <span class="sr-only">{{ t("guests.appearanceDate") }}:</span>
          <span
            v-if="guest.appearance_date.month"
            class="text-foreground text-[0.625rem] leading-none font-semibold tracking-tight uppercase"
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

      <!-- More: the RowActions trigger from PM One's tables, an ellipsis that
           opens the guest page and each of the guest's links, icon and label.
           Its whole box, hover fill included, stays inside the card. -->
      <DropdownMenu :modal="false">
        <DropdownMenuTrigger as-child>
          <Button
            variant="ghost"
            size="iconSm"
            :aria-label="t('guests.moreOptions', { name: guest.name })"
          >
            <Icon name="lucide:ellipsis" class="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" class="w-auto">
          <DropdownMenuItem as-child class="gap-x-2">
            <NuxtLink :to="guestPath">
              <Icon name="hugeicons:view" class="size-4 shrink-0" />
              <span>{{ t("guests.viewDetails") }}</span>
            </NuxtLink>
          </DropdownMenuItem>

          <template v-if="menuLinks.length">
            <DropdownMenuSeparator />
            <DropdownMenuItem
              v-for="link in menuLinks"
              :key="link.url"
              as-child
              class="gap-x-2"
            >
              <NuxtLink :to="link.url" target="_blank" rel="noopener">
                <Icon :name="guestLinkIcon(link.label)" class="size-4 shrink-0" />
                <span class="truncate">{{ link.text }}</span>
              </NuxtLink>
            </DropdownMenuItem>
          </template>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
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

// The srcset lets the browser take the conversion that fits the grid column at
// the screen's density (md on most phones, lg on desktop); `md` is only the
// fallback. The Lightbox opens `xl`.
const photoSrc = computed(() => {
  const p = props.guest.profile_image;
  return p ? p.md || p.lg || p.url || "" : "";
});

const photoSrcset = computed(() =>
  buildGuestPhotoSrcset(props.guest.profile_image, props.aspectRatio),
);

// One line, so every caption has the same height.
const subtitle = computed(() =>
  [props.guest.title, props.guest.organization].filter(Boolean).join(" · "),
);

const guestPath = computed(() => localePath(`/guests/${props.guest.slug}`));

// Each link by its platform ("Instagram", "Website"). A team lists one
// Instagram per member, so a label that repeats names its handle.
const menuLinks = computed(() => {
  const links = props.guest.links ?? [];
  const repeats = (label: string) => links.filter((link) => link.label === label).length > 1;
  return links.map((link) => ({
    ...link,
    text: repeats(link.label) ? guestLinkLabel(link) : link.label,
  }));
});
</script>
