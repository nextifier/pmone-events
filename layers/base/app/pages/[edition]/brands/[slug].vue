<template>
  <div class="space-y-4 pt-4 pb-20">
    <!-- Top bar: back + share (matching icon buttons) -->
    <div class="container flex items-center justify-between">
      <ButtonBack destination="/brands" v-slot="{ goBack }">
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
        <div class="grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-12">
          <!-- Left rail: identity + facts (centered on mobile, top-left on desktop) -->
          <div
            class="lg:no-scrollbar flex flex-col items-center py-0 text-center *:shrink-0 lg:sticky lg:top-24 lg:col-span-6 lg:max-h-[calc(100dvh-6rem)] lg:items-start lg:self-start lg:overflow-y-auto lg:text-left"
          >
            <!-- Avatar (opens the profile image; Instagram gradient frame when present) -->
            <Lightbox
              v-if="brand.profile_image ?? brand.brand_logo"
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
                      profile_image: brand.profile_image ?? brand.brand_logo,
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
                profile_image: brand.profile_image ?? brand.brand_logo,
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
              class="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 lg:justify-start"
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
              class="mt-8 w-full text-left"
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
                        profile_image: brand.profile_image ?? brand.brand_logo,
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

                <!-- Media: uncropped thumbnails that open the fullscreen viewer -->
                <Lightbox
                  :items="promo.images"
                  fullKey="xl"
                  rounded="rounded-2xl"
                  show-caption
                  show-counter
                  show-thumbnails
                >
                  <template #trigger="{ openAt }">
                    <!-- Single image: full width at its natural ratio -->
                    <button
                      v-if="promo.images.length === 1"
                      type="button"
                      class="bg-muted block w-full cursor-zoom-in overflow-hidden rounded-2xl"
                      @click="openAt(0)"
                    >
                      <img
                        :src="promoThumbSrc(promo.images[0])"
                        :alt="promoThumbAlt(promo.images[0], 0)"
                        class="h-auto w-full"
                        decoding="async"
                        draggable="false"
                      />
                    </button>

                    <!-- Multiple images: masonry columns so each image keeps
                         its natural ratio (no crop), stays fully rounded, and
                         leaves no muted gaps from equal-height grid rows. -->
                    <div v-else class="columns-2 gap-1.5">
                      <button
                        v-for="(image, imageIndex) in promo.images"
                        :key="imageIndex"
                        type="button"
                        class="mb-1.5 block w-full cursor-zoom-in break-inside-avoid overflow-hidden rounded-2xl"
                        @click="openAt(imageIndex)"
                      >
                        <img
                          :src="promoThumbSrc(image)"
                          :alt="promoThumbAlt(image, imageIndex)"
                          class="h-auto w-full"
                          decoding="async"
                          draggable="false"
                        />
                      </button>
                    </div>
                  </template>
                </Lightbox>

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
      </div>

      <!-- Related brands (only renders when the by-edition API returns any) -->
      <BrandRelated :brands="brand.related_brands" class="mt-16 lg:mt-24" />
    </template>
  </div>
</template>

<script setup>
const route = useRoute();

const { $dayjs } = useNuxtApp();

// Edition slug from the URL: the by-edition endpoint scopes the brand to a
// specific past/current edition rather than the live event.
const edition = route.params.edition;

// Staff preview: a brand opened from a force-shown listing would otherwise 404
// while that edition's brands switch is off.
const forceShowBrands = useForceShow("force-show-brands");

const { data: brand, pending } = await useFetch(
  `/api/exhibitors/by-edition/${edition}/${route.params.slug}`,
  {
    query: forceShowBrands.value ? { force_show_brands: 1 } : {},
    key: `brand-${edition}-${route.params.slug}${forceShowBrands.value ? "-forced" : ""}`,
    transform: (res) => res.data,
  },
);

if (!brand.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
  });
}

const title = computed(() => brand.value?.brand_name ?? "");
const description = computed(() => brand.value?.brand_description ?? "");

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

// Keys whose values are expected to be currency amounts (investment fee, price, etc).
const CURRENCY_KEY_RE =
  /(?:investment_?fee|^fee$|price|harga|biaya|investasi)/i;

// Compact Indonesian magnitude scale. Order matters: largest first.
const RUPIAH_SCALE = [
  { value: 1_000_000_000_000, unit: "triliun" },
  { value: 1_000_000_000, unit: "miliar" },
  { value: 1_000_000, unit: "juta" },
];

// Render a single integer rupiah amount as "Rp500 juta" / "Rp1,5 miliar".
// Returns null when the amount is below 1 juta (caller keeps the original token).
const compactRupiah = (amount) => {
  if (!Number.isFinite(amount) || amount < 1_000_000) return null;
  const scale = RUPIAH_SCALE.find((s) => amount >= s.value);
  if (!scale) return null;
  // Two decimals max, drop trailing zeros, comma as the Indonesian decimal mark.
  const compact = (amount / scale.value)
    .toFixed(2)
    .replace(/\.?0+$/, "")
    .replace(".", ",");
  return `Rp${compact} ${scale.unit}`;
};

// Turn a single token into a compact rupiah string when it looks like an amount.
// A token qualifies if it carries an "Rp" marker OR is a bare number >= 1.000.000.
// Anything else (or anything unparseable) is returned untouched.
const formatRupiahToken = (token, keyIsCurrency) => {
  if (token == null) return token;
  const raw = String(token);
  const trimmed = raw.trim();
  if (!trimmed) return raw;

  const hasRp = /rp/i.test(trimmed);
  // Strip currency marker + dot thousand separators, keep an optional decimal comma.
  const digits = trimmed
    .replace(/rp/gi, "")
    .replace(/\./g, "")
    .replace(/\s/g, "");
  const normalized = digits.replace(",", ".");
  const amount = Number(normalized);

  // Only act on currency-shaped tokens: an Rp marker, a currency-typed key,
  // or a bare magnitude that is clearly money (>= 1 juta).
  const looksLikeMoney = hasRp || keyIsCurrency || amount >= 1_000_000;
  if (!looksLikeMoney) return raw;

  const compact = compactRupiah(amount);
  return compact ?? raw; // unparseable / sub-juta -> keep original token
};

// Format a custom-field value: null-safe, preserves prefixes and ranges.
// - Leading comparator/prefix (">", "<", "±", "mulai dari", "from") is kept.
// - "A - B" ranges are formatted on both sides.
const formatCurrencyValue = (value, key) => {
  if (value == null) return value;
  const str = String(value);
  if (!str.trim()) return str;

  const keyIsCurrency = CURRENCY_KEY_RE.test(String(key ?? ""));

  // Quick reject: nothing money-shaped here, leave the field alone entirely.
  const hasRp = /rp/i.test(str);
  const hasBigNumber = /\d{1,3}(?:\.\d{3})+|\d{7,}/.test(str);
  if (!hasRp && !keyIsCurrency && !hasBigNumber) return str;

  // Capture a leading textual/symbolic prefix and re-attach it after formatting.
  const prefixMatch = str.match(/^\s*(>=|<=|>|<|±|~|mulai dari|from)\s*/i);
  const prefix = prefixMatch ? prefixMatch[0].trimEnd() + " " : "";
  const body = prefixMatch ? str.slice(prefixMatch[0].length) : str;

  // Range "A - B" (spaced hyphen without surrounding digits-glue).
  const rangeParts = body.split(/\s+-\s+/);
  if (rangeParts.length === 2) {
    const left = formatRupiahToken(rangeParts[0], keyIsCurrency);
    const right = formatRupiahToken(rangeParts[1], keyIsCurrency);
    return `${prefix}${left} - ${right}`;
  }

  return `${prefix}${formatRupiahToken(body, keyIsCurrency)}`;
};

const customFields = computed(() => {
  const fields = brand.value?.custom_fields;
  if (!fields) return [];

  // Current API shape: array of { key, label, value } formatted server-side.
  if (Array.isArray(fields)) {
    return fields
      .filter((f) => f && f.value != null && f.value !== "")
      .map((f) => ({
        key: f.key,
        label: f.label || humanizeKey(f.key),
        // Compact rupiah for currency-shaped values; everything else stays as-is.
        value: formatCurrencyValue(f.value, f.key),
      }));
  }

  // Legacy object shape { key: value } (kept for backward compatibility).
  if (typeof fields !== "object") return [];
  return Object.entries(fields)
    .filter(
      ([, value]) => value !== null && value !== undefined && value !== "",
    )
    .map(([key, value]) => ({
      key,
      label: humanizeKey(key),
      value: formatCurrencyValue(value, key),
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

// --- Design-specific derived state ---

// Single-item Lightbox for the brand avatar (profile image).
const logoLightboxItems = computed(() => {
  const image = brand.value?.profile_image ?? brand.value?.brand_logo;
  return image ? [image] : [];
});

// Promotion posts that actually carry images (the only ones we render).
const postsWithImages = computed(
  () => brand.value?.promotions?.filter((p) => p.images?.length) ?? [],
);

const hasPromotions = computed(() => postsWithImages.value.length > 0);

// Uncropped promo thumbnail src. Thumbnails display at most ~660px wide so lg
// is plenty (the fullscreen viewer still uses xl). These load eagerly in the
// template: a not-yet-loaded h-auto image collapses to 0px in the masonry,
// which would suppress native lazy-loading entirely.
const promoThumbSrc = (image) =>
  image?.lg || image?.md || image?.xl || image?.sm || image?.url || "";

// Alt text for a promo thumbnail, with safe fallbacks.
const promoThumbAlt = (image, i) =>
  image?.alt || `${brand.value?.brand_name ?? "Brand"} promotion ${i + 1}`;

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
