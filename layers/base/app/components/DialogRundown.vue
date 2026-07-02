<template>
  <DialogResponsive
    v-model:open="isOpen"
    dialog-max-width="480px"
    :close-button-class="
      hasPoster ? 'bg-black/20 hover:bg-black/40 text-white/80' : ''
    "
    :flush-content="hasPoster"
  >
    <div v-if="hasPoster" class="bg-muted aspect-4/5 w-full overflow-hidden">
      <BlurImage
        :src="activity.poster_image.lg || activity.poster_image.url"
        :lqip="activity.poster_image.lqip || ''"
        alt=""
        image-class="size-full object-cover"
      />
    </div>
    <div
      class="text-foreground px-4 pb-16 sm:px-8 sm:pb-12"
      :class="hasPoster ? 'pt-4 sm:pt-6' : 'pt-2 sm:pt-12'"
    >
      <div class="flex flex-col gap-y-4">
        <div class="flex grow flex-col">
          <div
            v-if="activity.date_label_full"
            class="text-xl font-medium tracking-tight"
          >
            {{ activity.date_label_full }}
          </div>

          <div v-if="activity.location" class="mt-2 flex items-center gap-x-1">
            <IconLocation class="h-4 shrink-0" />
            <span class="text-base tracking-tight">{{
              activity.location
            }}</span>
          </div>

          <div
            v-if="activity.start_time || activity.end_time"
            class="mt-4 flex items-center"
          >
            <span
              class="border-foreground/25 flex shrink-0 items-center justify-center rounded-full border border-dashed p-2.5 text-center text-base"
            >
              {{ activity.start_time || "-" }}
            </span>

            <span class="border-foreground/25 grow border-b border-dashed"></span>

            <span
              class="border-foreground/25 flex shrink-0 items-center justify-center rounded-full border border-dashed p-2.5 text-center text-base"
            >
              {{ activity.end_time || finishLabel }}
            </span>
          </div>

          <div
            class="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl"
          >
            {{ activity.title }}
          </div>

          <p
            v-if="activity.theme"
            class="mt-2 text-base tracking-tight sm:text-lg"
          >
            {{ activity.theme }}
          </p>

          <p
            v-if="activity.subtitle"
            class="mt-2 text-base font-semibold tracking-tight"
          >
            {{ activity.subtitle }}
          </p>

          <div class="mt-2 flex flex-col gap-y-2">
            <div
              v-if="activity.categories?.length"
              class="flex items-center gap-x-1"
            >
              <IconTag class="h-4 shrink-0" />
              <span class="text-base tracking-tight">{{
                activity.categories.join(", ")
              }}</span>
            </div>

            <div
              v-if="speakersList.length === 1"
              class="text-base tracking-tight"
            >
              <span class="font-semibold">{{ $t("ui.speaker") }}:&nbsp;</span>
              <span class="font-medium">{{ speakersList[0].name }}</span>
              <span v-if="speakersList[0].title" class="text-muted-foreground"
                >, {{ speakersList[0].title }}</span
              >
              <span
                v-if="speakersList[0].organization"
                class="text-muted-foreground"
              >
                - {{ speakersList[0].organization }}</span
              >
            </div>

            <div
              v-else-if="speakersList.length"
              class="text-base tracking-tight"
            >
              <span class="font-semibold">{{ $t("ui.speakers") }}:</span>
              <ul class="mt-1 list-outside list-disc space-y-0.5 pl-4">
                <li v-for="(speaker, idx) in speakersList" :key="idx">
                  <span class="font-medium">{{ speaker.name }}</span>
                  <span v-if="speaker.title" class="text-muted-foreground"
                    >, {{ speaker.title }}</span
                  >
                  <span
                    v-if="speaker.organization"
                    class="text-muted-foreground"
                  >
                    - {{ speaker.organization }}</span
                  >
                </li>
              </ul>
            </div>

            <div v-if="activity.moderator" class="text-base tracking-tight">
              <span class="font-semibold">{{ $t("ui.moderator") }}:</span>
              {{ activity.moderator }}
            </div>

            <div v-if="panelistNames.length" class="text-base tracking-tight">
              <span class="font-semibold">{{ $t("ui.panelists") }}:</span>
              <ul class="mt-1 list-outside list-disc space-y-0.5 pl-4">
                <li v-for="(name, idx) in panelistNames" :key="idx">
                  {{ name }}
                </li>
              </ul>
            </div>

            <div v-if="activity.presented_by" class="flex items-start gap-x-1">
              <span class="text-base tracking-tight"
                >{{ $t("ui.presentedBy") }} {{ activity.presented_by }}</span
              >
            </div>
          </div>

          <div
            v-if="activity.description"
            class="mt-3 text-base leading-relaxed tracking-tight"
            v-html="activity.description"
          />
        </div>
      </div>
    </div>
  </DialogResponsive>
</template>

<script setup>
const uiStore = useUiStore();
const { t, te, locale } = useI18n();

const activity = computed(() => uiStore.dialogRundown.data ?? {});

const hasPoster = computed(() => !!activity.value.poster_image?.lg);

const finishLabel = computed(() => {
  if (te("rundown.finish")) return t("rundown.finish");
  return locale.value.startsWith("id") ? "Selesai" : "Finish";
});

const speakersList = computed(() => {
  if (Array.isArray(activity.value.speakers_list)) {
    return activity.value.speakers_list;
  }
  return (activity.value.speakers ?? [])
    .map((s) => {
      if (typeof s === "string")
        return { name: s, title: "", organization: "" };
      return {
        name: s?.name ?? "",
        title: s?.title ?? "",
        organization: s?.organization ?? "",
      };
    })
    .filter((s) => s.name);
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
