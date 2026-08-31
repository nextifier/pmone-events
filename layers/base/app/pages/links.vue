<template>
  <div>
    <div v-if="loading" class="min-h-screen-offset grid place-items-center">
      <Spinner class="size-5 shrink-0" />
    </div>

    <div
      v-else-if="profileError"
      class="min-h-screen-offset mx-auto flex max-w-md flex-col items-center justify-center gap-y-3 px-4 text-center"
    >
      <Icon
        name="hugeicons:alert-circle"
        class="text-muted-foreground size-10 shrink-0"
      />
      <div class="space-y-1">
        <p class="text-base font-medium tracking-tight">
          Unable to load profile
        </p>
        <p class="text-muted-foreground text-sm tracking-tight">
          {{ profileErrorMessage }}
        </p>
      </div>
      <Button to="/" variant="secondary" size="lg">
        <Icon name="hugeicons:home-01" class="size-4 shrink-0" />
        <span>Back to home</span>
      </Button>
    </div>

    <div
      v-else-if="profile"
      class="min-h-screen-offset mx-auto flex max-w-xl flex-col px-4 pb-12 sm:pt-2"
    >
      <Lightbox
        :items="profileImageItems"
        :show-thumbnails="false"
        :show-counter="false"
        :show-download="false"
        :show-caption="false"
        full-key="xl"
        :alt="profile.name"
      >
        <template #trigger="{ openAt }">
          <CardNotch
            v-if="hasCoverImage"
            position="bottom-center"
            size="5rem"
            gap="0.3rem"
            radius="1rem"
            card-bg="var(--color-background)"
            border-color="var(--color-border)"
            body-class="aspect-[3/1] @container overflow-hidden"
            class="-mx-3"
          >
            <div class="absolute inset-0 flex items-center justify-center">
              <img
                :src="profile.cover_image.md"
                :alt="`${profile.name} cover`"
                class="size-full object-cover"
                width="1500"
                height="500"
                loading="lazy"
              />
            </div>

            <template #notch>
              <component
                :is="hasProfileImage ? 'button' : 'div'"
                :type="hasProfileImage ? 'button' : undefined"
                :aria-label="
                  hasProfileImage ? `View ${profile.name} logo` : undefined
                "
                class="size-full rounded-full"
                :class="hasProfileImage ? 'cursor-zoom-in' : ''"
                @click="hasProfileImage && openAt(0)"
              >
                <Avatar
                  :model="profile"
                  size="md"
                  rounded="rounded-full"
                  :no-tooltip="true"
                  class="size-full"
                />
              </component>
            </template>
          </CardNotch>

          <div v-else class="flex justify-center pt-2 lg:pt-8">
            <component
              :is="hasProfileImage ? 'button' : 'div'"
              :type="hasProfileImage ? 'button' : undefined"
              :aria-label="
                hasProfileImage ? `View ${profile.name} logo` : undefined
              "
              :class="hasProfileImage ? 'cursor-zoom-in' : ''"
              @click="hasProfileImage && openAt(0)"
            >
              <Avatar
                :model="profile"
                size="md"
                rounded="rounded-full"
                :gradient-frame="true"
                :no-tooltip="true"
                class="size-20 before:-inset-[5px]!"
              />
            </component>
          </div>
        </template>
      </Lightbox>

      <div
        class="mt-4 flex grow flex-col justify-between gap-y-8 sm:justify-start"
      >
        <div class="flex flex-col gap-y-6">
          <div class="flex flex-col items-center gap-y-2 text-center">
            <div class="space-y-0.5">
              <h1
                class="text-foreground line-clamp-2 text-xl font-semibold tracking-tighter"
              >
                {{ profile.name }}
              </h1>
            </div>

            <div
              v-if="hasContactMethods"
              class="mt-1.5 flex flex-wrap justify-center gap-x-2 gap-y-3"
            >
              <Button
                variant="default"
                size="default"
                v-for="phone in phoneNumbers"
                :key="phone.number"
                :to="`https://wa.me/${phone.number.replace(/\D/g, '')}`"
                @click="trackClick(phone.label || 'WhatsApp')"
                @contextmenu.prevent
              >
                <Icon name="hugeicons:whatsapp" class="size-4.5 shrink-0" />
                <span>{{ phone.label || "WhatsApp" }}</span>
              </Button>

              <Button
                variant="secondary"
                size="default"
                v-if="profile.email"
                :to="`mailto:${profile.email}`"
                @click="trackClick('Email')"
                @contextmenu.prevent
              >
                <Icon name="hugeicons:mail-02" class="size-4.5 shrink-0" />
                <span>Email</span>
              </Button>
            </div>
          </div>

          <div
            v-if="linkGroups.social.length > 0"
            class="flex flex-wrap justify-center gap-2"
          >
            <Button
              variant="secondary"
              size="iconLg"
              class="size-11 rounded-full"
              v-for="link in linkGroups.social"
              :key="link.url || link.id"
              :to="link.url || '#'"
              :aria-label="link.label"
              @click="trackClick(link.label)"
              @contextmenu.prevent
              v-tippy="link.label"
            >
              <Icon :name="getSocialIcon(link.label)" class="size-5" />
            </Button>
          </div>
        </div>

        <div class="mx-auto flex w-full max-w-[400px] flex-col gap-y-3">
          <Button
            variant="secondary"
            size="xl"
            v-for="link in stackedLinks"
            :key="link.key"
            :to="link.url || '#'"
            @click="trackClick(link.label)"
            @contextmenu.prevent
            v-ripple
          >
            <Icon :name="link.iconName" class="size-4.5 shrink-0" />
            <span>{{ link.label }}</span>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const SOCIAL_LABELS = [
  "website",
  "instagram",
  "facebook",
  "x",
  "tiktok",
  "linkedin",
  "youtube",
];

const SOCIAL_ICON_MAP = {
  website: "hugeicons:globe-02",
  instagram: "hugeicons:instagram",
  facebook: "hugeicons:facebook-01",
  x: "hugeicons:new-twitter-rectangle",
  tiktok: "hugeicons:tiktok",
  linkedin: "hugeicons:linkedin-01",
  youtube: "hugeicons:youtube",
};

const route = useRoute();

const [{ data: projectData, error: profileError }, { data: activeEvent }] =
  await Promise.all([
    useFetch("/api/project/profile", { key: "links-project-profile" }),
    useFetch("/api/event/active", { key: "active-event" }),
  ]);

const loading = computed(() => !projectData.value && !profileError.value);
const profile = computed(() => projectData.value?.data || null);

const profileErrorMessage = computed(() => {
  if (!profileError.value) return "";
  const status = profileError.value.statusCode;
  if (status === 404) return "This event website is not available right now.";
  if (status === 504)
    return "The server took too long to respond. Please try again.";
  return "Something went wrong. Please refresh the page or try again later.";
});

const hasCoverImage = computed(() => Boolean(profile.value?.cover_image?.md));
const hasProfileImage = computed(() => Boolean(profile.value?.profile_image));

const profileImageItems = computed(() => {
  const img = profile.value?.profile_image;
  if (!img) return [];
  return [
    {
      sm: img.sm,
      md: img.md,
      lg: img.lg,
      xl: img.xl,
      url: img.url,
      name: profile.value?.name,
      alt: profile.value?.name,
    },
  ];
});

const phoneNumbers = computed(() => {
  const phones = profile.value?.phone;
  return Array.isArray(phones) ? phones.filter((p) => p?.number) : [];
});

const hasContactMethods = computed(() => {
  return phoneNumbers.value.length > 0 || Boolean(profile.value?.email);
});

const linkGroups = computed(() => {
  const links = profile.value?.links || [];
  const social = [];
  const custom = [];

  for (const link of links) {
    if (!link?.label) continue;

    const labelLower = link.label.toLowerCase();
    // Email and any WhatsApp variant are already rendered as dedicated
    // contact buttons at the top via phoneNumbers / profile.email.
    if (labelLower === "email" || labelLower.startsWith("whatsapp")) continue;

    if (SOCIAL_LABELS.includes(labelLower)) {
      social.push(link);
    } else {
      custom.push(link);
    }
  }

  return { social, custom };
});

const stackedLinks = computed(() => {
  const items = [
    {
      key: "tickets",
      label: "Tickets",
      url: "/tickets",
      iconName: "hugeicons:ticket-01",
    },
    {
      key: "brands",
      label: "Brands",
      url: "/brands",
      iconName: "hugeicons:grid-view",
    },
    {
      key: "rundown",
      label: "Rundown",
      url: "/rundown",
      iconName: "hugeicons:check-list",
    },
  ];

  const eguideUrl = activeEvent.value?.data?.visitor_eguide?.url;
  if (eguideUrl) {
    items.push({
      key: "eguide",
      label: "Download Visitor E-Guide",
      url: eguideUrl,
      iconName: "hugeicons:download-01",
    });
  }

  for (const link of linkGroups.value.custom) {
    items.push({
      key: `custom-${link.id ?? link.url}`,
      label: link.label,
      url: link.url || "#",
      iconName: getCustomLinkIcon(link.label),
    });
  }

  return items;
});

const getCustomLinkIcon = (label) => {
  const lower = label?.toLowerCase() || "";
  if (lower.startsWith("whatsapp")) return "hugeicons:whatsapp";
  if (
    lower.includes("download") ||
    lower.includes("brochure") ||
    lower.includes("catalog")
  )
    return "hugeicons:download-01";
  if (
    lower.includes("map") ||
    lower.includes("location") ||
    lower.includes("venue")
  )
    return "hugeicons:location-01";
  if (lower.includes("register") || lower.includes("sign up"))
    return "hugeicons:user-add-01";
  return "hugeicons:link-04";
};

const qrCodeUrl = computed(() => {
  if (!import.meta.client) return "";
  return `${window.location.origin}${route.path}`;
});

// Resolved in setup, never inside a computed: a composable called lazily can run
// after the Nuxt instance is gone (NUXT_E1001). See the usePageMeta call below.
const appConfig = useAppConfig();

const qrCodeText = computed(() => {
  const siteUrl = appConfig.app.url
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  return `${siteUrl}${route.path}`;
});

const getSocialIcon = (label) =>
  SOCIAL_ICON_MAP[label?.toLowerCase()] || "hugeicons:link-02";

const { trackVisit, trackClick } = useProfileTracking(() => profile.value?.id);

watchEffect(() => {
  if (profile.value?.id) trackVisit();
});

// Title and description come from the content store's `pages.links`, like every
// other page, which makes them translated per locale and lets titleTemplate add
// " · <site name>" exactly once.
//
// This replaced a hand-rolled override that did two things wrong. It interpolated
// the profile name into the title, which rendered
// "Links · Keramika Indonesia · Keramika Indonesia" in production because the
// profile name and the site name are the same string on every project. And its
// description was a computed calling `useAppConfig()` behind a `||` — a Nuxt
// composable evaluated during renderSSRHead, after this component's setup context
// is gone, which throws NUXT_E1001. It only fired when the profile fetch returned
// nothing: never locally, but it did on the Cloudflare builder while api.pmone.id
// was under load, and it failed megabuild's deploy. Same bug that took
// /news/{slug} down in Jul 2026 — never call a composable inside a computed handed
// to a head API.
usePageMeta("links");
</script>
