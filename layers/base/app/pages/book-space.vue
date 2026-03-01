<template>
  <div class="min-h-screen-offset container max-w-lg pt-6 pb-16">
    <ContactForm
      :title="content.title"
      :description="content.description"
      :showJobTitle="useAppConfig().settings.bookSpaceForm.showJobTitle"
      :showBrandName="useAppConfig().settings.bookSpaceForm.showBrandName"
      :showProducts="useAppConfig().settings.bookSpaceForm.showProducts"
      :showReferralSource="true"
      :showMessage="false"
      submitLabel="Submit"
      subject="Exhibitor Registration"
    />
  </div>
</template>

<script setup>
usePageMeta("bookSpace");
const content = computed(() => useContentStore().components.bookSpace);
</script>
