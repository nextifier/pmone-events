<template>
  <div class="pt-6 pb-14 lg:pt-8 lg:pb-24">
    <!-- Utility bar: back + share -->
    <div class="container">
      <div class="flex h-9 items-center justify-between">
        <ButtonBack />

        <DialogShare :pageTitle="title" />
      </div>

      <Separator class="mt-6 lg:mt-8" />
    </div>

    <!-- Loading skeleton (mirrors the masthead layout) -->
    <div v-if="pending && !brand" class="container mt-10 lg:mt-16">
      <div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
        <div
          class="flex flex-col items-center gap-4 lg:col-span-4 lg:items-start"
        >
          <Skeleton class="size-40 rounded-full lg:size-44" />
        </div>

        <div class="flex flex-col gap-4 lg:col-span-8">
          <Skeleton class="h-12 w-3/4 rounded-2xl lg:h-16" />
          <Skeleton class="h-5 w-1/3" />
          <div class="flex gap-1.5 pt-1">
            <Skeleton class="size-10 rounded-full" />
            <Skeleton class="size-10 rounded-full" />
          </div>
        </div>
      </div>
    </div>

    <template v-else-if="brand">
      <!-- Identity masthead -->
      <header class="container mt-10 lg:mt-16">
        <div class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          <!-- Left rail: avatar -->
          <div
            class="flex flex-col items-center gap-4 lg:col-span-4 lg:items-start"
          >
            <component
              :is="instagramLink ? 'nuxt-link' : 'div'"
              :to="instagramLink ? instagramLink.url : undefined"
              :target="instagramLink ? '_blank' : undefined"
              class="shrink-0 [view-transition-name:brand-avatar]"
              @click="instagramLink && trackClick('Instagram')"
            >
              <!-- With Instagram: avatar links out -->
              <Avatar
                v-if="instagramLink"
                :model="{ name: brand.brand_name, profile_image: brand.brand_logo }"
                size="xl"
                class="size-40 lg:size-44"
                rounded="rounded-full"
                :colorful="false"
                :gradient-frame="true"
              />

              <!-- No Instagram: avatar opens the logo in a Lightbox -->
              <Lightbox
                v-else-if="brand.brand_logo"
                :items="logoLightboxItems"
                fullKey="xl"
                :show-thumbnails="false"
                :show-counter="false"
              >
                <template #trigger="{ open }">
                  <button
                    type="button"
                    class="block rounded-full focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                    @click="open"
                  >
                    <Avatar
                      :model="{ name: brand.brand_name, profile_image: brand.brand_logo }"
                      size="xl"
                      class="size-40 lg:size-44"
                      rounded="rounded-full"
                      :colorful="false"
                    />
                  </button>
                </template>
              </Lightbox>

              <!-- No Instagram, no logo: plain initials avatar -->
              <Avatar
                v-else
                :model="{ name: brand.brand_name, profile_image: brand.brand_logo }"
                size="xl"
                class="size-40 lg:size-44"
                rounded="rounded-full"
                :colorful="false"
              />
            </component>
          </div>

          <!-- Right column: identity -->
          <div
            class="reveal flex flex-col gap-3 lg:col-span-8"
            :class="{ in: mounted }"
          >
            <h1
              class="text-balance text-4xl leading-[0.95] font-semibold tracking-tighter text-foreground sm:text-5xl lg:text-6xl"
            >
              {{ brand.brand_name }}
            </h1>

            <p
              v-if="brand.company_name"
              class="text-lg tracking-tight text-muted-foreground lg:text-xl"
            >
              {{ brand.company_name }}
            </p>

            <!-- Social links -->
            <div v-if="brand.links?.length" class="flex flex-wrap gap-1 pt-2">
              <SocialLink
                v-for="link in brand.links"
                :key="link.label"
                :to="link.url"
                :iconName="getLinkIcon(link.label)"
                :label="link.label"
                size="lg"
                @click="trackClick(link.label)"
              />
            </div>
          </div>
        </div>
      </header>

      <!-- Facts grid: booth + categories -->
      <section v-if="factCount > 0" class="container mt-10 lg:mt-14">
        <GridFill
          :count="factCount"
          :cols="1"
          min-col-width="240px"
          rounded="2xl"
        >
          <div
            v-if="brand.booth_number"
            class="flex min-h-28 flex-col justify-between gap-2 px-5 py-6 lg:py-7"
          >
            <span class="text-sm tracking-tight text-muted-foreground">
              {{ $t("ui.booth") }}
            </span>
            <span
              class="text-3xl font-semibold tracking-tighter text-accent lg:text-4xl"
            >
              {{ brand.booth_number }}
            </span>
          </div>

          <div
            v-if="brand.business_categories?.length"
            class="flex min-h-28 flex-col justify-between gap-2 px-5 py-6 lg:py-7"
          >
            <span class="text-sm tracking-tight text-muted-foreground">
              {{ $t("ui.categories") }}
            </span>
            <div class="flex flex-wrap gap-1.5">
              <Badge
                v-for="category in brand.business_categories"
                :key="category"
                variant="outline"
              >
                {{ category }}
              </Badge>
            </div>
          </div>
        </GridFill>
      </section>

      <!-- Lead paragraph: brand_description -->
      <section v-if="brand.brand_description" class="container mt-10 lg:mt-16">
        <div class="grid grid-cols-1 lg:grid-cols-12">
          <div class="lg:col-span-7 lg:col-start-5">
            <div class="mb-3 flex items-center gap-3">
              <span class="h-px w-8 bg-accent" />
              <span class="text-sm tracking-tight text-muted-foreground">
                {{ $t("ui.description") }}
              </span>
            </div>

            <div v-html="brand.brand_description" class="format-html" />
          </div>
        </div>
      </section>

      <!-- Promotions feed: per-post Lightbox cards -->
      <section v-if="hasPromotions" class="container mt-12 lg:mt-20">
        <div class="mx-auto max-w-2xl lg:mx-0 lg:ml-[33.333%]">
          <div class="mb-8 flex items-center gap-3">
            <span class="h-px w-8 bg-accent" />
            <span class="text-sm tracking-tight text-muted-foreground">
              {{ instagramUsername ?? brand.brand_name }}
            </span>
          </div>

          <div class="space-y-10">
            <article
              v-for="(promo, promoIndex) in postsWithImages"
              :key="promoIndex"
              ref="postRefs"
              class="reveal-up"
            >
              <!-- Post head -->
              <div class="mb-3 flex items-center gap-3">
                <component
                  :is="instagramLink ? 'nuxt-link' : 'div'"
                  :to="instagramLink ? instagramLink.url : undefined"
                  :target="instagramLink ? '_blank' : undefined"
                  class="shrink-0"
                  @click="instagramLink && trackClick('Instagram')"
                >
                  <Avatar
                    :model="{ name: brand.brand_name, profile_image: brand.brand_logo }"
                    size="sm"
                    class="size-9"
                    rounded="rounded-full"
                    :colorful="false"
                    :gradient-frame="!!instagramLink"
                  />
                </component>

                <component
                  :is="instagramLink ? 'nuxt-link' : 'span'"
                  :to="instagramLink ? instagramLink.url : undefined"
                  :target="instagramLink ? '_blank' : undefined"
                  class="font-semibold tracking-tight text-foreground"
                  @click="instagramLink && trackClick('Instagram')"
                >
                  {{ instagramUsername ?? brand.brand_name }}
                </component>

                <span
                  v-if="promo.created_at"
                  class="ml-auto text-sm tracking-tight text-muted-foreground"
                >
                  {{ $dayjs(promo.created_at).fromNow() }}
                </span>
              </div>

              <!-- Media: each post is its own Lightbox grid -->
              <Lightbox
                :items="promo.images"
                thumbnailKey="md"
                fullKey="xl"
                :first-spans-large="promo.images.length > 2"
                :limit="promo.images.length > 5 ? 5 : null"
                :gridClass="promoGridClass(promo.images.length)"
                rounded="rounded-2xl"
                class="gap-1.5"
                show-caption
                show-counter
                show-thumbnails
              />

              <!-- Caption -->
              <p
                v-if="promo.caption"
                class="mt-3 text-sm tracking-tight text-foreground lg:text-base"
              >
                <component
                  :is="instagramLink ? 'nuxt-link' : 'span'"
                  :to="instagramLink ? instagramLink.url : undefined"
                  :target="instagramLink ? '_blank' : undefined"
                  class="mr-1.5 font-semibold tracking-tight"
                  @click="instagramLink && trackClick('Instagram')"
                >
                  {{ instagramUsername ?? brand.brand_name }}
                </component>
                {{ promo.caption }}
              </p>
            </article>
          </div>
        </div>
      </section>

      <!-- Minimal state: a brand with only a name -->
      <div v-if="isNameOnly" class="container mt-10 lg:mt-16">
        <Button to="/brands" variant="outline" size="lg">
          {{ $t("ui.viewAllBrands") }}
        </Button>
      </div>
    </template>
  </div>
</template>

<script setup>
const route = useRoute();
const config = useRuntimeConfig();

const { $dayjs } = useNuxtApp();

const {
  data: brand,
  pending,
} = await useFetch(`/api/exhibitors/${route.params.slug}`, {
  transform: (res) => res.data,
});

if (!brand.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
  });
}

const title = ref(brand?.value?.brand_name) ?? "";
const description = brand?.value?.brand_description ?? "";

usePageMeta("", {
  title: title,
  description: description,
});

const linkIconMap = {
  website: "hugeicons:globe-02",
  instagram: "hugeicons:instagram",
  facebook: "hugeicons:facebook-01",
  tiktok: "hugeicons:tiktok",
  x: "hugeicons:new-twitter",
  twitter: "hugeicons:new-twitter",
  linkedin: "hugeicons:linkedin-01",
  youtube: "hugeicons:youtube",
  threads: "hugeicons:threads",
};

const getLinkIcon = (label) => {
  const key = label?.toLowerCase();
  return linkIconMap[key] || "hugeicons:link-01";
};

const instagramLink = computed(() =>
  brand.value?.links?.find((l) => l.label?.toLowerCase() === "instagram"),
);

const instagramUsername = computed(() => {
  if (!instagramLink.value) return null;
  try {
    const path = new URL(instagramLink.value.url).pathname.replace(/\//g, "");
    return path || null;
  } catch {
    return null;
  }
});

const { trackVisit, trackClick } = useBrandTracking(
  () => brand.value?.brand_event_id,
);

watchEffect(() => {
  if (brand.value?.brand_event_id) trackVisit();
});

const router = useRouter();
defineShortcuts({
  escape: {
    handler: async () => {
      router.back();
    },
  },
});

// --- Design-specific derived state ---

// Single-item Lightbox for the brand logo (when no Instagram link exists).
const logoLightboxItems = computed(() =>
  brand.value?.brand_logo ? [brand.value.brand_logo] : [],
);

// Promotion posts that actually carry images (the only ones we render).
const postsWithImages = computed(
  () => brand.value?.promotions?.filter((p) => p.images?.length) ?? [],
);

const hasPromotions = computed(() => postsWithImages.value.length > 0);

// Per-post grid class by image count.
const promoGridClass = (count) => {
  if (count <= 1) return "grid grid-cols-1";
  return "grid grid-cols-2 gap-1.5";
};

// Facts grid cell count, computed from present facts only.
const factCount = computed(() => {
  if (!brand.value) return 0;
  let count = 0;
  if (brand.value.booth_number) count++;
  if (brand.value.business_categories?.length) count++;
  return count;
});

// A brand carrying nothing but its name (and maybe a logo).
const isNameOnly = computed(
  () =>
    !!brand.value &&
    !brand.value.brand_description &&
    !hasPromotions.value &&
    factCount.value === 0 &&
    !brand.value.links?.length,
);

// --- Restrained reveal motion (CSS-driven, reduced-motion safe) ---
const mounted = ref(false);
const postRefs = ref([]);
let observer = null;

onMounted(() => {
  requestAnimationFrame(() => {
    mounted.value = true;
  });

  if (typeof IntersectionObserver !== "undefined") {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );

    nextTick(() => {
      (postRefs.value || []).forEach((el) => el && observer.observe(el));
    });
  } else {
    // No IntersectionObserver: reveal every post immediately.
    nextTick(() => {
      (postRefs.value || []).forEach((el) => el && el.classList.add("in"));
    });
  }
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});
</script>

<style scoped>
.reveal {
  opacity: 0;
  transform: translateY(0.25rem);
  transition:
    opacity 0.4s ease-out,
    transform 0.4s ease-out;
}

.reveal.in {
  opacity: 1;
  transform: translateY(0);
}

.reveal-up {
  opacity: 0;
  transform: translateY(0.25rem);
  transition:
    opacity 0.4s ease-out,
    transform 0.4s ease-out;
}

.reveal-up.in {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .reveal,
  .reveal.in,
  .reveal-up,
  .reveal-up.in {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
