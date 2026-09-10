<template>
  <!-- overflow-x-clip: a tilting guest photo projects ~15px past its box, which
       near the viewport edge lengthens the document into a horizontal scrollbar.
       `clip` (not `hidden`) drops it without making this a scroll container. -->
  <section id="guests" class="min-h-screen-offset overflow-x-clip pt-4 pb-16 lg:pt-10 lg:pb-24">
    <GuestList />
  </section>
</template>

<script setup>
const { te, t } = useI18n();
const appConfig = useAppConfig();

const username =
  appConfig.app.projectUsername || appConfig.app.dataSourceUsername;
const isGuestProject = username === "icc" || username === "inacon";
const fallbackTitle = isGuestProject ? "Guests" : "Speakers";

usePageMeta("guests", {
  title: () =>
    te("pages.guests.title") ? t("pages.guests.title") : fallbackTitle,
  description: () =>
    te("pages.guests.description") ? t("pages.guests.description") : "",
});

defineOptions({
  name: "guests",
});
</script>
