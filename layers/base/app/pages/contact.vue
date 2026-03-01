<template>
  <div class="min-h-screen-offset container max-w-lg pt-6 pb-16">
    <ContactForm
      :title="content.title"
      :description="content.description"
      subject="Contact Form"
    />
  </div>
</template>

<script setup>
usePageMeta("contact");
const content = computed(() => useContentStore().components.contact);
</script>
