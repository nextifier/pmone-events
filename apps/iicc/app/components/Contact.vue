<template>
  <section id="contact">
    <div class="container">
      <div class="flex flex-col items-center justify-center text-center">
        <h1 class="section-title">{{ t("contactSection.title") }}</h1>
        <p class="section-description mt-2">
          {{ t("contactSection.description") }}
        </p>

        <button
          @click="openContactDialog"
          class="bg-accent text-accent-foreground hover:bg-accent/80 mt-4 flex items-center justify-center rounded-xl px-5 py-2.5 font-medium tracking-tight transition active:scale-98"
          v-ripple
        >
          {{ t("contactSection.button") }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
const { t } = useI18n();
const uiStore = useUiStore();
const openContactDialog = () => {
  uiStore.openContactDialog();
};
</script>
