<template>
  <div v-if="filteredPosts?.length" class="space-y-4 sm:space-y-6">
    <div class="container">
      <h2 class="section-title">{{ headlineText }}</h2>
    </div>

    <Carousel
      v-if="filteredPosts?.length"
      v-slot="{ scrollPrev, scrollNext, canScrollPrev, canScrollNext }"
      class="focusable relative overflow-hidden"
      :opts="{
        loop: false,
        align: 'center',
        dragFree: false,
        skipSnaps: true,
      }"
      :plugins="[$wheelGesturesPlugin()]"
    >
      <CarouselContent class="carousel-mx -ml-2 *:select-none">
        <CarouselItem
          v-for="(post, index) in filteredPosts.slice(0, 20)"
          :key="index"
          class="carousel-item basis-[280px] pl-2 lg:basis-[320px]"
        >
          <BlogPostCard :post="post" />
        </CarouselItem>
      </CarouselContent>

      <div class="mt-6 h-8">
        <div
          v-if="canScrollPrev || canScrollNext"
          class="container flex h-full justify-end"
        >
          <ButtonGroup>
            <Button
              variant="outline"
              size="iconSm"
              :disabled="!canScrollPrev"
              aria-label="previous"
              @click="scrollPrev"
            >
              <Icon name="lucide:arrow-left" class="size-4" />
            </Button>
            <Button
              variant="outline"
              size="iconSm"
              :disabled="!canScrollNext"
              aria-label="next"
              @click="scrollNext"
            >
              <Icon name="lucide:arrow-right" class="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              class="font-medium"
              :to="localePath('/news')"
            >
              {{ $t('ui.viewAll') }}
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </Carousel>
  </div>
</template>

<script setup>
const { t } = useI18n();
const localePath = useLocalePath();
const props = defineProps({
  headline: {
    type: String,
    default: null,
  },
});
const headlineText = computed(() => props.headline || t('news.latestUpdates'));
const route = useRoute();

// Use Pinia store - data is cached and shared across components
const postStore = usePostStore();

// Fetch posts on component mount (works for both SSR and client-side).
//
// Return `true`, NOT `postStore.posts`: useAsyncData serializes its return
// value into the __NUXT_DATA__ payload, and the store state is serialized by
// Pinia as well — returning the posts shipped the same ~70 KB twice on every
// SSR page (measured on megabuild's home: 69.8 KB data + 70.1 KB pinia).
// Nothing reads this asyncData's value; `filteredPosts` below reads the store.
// The useAsyncData wrapper only exists so SSR awaits the fetch exactly once.
await useAsyncData("post-slider-posts", async () => {
  await postStore.fetchPosts();
  return true;
});

const filteredPosts = computed(() => {
  const posts = Array.isArray(postStore.posts) ? postStore.posts : [];
  return route?.params?.slug
    ? posts.filter((post) => post.slug !== route.params.slug)
    : posts;
});
</script>
