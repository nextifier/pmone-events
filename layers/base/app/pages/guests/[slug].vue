<template>
  <div class="min-h-screen-offset pt-6 pb-14 lg:pt-8 lg:pb-20">
    <div class="container flex items-center justify-between lg:max-w-screen-lg">
      <ButtonBack />
      <DialogShare v-if="guest" :pageTitle="guest.name" />
    </div>

    <div v-if="pending" class="container mt-6 lg:max-w-screen-lg">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton class="aspect-[4/5] rounded-2xl" />
        <div class="space-y-4">
          <Skeleton class="h-12 w-3/4 rounded" />
          <Skeleton class="h-5 w-1/2 rounded" />
          <Skeleton class="h-32 w-full rounded" />
        </div>
      </div>
    </div>

    <div v-else-if="error" class="container mt-12 text-center">
      <h1 class="text-2xl font-semibold tracking-tight">{{ $t("ui.failedToGetData") }}</h1>
    </div>

    <div v-else-if="guest" class="container mt-6 sm:container lg:mt-12 lg:max-w-screen-lg">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div class="bg-muted relative aspect-[4/5] overflow-hidden rounded-2xl">
          <BlurImage
            v-if="guest.profile_image?.lg || guest.profile_image?.md || guest.profile_image?.original"
            :src="guest.profile_image.lg || guest.profile_image.md || guest.profile_image.original"
            :lqip="guest.profile_image.lqip || ''"
            :alt="guest.profile_image.alt || guest.name"
            image-class="size-full object-cover"
          />
        </div>

        <div class="flex flex-col items-center px-4 sm:px-0 lg:items-start lg:pt-10">
          <h1
            class="text-center text-4xl font-semibold tracking-tighter sm:text-5xl lg:text-left"
          >
            {{ guest.name }}
          </h1>

          <p
            v-if="guest.title"
            class="mt-2 text-center text-base tracking-tight text-pretty sm:text-lg lg:text-left"
          >
            {{ guest.title }}
          </p>

          <p
            v-if="guest.organization"
            class="text-muted-foreground mt-1 text-center text-sm tracking-tight lg:text-left"
          >
            {{ guest.organization }}
          </p>

          <div v-if="guest.tags?.length" class="mt-3 flex flex-wrap justify-center gap-1.5 lg:justify-start">
            <span
              v-for="tag in guest.tags"
              :key="tag"
              class="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs tracking-tight"
            >
              {{ tag }}
            </span>
          </div>

          <div v-if="guest.links?.length" class="mt-5 flex flex-wrap gap-2">
            <SocialLink
              v-for="link in guest.links"
              :key="`${link.label}-${link.url}`"
              :to="link.url"
              :label="link.label"
              :iconName="iconForLabel(link.label)"
            />
          </div>

          <div
            v-if="guest.bio"
            class="mt-6 w-full text-base leading-normal tracking-tight text-pretty sm:text-lg"
            v-html="guest.bio"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const router = useRouter();

const { data, pending, error } = await useGuest(route.params.slug);
const guest = computed(() => data.value?.data ?? null);

if (!pending.value && !guest.value && !error.value) {
  throw createError({ statusCode: 404, statusMessage: "Guest not found" });
}

usePageMeta("", {
  title: () => (guest.value ? `${guest.value.name}` : "Guest"),
  description: () => guest.value?.organization || "",
});



function iconForLabel(label) {
  const map = {
    Website: "hugeicons:globe-02",
    LinkedIn: "hugeicons:linkedin-02",
    Instagram: "hugeicons:instagram",
    Facebook: "hugeicons:facebook-01",
    X: "hugeicons:new-twitter",
    Twitter: "hugeicons:new-twitter",
    YouTube: "hugeicons:youtube",
    TikTok: "hugeicons:tiktok",
  };
  return map[label] || "hugeicons:link-01";
}
</script>
