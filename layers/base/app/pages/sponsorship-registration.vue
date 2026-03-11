<template>
  <div class="min-h-screen-offset container max-w-lg pt-6 pb-16">
    <ContactForm
      :title="t('sponsorshipRegistration.title')"
      :description="t('sponsorshipRegistration.description')"
      :showBrandName="true"
      :showMessage="false"
      :submitLabel="t('ui.sendMessage')"
      subject="Sponsorship Registration"
    />

    <div class="mt-12 flex flex-col items-start">
      <h6
        class="text-primary text-lg font-semibold tracking-tighter sm:text-xl"
      >
        {{ t("contact.preferDirectContact") }}
      </h6>

      <div class="mt-3 flex flex-wrap gap-2">
        <NuxtLink
          v-for="(link, index) in links"
          :key="index"
          :to="link.to"
          :target="link.openInNewTab ? '_blank' : ''"
          class="text-primary bg-muted hover:bg-border flex items-center justify-center gap-x-1 rounded-lg px-4 py-2 text-sm font-semibold tracking-tighter"
        >
          <Icon
            v-if="link.iconName"
            :name="link.iconName"
            class="size-5 shrink-0"
          />
          <span>{{ link.label }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n();

usePageMeta(null, {
  title: computed(() => t("sponsorshipRegistration.title")),
  description: computed(() => t("sponsorshipRegistration.metaDescription")),
});

const links = [
  {
    label: "WhatsApp",
    to: `https://api.whatsapp.com/send?phone=${useAppConfig().contact.whatsapp}&text=Hai, ${useAppConfig().app.shortName}! I'd like to inquire about sponsorship opportunities.`,
    openInNewTab: true,
    iconName: "hugeicons:whatsapp",
  },
  {
    label: "Email",
    to: `mailto:${useAppConfig().contact.email}`,
    iconName: "hugeicons:mail-02",
  },
];
</script>
