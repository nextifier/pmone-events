<template>
  <DialogResponsive
    v-model:open="isOpen"
    :dialog-max-width="activity.poster_image ? '600px' : '600px'"
  >
    <div class="px-4 pt-2 pb-10 sm:px-8 sm:pt-6 sm:pb-12">
      <div
        class="grid grid-cols-1 gap-x-8 gap-y-2"
        :class="{
          'sm:grid-cols-2': activity.poster_image,
        }"
      >
        <NuxtImg
          v-if="activity.poster_image?.lg"
          :src="activity.poster_image.lg"
          alt=""
          class="bg-muted h-full w-full rounded-xl object-cover"
          sizes="100vw sm:800px"
          width="1080"
          height="1350"
          loading="lazy"
          format="webp"
        />

        <div
          class="mt-2 flex grow flex-col"
          :class="{
            'sm:pt-4': activity.poster_image,
          }"
        >
          <div
            v-if="activity.date_label_full"
            class="text-foreground text-xl font-medium tracking-tight"
          >
            {{ activity.date_label_full }}
          </div>

          <div v-if="activity.location" class="mt-2 flex items-center gap-x-1">
            <IconLocation class="h-4 shrink-0" />
            <span class="text-sm tracking-tight sm:text-base">{{
              activity.location
            }}</span>
          </div>

          <div
            v-if="activity.start_time || activity.end_time"
            class="mt-4 flex items-center"
          >
            <span
              class="text-primary border-primary/25 flex shrink-0 items-center justify-center rounded-full border border-dashed p-2.5 text-center text-sm sm:text-base"
            >
              {{ activity.start_time || "—" }}
            </span>

            <span class="border-primary/25 grow border-b border-dashed"></span>

            <span
              class="text-primary border-primary/25 flex shrink-0 items-center justify-center rounded-full border border-dashed p-2.5 text-center text-sm sm:text-base"
            >
              {{ activity.end_time || "—" }}
            </span>
          </div>

          <div
            class="mt-3 text-3xl font-semibold tracking-[-0.04em] text-black sm:text-4xl dark:text-white"
          >
            {{ activity.title }}
          </div>

          <p
            v-if="activity.theme"
            class="mt-2 text-base tracking-tight text-gray-600 sm:text-lg dark:text-gray-300"
          >
            {{ activity.theme }}
          </p>

          <p
            v-if="activity.subtitle"
            class="text-foreground mt-2 text-base font-semibold tracking-tight"
          >
            {{ activity.subtitle }}
          </p>

          <div class="mt-2 flex flex-col gap-y-2">
            <div
              v-if="activity.categories?.length"
              class="flex items-center gap-x-1"
            >
              <IconTag class="h-4 shrink-0" />
              <span class="text-sm tracking-tight sm:text-base">{{
                activity.categories.join(", ")
              }}</span>
            </div>

            <div
              v-if="speakerNames.length"
              class="text-sm tracking-tight sm:text-base"
            >
              <span class="font-semibold">{{ $t("ui.speakers") }}:</span>
              {{ speakerNames.join(", ") }}
            </div>

            <div
              v-if="activity.moderator"
              class="text-sm tracking-tight sm:text-base"
            >
              <span class="font-semibold">{{ $t("ui.moderator") }}:</span>
              {{ activity.moderator }}
            </div>

            <div
              v-if="panelistNames.length"
              class="text-sm tracking-tight sm:text-base"
            >
              <span class="font-semibold">{{ $t("ui.panelists") }}:</span>
              <ul class="mt-1 list-outside list-disc space-y-0.5 pl-4">
                <li v-for="(name, idx) in panelistNames" :key="idx">
                  {{ name }}
                </li>
              </ul>
            </div>

            <div v-if="activity.presented_by" class="flex items-start gap-x-1">
              <span
                class="text-sm tracking-tight text-gray-500 sm:text-base dark:text-gray-400"
                >{{ $t("ui.presentedBy") }} {{ activity.presented_by }}</span
              >
            </div>
          </div>

          <div
            v-if="activity.description"
            class="mt-3 text-sm leading-relaxed tracking-tight sm:text-base"
            v-html="activity.description"
          />
        </div>
      </div>
    </div>
  </DialogResponsive>
</template>

<script setup>
const uiStore = useUiStore();

const activity = computed(() => uiStore.dialogRundown.data ?? {});

const speakerNames = computed(() => {
  if (Array.isArray(activity.value.speaker_names)) {
    return activity.value.speaker_names.filter(Boolean);
  }
  return (activity.value.speakers ?? [])
    .map((s) => (typeof s === "string" ? s : s?.name))
    .filter(Boolean);
});

const panelistNames = computed(() => {
  if (Array.isArray(activity.value.panelist_names)) {
    return activity.value.panelist_names.filter(Boolean);
  }
  return (activity.value.panelists ?? [])
    .map((p) => (typeof p === "string" ? p : p?.name))
    .filter(Boolean);
});

const isOpen = computed({
  get() {
    return uiStore.dialogRundown.isShow;
  },
  set(val) {
    uiStore.dialogRundown.isShow = val;
    if (!val) {
      uiStore.clearDialogRundown();
    }
  },
});
</script>
