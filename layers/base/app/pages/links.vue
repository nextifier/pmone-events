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
      <Button
        to="/"
        class="bg-muted text-foreground hover:bg-border mt-2 flex items-center gap-x-1.5 rounded-lg px-3 py-2 text-sm font-medium tracking-tight transition active:scale-98"
      >
        <Icon name="hugeicons:home-01" class="size-4 shrink-0" />
        <span>Back to home</span>
      </Button>
    </div>

    <div
      v-else-if="profile"
      class="min-h-screen-offset mx-auto flex max-w-xl flex-col px-4 pb-12 sm:pt-2"
    >
      <CardNotch
        position="bottom-center"
        size="4rem"
        gap="0.2rem"
        card-bg="var(--color-background)"
        border-color="var(--color-border)"
        body-class="aspect-[3/1] @container overflow-hidden"
        class="-mx-3"
      >
        <div
          class="absolute inset-0 flex items-center justify-center"
          :style="
            !hasCoverImage && !hasProfileImage ? coverGradientStyle : undefined
          "
        >
          <img
            v-if="profile.cover_image?.md"
            :src="profile.cover_image.md"
            :alt="`${profile.name} cover`"
            class="size-full object-cover"
            width="1500"
            height="500"
            loading="lazy"
          />

          <img
            v-else-if="profile.profile_image?.sm"
            :src="profile.profile_image.sm"
            alt=""
            class="size-full scale-150 object-cover blur-[80px]"
            loading="lazy"
          />
        </div>

        <template #notch>
          <Avatar
            :model="profile"
            size="md"
            rounded="rounded-full"
            :no-tooltip="true"
            class="size-full"
          />
        </template>
      </CardNotch>

      <div class="mt-4 flex grow flex-col justify-between gap-y-8">
        <div class="flex flex-col gap-y-6">
          <div class="flex flex-col items-center gap-y-2 text-center">
            <div class="space-y-0.5">
              <h1 class="line-clamp-2 text-xl font-semibold tracking-tighter">
                {{ profile.name }}
              </h1>
            </div>

            <p
              v-if="profile.bio"
              class="text-sm leading-relaxed tracking-tight"
            >
              {{ profile.bio }}
            </p>

            <div v-if="hasContactMethods" class="mt-1.5 flex flex-wrap gap-2">
              <Button
                v-for="phone in phoneNumbers"
                :key="phone.number"
                :to="`https://wa.me/${phone.number.replace(/\D/g, '')}`"
                @click="trackClick(phone.label || 'WhatsApp')"
                @contextmenu.prevent
                class="bg-primary text-primary-foreground hover:bg-primary/80 flex items-center justify-center gap-x-1.5 rounded-lg px-3 py-2 text-sm font-semibold tracking-tight transition active:scale-98"
              >
                <Icon name="hugeicons:whatsapp" class="size-4.5 shrink-0" />
                <span>{{ phone.label || "WhatsApp" }}</span>
              </Button>

              <Button
                v-if="profile.email"
                :to="`mailto:${profile.email}`"
                @click="trackClick('Email')"
                @contextmenu.prevent
                class="bg-muted text-foreground hover:bg-border flex items-center justify-center gap-x-1.5 rounded-lg px-3 py-2 text-sm font-semibold tracking-tight transition active:scale-98"
              >
                <Icon name="hugeicons:mail-02" class="size-4.5 shrink-0" />
                <span>Email</span>
              </Button>
            </div>
          </div>

          <div v-if="linkGroups.social.length > 0" class="flex flex-wrap gap-2">
            <Button
              v-for="link in linkGroups.social"
              :key="link.url || link.id"
              :to="link.url || '#'"
              @click="trackClick(link.label)"
              @contextmenu.prevent
              v-tippy="link.label"
              class="bg-muted text-foreground hover:bg-border flex size-12 shrink-0 items-center justify-center rounded-full transition active:scale-98"
            >
              <Icon :name="getSocialIcon(link.label)" class="size-5" />
            </Button>
          </div>
        </div>

        <div class="flex flex-col gap-y-3">
          <Button
            variant="outline"
            class="bg-muted"
            v-for="link in stackedLinks"
            :key="link.key"
            :to="link.url || '#'"
            @click="trackClick(link.label)"
            @contextmenu.prevent
            v-ripple
          >
            <Icon :name="link.iconName" class="size-5 shrink-0" />
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
    useFetch("/api/event/active", { key: "links-active-event" }),
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

const hasCoverImage = computed(() => Boolean(profile.value?.cover_image));
const hasProfileImage = computed(() => Boolean(profile.value?.profile_image));

const coverHue = computed(() => {
  const name = profile.value?.name || "";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
});

const coverGradientStyle = computed(() => {
  const h = coverHue.value;
  return {
    background: [
      `radial-gradient(at 15% 15%, oklch(0.78 0.26 ${h}) 0%, transparent 50%)`,
      `radial-gradient(at 85% 80%, oklch(0.52 0.28 ${(h + 30) % 360}) 0%, transparent 50%)`,
      `radial-gradient(at 60% 40%, oklch(0.65 0.3 ${(h + 12) % 360}) 0%, transparent 55%)`,
      `oklch(0.45 0.2 ${(h + 18) % 360})`,
    ].join(", "),
  };
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
    // Skip exact "Email"/"WhatsApp" - rendered in dedicated contact buttons.
    // Variants like "WhatsApp Sales" flow into custom links.
    if (labelLower === "email" || labelLower === "whatsapp") continue;

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
      url: "/ticket",
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

const qrCodeText = computed(() => {
  const siteUrl = useAppConfig()
    .app.url.replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  return `${siteUrl}${route.path}`;
});

const getSocialIcon = (label) =>
  SOCIAL_ICON_MAP[label?.toLowerCase()] || "hugeicons:link-02";

const { trackVisit, trackClick } = useProfileTracking(() => profile.value?.id);

watchEffect(() => {
  if (profile.value?.id) trackVisit();
});

usePageMeta(null, {
  title: computed(() => `Links · ${profile.value?.name || ""}`),
});
</script>
