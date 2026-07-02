<template>
  <DialogResponsive
    v-model:open="isDialogOpen"
    :isResponsive="false"
    :overflowContent="true"
    :drawerCloseButton="false"
  >
    <template #default>
      <div class="container max-w-lg pb-16">
        <div class="grid grid-cols-1 gap-10">
          <ContactForm
            :title="dialogConfig.title"
            :description="dialogConfig.description"
            :submitLabel="dialogConfig.submitLabel"
            :subject="dialogConfig.subject"
          />

          <div v-if="links.length" class="flex flex-col items-start">
            <h6
              class="text-foreground text-lg font-semibold tracking-tighter sm:text-xl"
            >
              Prefer to Connect Directly?
            </h6>

            <div class="mt-3 flex flex-wrap gap-2">
              <NuxtLink
                v-for="(link, index) in links"
                :key="index"
                :to="link.to"
                :target="link.openInNewTab ? '_blank' : ''"
                class="text-foreground bg-muted hover:bg-border flex items-center justify-center gap-x-1 rounded-lg px-4 py-2 text-sm font-semibold tracking-tighter"
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
      </div>
    </template>
  </DialogResponsive>
</template>

<script setup>
const uiStore = useUiStore();
const appConfig = useAppConfig();
const profile = useProjectProfile();

const isDialogOpen = computed({
  get() {
    return uiStore.isContactDialogOpen;
  },
  set(value) {
    if (value) {
      uiStore.openContactDialog();
    } else {
      uiStore.closeContactDialog();
    }
  },
});

const dialogConfig = computed(() => {
  const base = appConfig.contactDialog || {};
  return {
    title: base.title || "Get in Touch",
    description:
      base.description ||
      "We'd love to hear from you. Leave your contact details and our team will reach out soon.",
    submitLabel: base.submitLabel || "Submit",
    subject: base.subject || "Contact Inquiry",
  };
});

const links = computed(() => {
  const result = [];
  const whatsappNumber = profile.whatsappMarketingNumber || profile.whatsappNumber;
  const shortName = appConfig.app?.shortName || appConfig.app?.name || "";

  if (whatsappNumber) {
    result.push({
      label: "WhatsApp",
      to: `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(`Hi, ${shortName}!`)}`,
      openInNewTab: true,
      iconName: "hugeicons:whatsapp",
    });
  }

  if (profile.email) {
    result.push({
      label: "Email",
      to: `mailto:${profile.email}`,
      iconName: "hugeicons:mail-02",
    });
  }

  return result;
});
</script>
