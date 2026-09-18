<template>
  <!-- On a phone with the tab bar the corner starts above the bar
       (--app-bottom-inset). While the bar is scrolled away
       (body[data-chrome-hidden]) the button drops by the same distance on the
       bar's own timing, so the gap between them never changes. -->
  <div
    class="xs:right-[calc(var(--spacing)*4+var(--scrollbar-width,0px))] fixed right-[calc(var(--spacing)*3+var(--scrollbar-width,0px))] bottom-[calc(var(--app-bottom-inset,0px)+2rem)] z-50 transition-[translate] duration-(--panel-open-dur) ease-(--panel-ease) in-data-chrome-hidden:translate-y-(--app-bottom-inset) in-data-chrome-hidden:duration-(--panel-close-dur) motion-reduce:transition-none sm:right-[calc(var(--spacing)*6+var(--scrollbar-width,0px))] sm:bottom-[calc(var(--app-bottom-inset,0px)+1.25rem)] lg:bottom-12 xl:right-[calc(var(--spacing)*12+var(--scrollbar-width,0px))]"
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
