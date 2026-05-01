<template>
  <NuxtLink
    :to="localePath(`/guests/${guest.slug}`)"
    class="group bg-background border-border relative flex flex-col overflow-hidden rounded-2xl border transition hover:shadow-md"
  >
    <span
      v-if="featured && !badgeHidden"
      class="absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-2 py-0.5 text-xs font-medium tracking-tight text-amber-950 backdrop-blur-sm"
    >
      <Icon name="hugeicons:star" class="size-3" />
      {{ $t("guests.featured", "Featured") }}
    </span>

    <div class="bg-muted relative aspect-[4/5] w-full overflow-hidden">
      <NuxtImg
        v-if="guest.profile_image?.md || guest.profile_image?.sm || guest.profile_image?.original"
        :src="guest.profile_image.md || guest.profile_image.sm || guest.profile_image.original"
        :alt="guest.profile_image.alt || guest.name"
        :placeholder="guest.profile_image.lqip"
        class="size-full object-cover transition duration-300 group-hover:scale-105"
        loading="lazy"
        format="webp"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
      <div
        v-else
        class="text-muted-foreground flex size-full items-center justify-center"
      >
        <Icon name="hugeicons:user" class="size-8" />
      </div>
    </div>

    <div class="flex flex-col gap-1 p-3">
      <h3 class="line-clamp-2 text-sm font-semibold tracking-tight sm:text-base">
        {{ guest.name }}
      </h3>
      <p
        v-if="guest.title"
        class="text-muted-foreground line-clamp-1 text-xs tracking-tight sm:text-sm"
      >
        {{ guest.title }}
      </p>
      <p
        v-if="guest.organization"
        class="text-muted-foreground line-clamp-1 text-xs tracking-tight"
      >
        {{ guest.organization }}
      </p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Guest } from "../composables/useGuests";

defineProps<{
  guest: Guest;
  featured?: boolean;
  badgeHidden?: boolean;
}>();

const localePath = useLocalePath();
</script>
