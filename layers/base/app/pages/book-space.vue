<template>
  <div class="min-h-screen-offset container max-w-lg pt-6 pb-16">
    <ContactForm
      :title="content?.title"
      :description="content?.description"
      :showJobTitle="bookSpaceForm.showJobTitle"
      :showBrandName="bookSpaceForm.showBrandName"
      :showProducts="bookSpaceForm.showProducts"
      :showReferralSource="true"
      :showMessage="false"
      submitLabel="Submit"
      subject="Exhibitor Registration"
    />
  </div>
</template>

<script setup>
usePageMeta("bookSpace");
const content = computed(() => useContentStore().components.bookSpace ?? null);

// Optional form fields are configured per-project in PM One (website settings).
const projectSettings = useProjectSettings();
const bookSpaceForm = computed(() => projectSettings.bookSpaceForm);
</script>
