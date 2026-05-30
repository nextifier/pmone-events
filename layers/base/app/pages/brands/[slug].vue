<template>
  <div class="space-y-8 pt-4 pb-20">
    <!-- Top bar: back + share (matching icon buttons) -->
    <div class="container flex items-center justify-between">
      <ButtonBack destination="/brands" v-slot="{ goBack }">
        <button
          type="button"
          class="text-primary lg:hover:bg-muted bg-background border-border flex items-center justify-center gap-x-1 rounded-full border p-3 transition active:scale-98 lg:border-0"
          v-ripple
          @click="goBack"
        >
          <Icon name="lucide:arrow-left" class="size-4 shrink-0" />
          <span class="hidden text-sm tracking-tight lg:block">Back</span>
        </button>
      </ButtonBack>

      <DialogShare :pageTitle="title" />
    </div>

    <!-- Loading skeleton -->
    <div v-if="pending && !brand" class="container">
      <div class="lg:grid lg:grid-cols-12 lg:gap-12">
        <div class="flex flex-col items-center lg:col-span-5 lg:items-start">
          <Skeleton class="size-28 rounded-full sm:size-32 lg:size-36" />
          <Skeleton class="mt-6 h-12 w-3/4 rounded-2xl lg:h-14" />
          <Skeleton class="mt-3 h-5 w-1/3" />
        </div>
        <div class="mt-10 space-y-3 lg:col-span-7 lg:mt-0">
          <Skeleton class="h-5 w-full" />
          <Skeleton class="h-5 w-11/12" />
          <Skeleton class="h-5 w-4/5" />
        </div>
      </div>
    </div>

    <template v-else-if="brand">
      <div class="container">
        <div class="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <!-- Left rail: identity + facts (centered on mobile, top-left on desktop) -->
          <div
            class="lg:no-scrollbar flex flex-col items-center py-0 text-center *:shrink-0 lg:sticky lg:top-24 lg:col-span-6 lg:max-h-[calc(100dvh-6rem)] lg:items-start lg:self-start lg:overflow-y-auto lg:text-left"
          >
            <!-- Avatar (opens the logo; Instagram gradient frame when present) -->
            <Lightbox
              v-if="brand.brand_logo"
              :items="logoLightboxItems"
              fullKey="xl"
              :show-thumbnails="false"
              :show-counter="false"
            >
              <template #trigger="{ open }">
                <button
                  type="button"
                  class="focus-visible:ring-ring block w-fit rounded-full p-2 transition focus-visible:ring-2 focus-visible:outline-none active:scale-[0.98]"
                  @click="open"
                >
                  <Avatar
                    :model="{
                      name: brand.brand_name,
                      profile_image: brand.brand_logo,
                    }"
                    size="xl"
                    class="size-28 sm:size-32 lg:size-36"
                    rounded="rounded-full"
                    :colorful="false"
                    :gradient-frame="!!instagramLink"
                  />
                </button>
              </template>
            </Lightbox>

            <Avatar
              v-else
              :model="{
                name: brand.brand_name,
                profile_image: brand.brand_logo,
              }"
              size="xl"
              class="size-28 sm:size-32 lg:size-36"
              rounded="rounded-full"
              :colorful="false"
              :gradient-frame="!!instagramLink"
            />

            <!-- Name -->
            <h1
              class="text-foreground mt-6 text-4xl leading-[0.95] font-semibold tracking-tighter text-balance sm:text-5xl"
            >
              {{ brand.brand_name }}
            </h1>

            <!-- Company -->
            <p
              v-if="brand.company_name"
              class="text-muted-foreground mt-2 text-base tracking-tight lg:text-lg"
            >
              {{ brand.company_name }}
            </p>

            <!-- Links -->
            <div
              v-if="brand.links?.length"
              class="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 lg:justify-start"
            >
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

            <!-- Facts: booth + categories + custom fields (one grid) -->
            <GridFill
              v-if="factCount > 0"
              :count="factCount"
              :cols="2"
              min-col-width="150px"
              rounded="xl"
              class="mt-4 w-full"
            >
              <div
                v-if="brand.booth_number"
                class="flex flex-col gap-1 px-4 py-4"
              >
                <span class="text-muted-foreground text-sm tracking-tight">
                  {{ $t("ui.booth") }}
                </span>
                <span
                  class="text-foreground text-lg leading-tight font-medium tracking-tighter"
                >
                  {{ brand.booth_number }}
                </span>
              </div>

              <div
                v-if="brand.business_categories?.length"
                class="flex flex-col gap-1 px-4 py-4"
              >
                <span class="text-muted-foreground text-sm tracking-tight">
                  {{ $t("ui.categories") }}
                </span>
                <span
                  class="text-foreground text-lg leading-tight font-medium tracking-tighter text-balance"
                >
                  {{ brand.business_categories.join(", ") }}
                </span>
              </div>

              <div
                v-for="field in customFields"
                :key="field.key"
                class="flex flex-col gap-1 px-4 py-4"
              >
                <span class="text-muted-foreground text-sm tracking-tight">
                  {{ field.label }}
                </span>
                <span
                  class="text-foreground text-lg leading-tight font-medium tracking-tighter"
                >
                  {{ field.value }}
                </span>
              </div>
            </GridFill>
          </div>

          <!-- Right content: description + promotions -->
          <div class="lg:col-span-6">
            <!-- Description -->
            <div
              v-if="brand.brand_description"
              v-html="brand.brand_description"
              class="text-foreground dark:text-body max-w-2xl text-lg font-medium tracking-tight text-pretty lg:text-xl [&_a]:underline [&_p:not(:first-child)]:mt-4"
            />

            <!-- Promotions feed -->
            <div
              v-if="hasPromotions"
              :class="[
                'mx-auto max-w-2xl space-y-14 lg:mx-0',
                brand.brand_description ? 'mt-14 lg:mt-16' : '',
              ]"
            >
              <article
                v-for="(promo, promoIndex) in postsWithImages"
                :key="promoIndex"
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
                      :model="{
                        name: brand.brand_name,
                        profile_image: brand.brand_logo,
                      }"
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
                    class="text-foreground font-semibold tracking-tight"
                    @click="instagramLink && trackClick('Instagram')"
                  >
                    {{ instagramUsername ?? brand.brand_name }}
                  </component>

                  <span
                    v-if="promo.created_at"
                    class="text-muted-foreground ml-auto text-sm tracking-tight"
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
                  class="text-foreground mt-3 text-base tracking-tight sm:text-lg"
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

            <!-- Minimal state: a brand with only a name -->
            <div
              v-if="isNameOnly"
              class="mt-12 flex justify-center lg:mt-0 lg:justify-start"
            >
              <Button to="/brands" variant="outline" size="lg">
                {{ $t("ui.viewAllBrands") }}
              </Button>
            </div>
          </div>
        </div>

        <!-- Event context -->
        <!-- <div v-if="brand.event_title" class="mt-6 flex items-center gap-x-2.5">
          <div
            class="bg-muted aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-lg"
          >
            <img
              v-if="brand.event_poster"
              :src="brand.event_poster.md || brand.event_poster.sm"
              :alt="brand.event_poster.alt || brand.event_title"
              class="size-full object-cover"
              loading="lazy"
            />
          </div>

          <div class="flex flex-col gap-y-1 text-left">
            <span class="text-foreground font-medium tracking-tight">
              {{ brand.event_title }}
            </span>
            <span
              v-if="
                brand.event_date_label ||
                brand.event_location ||
                brand.event_hall
              "
              class="text-muted-foreground text-sm tracking-tight"
            >
              <template
                v-for="(part, i) in [
                  brand.event_date_label,
                  brand.event_location,
                  brand.event_hall,
                ].filter(Boolean)"
                :key="i"
              >
                <span v-if="i > 0" class="px-1.5">·</span>{{ part }}
              </template>
            </span>
          </div>
        </div> -->
      </div>

      <!-- Related brands -->
      <BrandRelated :brands="brand.related_brands" class="mt-16 lg:mt-24" />
    </template>
  </div>
</template>

<script setup>
const route = useRoute();
const config = useRuntimeConfig();

const { $dayjs } = useNuxtApp();

const { data: brand, pending } = await useFetch(
  `/api/exhibitors/${route.params.slug}`,
  {
    transform: (res) => res.data,
  },
);

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

const humanizeKey = (key) =>
  String(key)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());

const customFields = computed(() => {
  const fields = brand.value?.custom_fields;
  if (!fields || typeof fields !== "object") return [];
  return Object.entries(fields)
    .filter(
      ([, value]) => value !== null && value !== undefined && value !== "",
    )
    .map(([key, value]) => ({
      key,
      label: humanizeKey(key),
      value: String(value),
    }));
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

// Single-item Lightbox for the brand logo.
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

// Facts count, computed from present facts only.
const factCount = computed(() => {
  if (!brand.value) return 0;
  let count = 0;
  if (brand.value.booth_number) count++;
  if (brand.value.business_categories?.length) count++;
  count += customFields.value.length;
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
</script>
