<template>
  <div>
    <div
      v-if="loading"
      class="min-h-screen-offset grid place-items-center"
    >
      <Spinner class="size-5 shrink-0" />
    </div>

    <div
      v-else-if="profile"
      class="min-h-screen-offset mx-auto flex max-w-xl flex-col px-4 pb-16 sm:pt-4"
    >
      <div class="relative -mx-4">
        <div
          class="aspect-[3/1] outline-primary/5 @container relative flex items-center justify-center overflow-hidden outline -outline-offset-1 sm:rounded-xl"
          :style="!hasCoverImage && !hasProfileImage ? coverGradientStyle : undefined"
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
      </div>

      <div class="-mt-12 flex grow flex-col justify-between gap-y-8 lg:-mt-16">
        <div class="flex flex-col gap-y-6">
          <div class="flex flex-col items-start gap-y-2">
            <div class="relative isolate">
              <div class="ring-background rounded-full ring-4">
                <Avatar
                  :model="profile"
                  size="md"
                  rounded="rounded-full"
                  :no-tooltip="true"
                  class="size-24 lg:size-32"
                />
              </div>
            </div>

            <div class="space-y-0.5">
              <h1 class="line-clamp-2 text-xl font-semibold tracking-tighter">
                {{ profile.name }}
              </h1>
              <p class="text-muted-foreground text-sm tracking-tight">
                @{{ profile.username }}
              </p>
            </div>

            <p
              v-if="profile.bio"
              class="text-sm leading-relaxed tracking-tight"
            >
              {{ profile.bio }}
            </p>

            <div
              v-if="hasContactMethods"
              class="mt-1.5 flex flex-wrap gap-2"
            >
              <NuxtLink
                v-for="phone in phoneNumbers"
                :key="phone.number"
                :to="`https://wa.me/${phone.number.replace(/\D/g, '')}`"
                target="_blank"
                @click="trackClick(phone.label || 'WhatsApp')"
                @contextmenu.prevent
                class="bg-primary text-primary-foreground hover:bg-primary/80 flex items-center justify-center gap-x-1.5 rounded-lg px-3 py-2 text-sm font-semibold tracking-tight transition active:scale-98"
              >
                <Icon name="hugeicons:whatsapp" class="size-4.5 shrink-0" />
                <span>{{ phone.label || "WhatsApp" }}</span>
              </NuxtLink>

              <NuxtLink
                v-if="profile.email"
                :to="`mailto:${profile.email}`"
                @click="trackClick('Email')"
                @contextmenu.prevent
                class="bg-muted text-foreground hover:bg-border flex items-center justify-center gap-x-1.5 rounded-lg px-3 py-2 text-sm font-semibold tracking-tight transition active:scale-98"
              >
                <Icon name="hugeicons:mail-02" class="size-4.5 shrink-0" />
                <span>Email</span>
              </NuxtLink>
            </div>
          </div>

          <div
            v-if="socialLinks.length > 0"
            class="flex flex-wrap gap-2"
          >
            <NuxtLink
              v-for="link in socialLinks"
              :key="link.url || link.id"
              :to="link.url || '#'"
              :target="link.url?.startsWith('http') ? '_blank' : ''"
              @click="trackClick(link.label)"
              @contextmenu.prevent
              v-tippy="link.label"
              class="bg-muted text-foreground hover:bg-border flex size-12 shrink-0 items-center justify-center rounded-full transition active:scale-98"
            >
              <Icon :name="getSocialIcon(link.label)" class="size-5" />
            </NuxtLink>
          </div>

          <div class="flex flex-col gap-y-3">
            <NuxtLink
              v-for="link in primaryLinks"
              :key="link.label"
              :to="link.url"
              :target="link.url.startsWith('http') ? '_blank' : ''"
              @click="trackClick(link.label)"
              @contextmenu.prevent
              v-ripple
              class="border-border bg-muted text-primary flex items-center justify-center gap-x-1.5 rounded-xl border p-4 text-center text-base font-medium tracking-tighter transition active:scale-98"
            >
              <Icon
                v-if="link.iconName"
                :name="link.iconName"
                class="size-5"
              />
              <span>{{ link.label }}</span>
            </NuxtLink>

            <NuxtLink
              v-for="link in customLinks"
              :key="link.url || link.id"
              :to="link.url || '#'"
              :target="link.url?.startsWith('http') ? '_blank' : ''"
              @click="trackClick(link.label)"
              @contextmenu.prevent
              class="bg-muted text-foreground hover:bg-border flex h-9 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-medium tracking-tight transition active:scale-98"
            >
              {{ link.label }}
            </NuxtLink>
          </div>
        </div>

        <div class="mt-auto flex items-end justify-between gap-2 pb-8">
          <div></div>

          <ClientOnly>
            <div class="flex flex-col items-end gap-y-3 text-center">
              <QRCode :url="qrCodeUrl" class="size-24" />
              <p class="text-muted-foreground text-xs tracking-tight sm:text-sm">
                {{ qrCodeText }}
              </p>
            </div>
          </ClientOnly>
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

const [{ data: projectData }, { data: activeEvent }] = await Promise.all([
  useFetch("/api/project/profile", { key: "links-project-profile" }),
  useFetch("/api/event/active", { key: "links-active-event" }),
]);

const loading = computed(() => !projectData.value);
const profile = computed(() => projectData.value?.data || null);

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

const socialLinks = computed(() => {
  const links = profile.value?.links || [];
  return links.filter((link) => {
    if (!link?.label) return false;
    const labelLower = link.label.toLowerCase();
    if (
      labelLower === "email" ||
      labelLower === "whatsapp" ||
      labelLower.startsWith("whatsapp ")
    ) {
      return false;
    }
    return SOCIAL_LABELS.includes(labelLower);
  });
});

const customLinks = computed(() => {
  const links = profile.value?.links || [];
  return links.filter((link) => {
    if (!link?.label) return false;
    const labelLower = link.label.toLowerCase();
    if (
      labelLower === "email" ||
      labelLower === "whatsapp" ||
      labelLower.startsWith("whatsapp ")
    ) {
      return false;
    }
    return !SOCIAL_LABELS.includes(labelLower);
  });
});

const primaryLinks = computed(() => {
  const items = [
    {
      label: "Tickets",
      url: "/ticket",
      iconName: "hugeicons:ticket-01",
    },
    {
      label: "Brands",
      url: "/brands",
      iconName: "hugeicons:grid-view",
    },
    {
      label: "Rundown",
      url: "/rundown",
      iconName: "hugeicons:check-list",
    },
  ];

  const eguideUrl = activeEvent.value?.data?.visitor_eguide?.url;
  if (eguideUrl) {
    items.push({
      label: "Download Visitor E-Guide",
      url: eguideUrl,
      iconName: "hugeicons:download-01",
    });
  }

  return items;
});

const qrCodeUrl = computed(() => {
  if (!import.meta.client) return "";
  return `${window.location.origin}${route.path}`;
});

const qrCodeText = computed(() => {
  const siteUrl = useAppConfig().app.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `${siteUrl}${route.path}`;
});

const getSocialIcon = (label) =>
  SOCIAL_ICON_MAP[label?.toLowerCase()] || "hugeicons:link-02";

const { trackVisit, trackClick } = useProfileTracking(() => profile.value?.id);

onMounted(() => {
  if (profile.value?.id) {
    trackVisit();
  }
});

watch(
  () => profile.value?.id,
  (id) => {
    if (id) trackVisit();
  }
);

usePageMeta(null, {
  title: computed(() => `Links · ${profile.value?.name || ""}`),
});
</script>
