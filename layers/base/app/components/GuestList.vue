<template>
  <section id="guests" class="container mx-auto">
    <div class="flex flex-col items-center text-center">
      <h1 class="section-title">{{ pageTitle }}</h1>
      <p
        v-if="pageDescription"
        class="mt-3 max-w-2xl text-base tracking-tight text-pretty sm:text-lg"
      >
        {{ pageDescription }}
      </p>
    </div>

    <!-- Loading skeleton -->
    <div
      v-if="pending"
      class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
    >
      <Skeleton v-for="i in 8" :key="`sk-${i}`" class="aspect-[4/5] rounded-2xl" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="mt-8 flex justify-center">
      <span class="text-primary text-lg font-semibold tracking-tighter">
        {{ $t("ui.failedToGetData") }}
      </span>
    </div>

    <!-- Empty -->
    <div
      v-else-if="!data?.data?.length"
      class="text-muted-foreground mt-8 flex justify-center text-sm tracking-tight"
    >
      {{ $t("guests.comingSoon", $t("ui.comingSoon")) }}
    </div>

    <!-- Featured -->
    <template v-else>
      <div v-if="featured.length" class="mt-10">
        <h2 class="text-xl font-semibold tracking-tight">
          {{ $t("guests.featuredHeading", "Featured") }}
        </h2>
        <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          <GuestCard v-for="guest in featured" :key="guest.id" :guest="guest" featured />
        </div>
      </div>

      <div :class="featured.length ? 'mt-10' : 'mt-8'">
        <h2 v-if="featured.length" class="text-xl font-semibold tracking-tight">
          {{ $t("guests.allHeading", "All") }}
        </h2>
        <div
          :class="[
            'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4',
            featured.length ? 'mt-4' : '',
          ]"
        >
          <GuestCard v-for="guest in nonFeatured" :key="guest.id" :guest="guest" />
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
const { t, te } = useI18n();
const appConfig = useAppConfig();

const { data, pending, error } = await useGuests();

const isGuestProject = computed(() => {
  const username = (appConfig.app as any).projectUsername || (appConfig.app as any).dataSourceUsername;
  return username === "icc" || username === "inacon";
});

const pageTitle = computed(() => {
  if (te("pages.guests.title")) return t("pages.guests.title");
  return isGuestProject.value ? "Guests" : "Speakers";
});

const pageDescription = computed(() => {
  if (te("pages.guests.description")) return t("pages.guests.description");
  return "";
});

const featured = computed(() => (data.value?.data ?? []).filter((g) => g.is_featured));
const nonFeatured = computed(() => (data.value?.data ?? []).filter((g) => !g.is_featured));
</script>
