<template>
  <div
    class="xs:right-[calc(var(--spacing)*4+var(--scrollbar-width,0px))] fixed right-[calc(var(--spacing)*3+var(--scrollbar-width,0px))] bottom-8 z-50 sm:right-[calc(var(--spacing)*6+var(--scrollbar-width,0px))] sm:bottom-5 lg:bottom-12 xl:right-[calc(var(--spacing)*12+var(--scrollbar-width,0px))]"
  >
    <NuxtLink
      v-if="whatsappLink"
      :to="whatsappLink"
      target="_blank"
      aria-label="Contact us"
      v-tippy="'Chat us 👋'"
    >
      <NuxtImg
        src="/img/etc/3d-wa-logo.webp"
        class="pointer-events-none size-[40px] select-none"
        width="40"
        height="40"
        alt="WhatsApp"
        format="webp"
      />
    </NuxtLink>
  </div>
</template>

<script setup>
const profile = useProjectProfile();
const shortName = useAppConfig().app.shortName;

const whatsappLink = computed(() =>
  profile.whatsappNumber
    ? `https://api.whatsapp.com/send?phone=${profile.whatsappNumber}&text=${encodeURIComponent(`Halo, ${shortName}!`)}`
    : "",
);
</script>
