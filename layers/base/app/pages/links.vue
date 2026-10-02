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
        <Icon name="solar:home-smile-linear" class="size-5 shrink-0" />
        <span>Back to home</span>
      </Button>
    </div>

    <!-- Same profile layout as the PM One user profile: cover, avatar notched
         into it, left-aligned name, contact buttons, social icons, then links. -->
    <div
      v-else-if="profile"
      class="min-h-screen-offset mx-auto flex max-w-xl flex-col px-4 pb-16 sm:pt-4"
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
          <div class="relative -mx-4">
            <div
              class="bg-muted outline-foreground/5 relative aspect-[3/1] overflow-hidden outline -outline-offset-1 sm:rounded-xl"
            >
              <img
                v-if="hasCoverImage"
                :src="profile.cover_image.md"
                :alt="`${profile.name} cover`"
                class="size-full object-cover"
                width="1500"
                height="500"
                fetchpriority="high"
              />
              <img
                v-else-if="profile.profile_image?.sm"
                :src="profile.profile_image.sm"
                alt=""
                class="size-full scale-110 object-cover blur-2xl"
                width="200"
                height="200"
              />
            </div>
          </div>

          <div class="relative isolate -mt-12 ml-[5px] w-fit lg:-mt-16">
            <component
              :is="hasProfileImage ? 'button' : 'div'"
              :type="hasProfileImage ? 'button' : undefined"
              :aria-label="
                hasProfileImage ? `View ${profile.name} logo` : undefined
              "
              class="ring-background block rounded-full ring-[9px]"
              :class="
                hasProfileImage ? 'cursor-zoom-in transition active:scale-98' : ''
              "
              @click="hasProfileImage && openAt(0)"
            >
              <Avatar
                :model="profile"
                size="md"
                rounded="rounded-full"
                :gradient-frame="true"
                :no-tooltip="true"
                class="size-24 lg:size-32 before:-inset-[5px]!"
              />
            </component>

            <span
              class="absolute top-1/2 right-0 z-[-1] size-8 translate-x-[calc(100%+9px)] -translate-y-full rounded-bl-[16px] bg-transparent shadow-[-16px_16px_0_var(--color-background)]"
              aria-hidden="true"
            />
          </div>
        </template>
      </Lightbox>

      <div class="mt-3 flex grow flex-col gap-y-6">
        <div class="flex flex-col items-start gap-y-2">
          <h1
            class="text-foreground line-clamp-2 text-xl font-semibold tracking-tighter"
          >
            {{ profile.name }}
          </h1>

          <div
            v-if="hasContactMethods"
            class="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-2.5"
          >
            <Button
              v-if="phoneNumbers.length === 1"
              :to="`https://wa.me/${phoneNumbers[0].number.replace(/\D/g, '')}`"
              @click="trackClick(phoneNumbers[0].label || 'WhatsApp')"
              @contextmenu.prevent
            >
              <Icon
                name="hugeicons:whatsapp"
                class="size-5 shrink-0"
                aria-hidden="true"
              />
              <span>{{ phoneNumbers[0].label || "WhatsApp" }}</span>
            </Button>

            <DropdownMenu v-else-if="phoneNumbers.length > 1" :modal="false">
              <DropdownMenuTrigger as-child>
                <Button>
                  <Icon
                    name="hugeicons:whatsapp"
                    class="size-5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>WhatsApp</span>
                  <Icon
                    name="solar:alt-arrow-down-linear"
                    class="size-4 shrink-0"
                    aria-hidden="true"
                  />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" class="w-auto min-w-48">
                <DropdownMenuItem
                  v-for="phone in phoneNumbers"
                  :key="phone.number"
                  as-child
                  class="gap-x-2"
                >
                  <NuxtLink
                    :to="`https://wa.me/${phone.number.replace(/\D/g, '')}`"
                    target="_blank"
                    rel="noopener"
                    @click="trackClick(phone.label || 'WhatsApp')"
                  >
                    <Icon
                      name="hugeicons:whatsapp"
                      class="size-5 shrink-0"
                      aria-hidden="true"
                    />
                    <span class="truncate">{{
                      phone.label || phone.number
                    }}</span>
                  </NuxtLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              v-if="profile.email"
              variant="secondary"
              :to="`mailto:${profile.email}`"
              @click="trackClick('Email')"
              @contextmenu.prevent
            >
              <Icon
                name="solar:letter-linear"
                class="size-5 shrink-0"
                aria-hidden="true"
              />
              <span>Email</span>
            </Button>
          </div>
        </div>

        <div
          v-if="linkGroups.social.length > 0"
          class="flex flex-wrap items-center gap-x-1.5 gap-y-2.5"
        >
          <Button
            v-for="link in linkGroups.social"
            :key="link.url || link.id"
            variant="secondary"
            size="icon"
            :to="link.url || '#'"
            :aria-label="link.label"
            v-tippy="link.label"
            @click="trackClick(link.label)"
            @contextmenu.prevent
          >
            <Icon
              :name="getSocialIcon(link.label)"
              class="size-5 shrink-0"
              aria-hidden="true"
            />
          </Button>
        </div>

        <div class="flex flex-col gap-y-2">
          <Button
            v-for="link in stackedLinks"
            :key="link.key"
            variant="secondary"
            class="w-full"
            :to="link.url || '#'"
            @click="trackClick(link.label)"
            @contextmenu.prevent
            v-ripple
          >
            <Icon
              :name="link.iconName"
              class="size-5 shrink-0"
              aria-hidden="true"
            />
            <span>{{ link.label }}</span>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// A link-in-bio page stands on its own, without the site's tab bar.
definePageMeta({ bottomNav: false });

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
  website: "solar:global-linear",
  instagram: "hugeicons:instagram",
  facebook: "hugeicons:facebook-01",
  x: "hugeicons:new-twitter-rectangle",
  tiktok: "hugeicons:tiktok",
  linkedin: "hugeicons:linkedin-01",
  youtube: "hugeicons:youtube",
};

const route = useRoute();

const {
  data: projectData,
  error: profileError,
  refresh: refreshProfile,
} = await useFetch("/api/project/profile", { key: "links-project-profile" });

// The shared handle (same key and options as the header and footer), so the
// page reads the one `active-event` entry instead of registering a second one.
const { data: activeEvent, error: activeEventError } = await useEventData();

// Prerendered with both payloads: refresh them once the page is interactive so
// an edit made after the build (a new E-Guide, say) shows without a rebuild.
// The shared handle serves its cached copy on every refresh, so the event is
// fetched directly and a failure keeps the build-time copy.
useRefreshAfterPrerender({
  data: projectData,
  error: profileError,
  refresh: refreshProfile,
});
useRefreshAfterPrerender({
  data: activeEvent,
  error: activeEventError,
  refresh: async () => {
    try {
      activeEvent.value = await $fetch("/api/event/active");
    } catch {
      /* keep the build-time copy */
    }
  },
});

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
      iconName: "solar:ticket-linear",
    },
    {
      key: "brands",
      label: "Brands",
      url: "/brands",
      iconName: "solar:shop-2-linear",
    },
    {
      key: "rundown",
      label: "Rundown",
      url: "/rundown",
      iconName: "solar:clipboard-list-linear",
    },
  ];

  const eguideUrl = activeEvent.value?.data?.visitor_eguide?.url;
  if (eguideUrl) {
    items.push({
      key: "eguide",
      label: "Visitor E-Guide",
      url: eguideUrl,
      iconName: "solar:download-minimalistic-linear",
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
    return "solar:download-minimalistic-linear";
  if (
    lower.includes("map") ||
    lower.includes("location") ||
    lower.includes("venue")
  )
    return "solar:map-point-linear";
  if (lower.includes("register") || lower.includes("sign up"))
    return "solar:user-plus-linear";
  return "solar:link-round-linear";
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
  SOCIAL_ICON_MAP[label?.toLowerCase()] || "solar:link-round-linear";

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
