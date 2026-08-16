<template>
  <div class="py-10 lg:py-16">
    <FAQ tag="h1" page="faq" />
  </div>
</template>

<script setup lang="ts">
import { faqsFor } from "~/data/faqs";

usePageMeta("faq");

defineOptions({ name: "faq" });

// The one place FAQPage is emitted. Branch hubs and package pages render the
// same questions but stay unmarked, so there is exactly one marked-up copy.
const { buildFaqPage, buildBreadcrumbList, emit } = useJsonLd();

emit([
  buildFaqPage(faqsFor("faq")),
  buildBreadcrumbList([
    { label: "Beranda", to: "/" },
    { label: "FAQ", to: "/faq" },
  ]),
]);
</script>
