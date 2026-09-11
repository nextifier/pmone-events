<template>
  <div>
    <!-- Loading skeleton. Its grid classes must match the real grid below
         verbatim, and each tile the poster frame, or the grid jumps the moment
         the posters land. Two full rows at every breakpoint: 2 tiles in one
         column, 4 in two, 6 in three. -->
    <div
      v-if="loading"
      class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 2xl:grid-cols-3"
    >
      <Skeleton
        v-for="i in 6"
        :key="`sk-${i}`"
        :class="[
          'w-full rounded-xl sm:rounded-2xl',
          i > 4 ? 'hidden 2xl:block' : i > 2 ? 'hidden sm:block' : '',
        ]"
        :style="{ aspectRatio }"
      />
    </div>

    <!-- Posters: GuestCard's photo tile without the caption, so gap-y matches
         gap-x. One Lightbox over the grid, so its arrows walk every poster. -->
    <Lightbox
      v-else
      :items="lightboxItems"
      :show-thumbnails="false"
      full-key="xl"
      :alt="t('rundown.posterAlt', { n: 1 })"
    >
      <template #trigger="{ openAt }">
        <div
          class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 2xl:grid-cols-3"
        >
          <TiltCard
            v-for="(poster, index) in posters"
            :key="poster.id"
            class="bg-muted relative isolate w-full overflow-hidden rounded-xl sm:rounded-2xl"
            :style="{ aspectRatio }"
          >
            <button
              type="button"
              class="absolute inset-0 z-10 cursor-zoom-in"
              :aria-label="t('rundown.viewPoster', { n: index + 1 })"
              @click="openAt(index)"
            >
              <BlurImage
                :src="posterSrc(poster)"
                :srcset="posterSrcset(poster.image, aspectRatio)"
                :sizes="POSTER_SIZES"
                :lqip="poster.image?.lqip || ''"
                :alt="t('rundown.posterAlt', { n: index + 1 })"
                image-class="size-full object-cover select-none outline-inside rounded-xl sm:rounded-2xl"
              />
            </button>
          </TiltCard>
        </div>
      </template>
    </Lightbox>
  </div>
</template>

<script setup lang="ts">
type RundownPosterImage = {
  url?: string;
  lqip?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  width?: number;
  height?: number;
};

type RundownPoster = { id: number; image: RundownPosterImage | null };

/**
 * Rundown posters, for events whose rundown is a set of images (the posters
 * the team already published on Instagram) instead of typed items. The tiles
 * are GuestCard's photo, one to one, in a wider grid: posters carry text.
 */
const props = withDefaults(
  defineProps<{
    posters?: RundownPoster[];
    /** CSS aspect-ratio of the poster frame, e.g. "3 / 4". */
    aspectRatio?: string;
    loading?: boolean;
  }>(),
  { posters: () => [], aspectRatio: "4 / 5", loading: false },
);

const { t } = useI18n();

// PM One's RundownPoster conversions (RundownPoster::registerMediaConversions):
// width-bound, never upscaled, height capped at twice the width. Change both
// together.
const POSTER_WIDTHS = { sm: 360, md: 720, lg: 1080, xl: 1440 } as const;

// The tile's width at each breakpoint of the grid above: `container` (the
// breakpoint's width, 16px padding a side) split into 1, 2 or 3 columns.
const POSTER_SIZES = [
  "(min-width: 1600px) 512px",
  "(min-width: 1500px) 479px",
  "(min-width: 1280px) 616px",
  "(min-width: 1024px) 488px",
  "(min-width: 768px) 360px",
  "(min-width: 640px) 296px",
  "(min-width: 540px) 508px",
  "calc(100vw - 2rem)",
].join(", ");

/**
 * srcset with each file's real width, worked out from the ladder and the
 * original's size. A poster wider than its frame is cropped at the sides
 * (object-cover), so only part of each file's width reaches the tile; the
 * descriptor counts that part, and the browser still takes enough pixels for
 * the slot POSTER_SIZES names. Ungenerated conversions fall back to the
 * original's URL server-side, so repeats are dropped.
 */
function posterSrcset(
  image: RundownPosterImage | null,
  frame: string,
): string | undefined {
  if (!image) return undefined;

  const { width: srcW = 0, height: srcH = 0 } = image;
  const [fw, fh] = frame.split(/[:/]/).map(Number);
  const frameRatio = fw && fh ? fw / fh : 4 / 5;
  const visible = srcW && srcH ? Math.min(1, frameRatio / (srcW / srcH)) : 1;

  const seen = new Set<string>();
  const candidates: string[] = [];

  for (const [key, width] of Object.entries(POSTER_WIDTHS)) {
    const url = image[key as keyof typeof POSTER_WIDTHS];
    const real =
      srcW && srcH
        ? srcW * Math.min(1, width / srcW, (2 * width) / srcH)
        : width;
    const descriptor = `${Math.round(real * visible)}w`;
    if (!url || seen.has(url) || seen.has(descriptor)) continue;
    seen.add(url).add(descriptor);
    candidates.push(`${url} ${descriptor}`);
  }

  return candidates.length > 1 ? candidates.join(", ") : undefined;
}

// md is only the fallback; the srcset lets the browser pick the conversion
// that fits the tile. The Lightbox opens xl.
const posterSrc = (poster: RundownPoster) =>
  poster.image?.md || poster.image?.lg || poster.image?.url || "";

const lightboxItems = computed(() =>
  props.posters.map((poster, index) => {
    const image = poster.image ?? {};
    return {
      sm: image.md || image.url,
      md: image.md || image.url,
      lg: image.lg || image.url,
      xl: image.xl || image.lg || image.url,
      url: image.url,
      lqip: image.lqip,
      alt: t("rundown.posterAlt", { n: index + 1 }),
    };
  }),
);
</script>
