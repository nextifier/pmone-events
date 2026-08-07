<template>
  <section id="speakers" class="container-wider">
    <div class="flex flex-col">
      <h2
        class="section-title-large text-foreground !leading-[1] font-medium tracking-[-0.06em] text-balance"
      >
        {{ $t("speakers.title") }}
      </h2>
      <p
        v-if="$t('speakers.description')"
        class="max-w-3xl text-lg !leading-[1.4] tracking-tight text-pretty sm:mt-2 sm:text-xl"
      >
        {{ $t("speakers.description") }}
      </p>
    </div>

    <div
      v-if="loading"
      class="mt-0 grid grid-cols-2 gap-x-2 gap-y-3 sm:grid-cols-[repeat(auto-fit,minmax(320px,1fr))]"
    >
      <div v-for="i in 8" :key="`sp-sk-${i}`" class="flex flex-col gap-y-3">
        <Skeleton class="aspect-[4/5] w-full rounded-2xl" />
        <Skeleton class="h-5 w-3/4 rounded-md" />
        <Skeleton class="h-4 w-1/2 rounded-md" />
      </div>
    </div>

    <div v-else-if="error" class="mt-6 flex justify-center">
      <span class="text-foreground text-lg font-semibold tracking-tighter">
        {{ $t("ui.failedToGetData") }}
      </span>
    </div>

    <div
      v-else-if="!speakers.length"
      class="text-foreground/60 mt-6 flex justify-center text-base tracking-tight"
    >
      {{ $t("speakers.comingSoon") }}
    </div>

    <div
      v-else
      class="mt-6 grid grid-cols-2 gap-x-2 gap-y-6 sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]"
    >
      <article
        v-for="speaker in speakers"
        :key="speaker.id"
        class="group relative flex flex-col"
      >
        <div
          class="bg-muted relative aspect-[4/5] w-full overflow-hidden rounded-2xl"
        >
          <BlurImage
            v-if="getImage(speaker)"
            :src="getImage(speaker)"
            :lqip="speaker.profile_image?.lqip || ''"
            :alt="speaker.profile_image?.alt || speaker.name"
            image-class="size-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.04]"
          />
          <div
            v-else
            class="text-foreground/40 flex size-full items-center justify-center"
          >
            <Icon name="hugeicons:user" class="size-10" />
          </div>

          <!-- <span
            v-if="speaker.is_featured"
            class="bg-primary text-primary-foreground absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase sm:top-4 sm:left-4 sm:text-[11px]"
          >
            <Icon name="hugeicons:star" class="size-3" />
            {{ $t("speakers.featured") }}
          </span> -->
        </div>

        <div class="mt-3 flex flex-col gap-y-1 sm:mt-4">
          <h3
            class="text-foreground line-clamp-2 text-base !leading-[1.15] font-semibold tracking-tighter sm:text-xl"
          >
            {{ speaker.name }}
          </h3>
          <p
            v-if="speaker.title"
            class="text-muted-foreground line-clamp-2 text-sm !leading-[1.35] tracking-tight sm:text-sm"
          >
            {{ speaker.title }}
          </p>
          <!-- <p
            v-if="speaker.organization"
            class="text-muted-foreground line-clamp-1 text-xs !leading-[1.35] tracking-tight sm:text-sm"
          >
            {{ speaker.organization }}
          </p> -->
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
const route = useRoute();

// SSR on the dedicated /speakers page (it is on the prerender deny list, so it
// stays Worker-rendered and crawlable); client-only when embedded on the
// prerendered home page, or the speaker list would freeze into static HTML.
// `@nuxtjs/i18n` suffixes route names with `___<locale>`.
const isSpeakersPage =
  (route.name?.toString() ?? "").split("___")[0] === "speakers";

const { data, pending, error } = await useGuests({ ssr: isSpeakersPage });

// `pending` is FALSE while the client-only fetch is still `idle`, so without
// this gate the "coming soon" branch would bake into the prerendered home page.
const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});
const loading = computed(
  () => pending.value || (!isSpeakersPage && !mounted.value),
);

const speakers = computed(() => {
  const list = data.value?.data ?? [];
  return [...list].sort((a, b) => {
    const af = a.is_featured ? 1 : 0;
    const bf = b.is_featured ? 1 : 0;
    return bf - af;
  });
});

const getImage = (speaker) =>
  speaker.profile_image?.md ||
  speaker.profile_image?.sm ||
  speaker.profile_image?.original ||
  speaker.profile_image?.url ||
  null;
</script>
