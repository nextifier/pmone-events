<template>
  <div id="faq-page" class="min-h-screen-offset pt-4 pb-16">
    <FAQ />
  </div>
</template>

<script setup>
usePageMeta(null, {
  title: "FAQ",
  description:
    "Find answers to frequently asked questions about our event, including tickets, schedules, exhibitors, and event policies.",
});

// FAQPage structured data is emitted by <FAQ /> from the PM One API data so it
// always matches what is displayed.
</script>
