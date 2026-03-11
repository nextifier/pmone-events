<template>
  <div id="faq-page" class="min-h-screen-offset pt-6 pb-16">
    <FAQ />
  </div>
</template>

<script setup>
usePageMeta(null, {
  title: "FAQ",
  description:
    "Find answers to frequently asked questions about our event, including tickets, schedules, exhibitors, and event policies.",
});

// FAQPage structured data for Google Rich Results
const faq = useFAQStore();
const faqList = computed(() => unref(faq.list));

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: computed(() => {
        const list = faqList.value;
        if (!list?.length) return "{}";
        return JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: list.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: stripHtml(item.a),
            },
          })),
        });
      }),
    },
  ],
});
</script>
